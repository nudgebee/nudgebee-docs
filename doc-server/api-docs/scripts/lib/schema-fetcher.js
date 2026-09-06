const fs = require('fs');
const { parse, buildASTSchema, visit } = require('graphql');

/**
 * Loads the API schema the reference is generated from.
 *
 * This used to introspect a live Hasura endpoint. That endpoint no longer
 * exists: the API is served by the in-app RPC gateway, which dispatches named
 * actions rather than Hasura table queries. The generator went stale in
 * February 2026 and nothing noticed, because a broken data source looks the
 * same as "nobody ran it".
 *
 * The current source of truth is `app/src/lib/actions.graphql` in the
 * application repo — the SDL the gateway itself parses to route and coerce
 * every action. Reading the file means generation needs no running service and
 * no admin secret.
 *
 * Point ACTIONS_GRAPHQL_PATH at that file:
 *
 *   ACTIONS_GRAPHQL_PATH=../nudgebee/app/src/lib/actions.graphql npm run docs
 *
 * Two things about the file shape. It emits one `type Query { … }` /
 * `type Mutation { … }` block PER ACTION rather than one block listing every
 * field, and it references scalars (`jsonb`, `timestamptz`, …) it never
 * declares — both are fine for the gateway, which only walks the AST, but
 * neither builds as a schema. `loadSchemaFromSDL` normalizes both.
 */

/** Root types whose repeated definitions are merged into one. */
const ROOT_TYPES = new Set(['Query', 'Mutation', 'Subscription']);

/** Built-in scalars that never need declaring. */
const BUILT_IN_SCALARS = new Set(['String', 'Int', 'Float', 'Boolean', 'ID']);

/**
 * Turns the gateway's SDL into a buildable GraphQLSchema.
 *
 * Returns `{ schema, warnings }` — warnings name anything the normalization had
 * to paper over, so a real schema defect shows up in the generator's output
 * instead of being silently absorbed.
 */
function loadSchemaFromSDL(sdl) {
  const doc = parse(sdl, { noLocation: true });
  const warnings = [];

  // 1. Declare scalars the SDL uses but never defines.
  const declared = new Set(BUILT_IN_SCALARS);
  for (const def of doc.definitions) {
    if (def.name) declared.add(def.name.value);
  }
  const used = new Set();
  visit(doc, {
    NamedType(node) {
      used.add(node.name.value);
    },
  });
  const undeclared = [...used].filter((name) => !declared.has(name)).sort();
  const scalarDefs = undeclared.length
    ? parse(undeclared.map((name) => `scalar ${name}`).join('\n'), { noLocation: true }).definitions
    : [];

  // 2. Merge the per-action root-type blocks into one definition each, and drop
  //    any repeated field. A duplicate is a defect in the SDL, not something to
  //    normalize away quietly, so each one is reported.
  const roots = new Map();
  const definitions = [];
  for (const def of [...doc.definitions, ...scalarDefs]) {
    if (def.kind !== 'ObjectTypeDefinition' || !ROOT_TYPES.has(def.name.value)) {
      definitions.push(def);
      continue;
    }
    const name = def.name.value;
    let merged = roots.get(name);
    if (!merged) {
      merged = { ...def, fields: [] };
      roots.set(name, merged);
      definitions.push(merged);
    }
    for (const field of def.fields || []) {
      if (merged.fields.some((existing) => existing.name.value === field.name.value)) {
        warnings.push(`duplicate field ${name}.${field.name.value} — keeping the first`);
        continue;
      }
      merged.fields.push(field);
    }
  }

  return {
    schema: buildASTSchema({ kind: 'Document', definitions }),
    warnings,
  };
}

async function fetchSchema() {
  const sdlPath = process.env.ACTIONS_GRAPHQL_PATH;
  if (!sdlPath) {
    throw new Error(
      'ACTIONS_GRAPHQL_PATH is required. Point it at app/src/lib/actions.graphql in the application repo, e.g.\n' +
        '  ACTIONS_GRAPHQL_PATH=../nudgebee/app/src/lib/actions.graphql npm run docs'
    );
  }

  let sdl;
  try {
    sdl = fs.readFileSync(sdlPath, 'utf8');
  } catch (err) {
    throw new Error(`Could not read the action schema at ${sdlPath}: ${err.message}`);
  }

  let loaded;
  try {
    loaded = loadSchemaFromSDL(sdl);
  } catch (err) {
    throw new Error(`Could not build a schema from ${sdlPath}: ${err.message}`);
  }

  for (const warning of loaded.warnings) {
    console.warn(`[schema] ${warning}`);
  }
  return loaded.schema;
}

module.exports = { fetchSchema, loadSchemaFromSDL };
