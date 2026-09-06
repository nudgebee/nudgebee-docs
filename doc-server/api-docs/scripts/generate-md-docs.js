const fs = require('fs');
const path = require('path');
const { parse, validate } = require('graphql');
const { fetchSchema } = require('./lib/schema-fetcher');
const { classifyField, classifyFields } = require('./lib/grouper');
const { classifyTypes } = require('./lib/type-classifier');
const { renderMarkdown } = require('./lib/markdown-renderer');
const groups = require('./config/groups');
const examples = require('./config/examples');
const getGettingStarted = require('./templates/getting-started');

/**
 * Actions the gateway routes but the schema does not declare.
 *
 * actions.yaml is the routing table; actions.graphql is the type surface. An
 * action can appear in the first without the second — the gateway only needs
 * the SDL for input coercion — so generating from the schema alone silently
 * drops those actions from the reference. Read the routing table beside the
 * schema and list the difference instead.
 *
 * Parsed with a line scanner rather than a YAML dependency: the two keys we
 * need (`- name:` and its `comment:`) sit at fixed depths, and the file is the
 * generator's only YAML input.
 */
function readRoutedActions(sdlPath) {
  const yamlPath = path.join(path.dirname(sdlPath), 'actions.yaml');
  let raw;
  try {
    raw = fs.readFileSync(yamlPath, 'utf8');
  } catch (err) {
    console.warn(`[actions] Could not read ${yamlPath} (${err.message}) — the reference will not list undeclared actions.`);
    return [];
  }

  const actions = [];
  let current = null;
  for (const line of raw.split('\n')) {
    // Exactly two spaces: an action entry. Header entries under a `headers:`
    // block use the same `- name:` key at a deeper indent and must not count.
    const name = line.match(/^ {2}- name:\s*(\S+)/);
    if (name) {
      current = { name: name[1], comment: '' };
      actions.push(current);
      continue;
    }
    const comment = line.match(/^ {4}comment:\s*(.+)$/);
    if (comment && current && !current.comment) {
      current.comment = comment[1].trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return actions;
}

/**
 * Validates every worked example against the schema before it is published.
 *
 * The hand-written examples are the first thing an integrator copies, and
 * nothing else checks them: the previous set was written for the Hasura schema
 * and stayed in the reference long after that layer was removed. Failing the
 * generation is the point — a wrong example is worse than a late one.
 */
function assertExamplesValid(schema, examples) {
  const failures = [];
  for (const example of examples) {
    try {
      const errors = validate(schema, parse(example.query));
      if (errors.length > 0) {
        failures.push(`${example.title}: ${errors.map((e) => e.message).join('; ')}`);
      }
    } catch (err) {
      failures.push(`${example.title}: ${err.message.split('\n')[0]}`);
    }
  }
  if (failures.length > 0) {
    throw new Error(
      `${failures.length} example(s) do not validate against the schema:\n  - ${failures.join('\n  - ')}\n` +
        'Fix them in api-docs/scripts/config/examples.js before regenerating.'
    );
  }
  console.log(`Validated ${examples.length} examples against the schema.`);
}

async function generateMarkdownDocs() {
  const sdlPath = process.env.ACTIONS_GRAPHQL_PATH;
  console.log(`Loading schema from ${sdlPath}...`);
  const schema = await fetchSchema();

  assertExamplesValid(schema, examples);

  console.log('Classifying queries...');
  const classifiedQueries = classifyFields(schema.getQueryType(), 'query', groups);

  console.log('Classifying mutations...');
  const classifiedMutations = classifyFields(schema.getMutationType(), 'mutation', groups);

  console.log('Classifying subscriptions...');
  const classifiedSubscriptions = classifyFields(schema.getSubscriptionType(), 'subscription', groups);

  console.log('Classifying types...');
  const classifiedTypes = classifyTypes(schema.getTypeMap(), groups, classifyField);

  console.log('Reconciling against the routing table...');
  const declared = new Set([
    ...Object.keys(schema.getQueryType() ? schema.getQueryType().getFields() : {}),
    ...Object.keys(schema.getMutationType() ? schema.getMutationType().getFields() : {}),
    ...Object.keys(schema.getSubscriptionType() ? schema.getSubscriptionType().getFields() : {}),
  ]);
  const routed = readRoutedActions(sdlPath);
  const undeclaredActions = routed.filter((a) => !declared.has(a.name));

  console.log('Rendering markdown...');
  const markdown = renderMarkdown({
    gettingStarted: getGettingStarted(),
    examples,
    groups,
    classifiedQueries,
    classifiedMutations,
    classifiedSubscriptions,
    classifiedTypes,
    undeclaredActions,
  });

  fs.writeFileSync('./docs/api-docs/index.md', markdown);

  // Print summary
  const countAll = (classified) => Object.values(classified).reduce((sum, items) => sum + items.length, 0);
  console.log(`\nGeneration complete!`);
  console.log(`  Queries:       ${countAll(classifiedQueries)}`);
  console.log(`  Mutations:     ${countAll(classifiedMutations)}`);
  console.log(`  Subscriptions: ${countAll(classifiedSubscriptions)}`);
  console.log(`  Core Types:    ${countAll(classifiedTypes.core)}`);
  console.log(`  Helper Types:  ${countAll(classifiedTypes.helper)}`);
  console.log(`  Routed actions: ${routed.length} (${undeclaredActions.length} with no schema entry)`);
  console.log(`\nOutput: ./docs/api-docs/index.md`);
}

generateMarkdownDocs().catch(console.error);
