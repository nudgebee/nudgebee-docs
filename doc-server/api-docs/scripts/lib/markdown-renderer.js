const getGettingStarted = require('../templates/getting-started');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function countItems(classified) {
  let total = 0;
  for (const items of Object.values(classified)) {
    total += items.length;
  }
  return total;
}

function renderFieldEntry(name, field, headingLevel) {
  const prefix = '#'.repeat(headingLevel);
  let md = `${prefix} ${name}\n\n`;

  if (field.description) {
    md += `${field.description}\n\n`;
  }

  if (field.args && field.args.length > 0) {
    md += '**Arguments:**\n\n';
    field.args.forEach((arg) => {
      md += `- \`${arg.name}\`: \`${arg.type}\`${arg.description ? ` - ${arg.description}` : ''}\n`;
    });
    md += '\n';
  }

  md += `**Returns:** \`${field.type}\`\n\n`;
  md += '---\n\n';
  return md;
}

function renderTypeEntry(name, type, headingLevel) {
  const prefix = '#'.repeat(headingLevel);
  let md = `${prefix} ${name}\n\n`;

  if (type.description) {
    md += `${type.description}\n\n`;
  }

  if (type.getFields) {
    md += '**Fields:**\n\n';
    const fields = type.getFields();
    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      md += `- \`${fieldName}\`: \`${field.type}\`${field.description ? ` - ${field.description}` : ''}\n`;
    });
    md += '\n';
  }

  if (type.getValues) {
    md += '**Values:**\n\n';
    type.getValues().forEach((value) => {
      md += `- \`${value.name}\`${value.description ? ` - ${value.description}` : ''}\n`;
    });
    md += '\n';
  }

  return md;
}

function renderExamples(examples, groups) {
  let md = '## Common Examples\n\n';
  md += 'Copy-pasteable examples for the most common operations.\n\n';

  const groupMap = {};
  groups.forEach((g) => {
    groupMap[g.id] = g.title;
  });

  examples.forEach((example) => {
    const groupTitle = groupMap[example.groupId] || example.groupId;
    md += `### ${example.title}\n\n`;
    md += `**Category:** ${groupTitle}\n\n`;
    md += `${example.description}\n\n`;
    md += '```graphql\n';
    md += example.query;
    md += '\n```\n\n';

    if (example.variables) {
      md += '**Variables:**\n\n';
      md += '```json\n';
      md += example.variables;
      md += '\n```\n\n';
    }

    md += '---\n\n';
  });

  return md;
}

function renderGroupedOperations(sectionTitle, classified, groups, headingLevel) {
  const sectionSlug = slugify(sectionTitle);
  let md = `## ${sectionTitle}\n\n`;

  // Render each group that has items
  for (const group of groups) {
    const items = classified[group.id];
    if (!items || items.length === 0) continue;

    const groupSlug = `${sectionSlug}--${slugify(group.title)}`;
    md += `### ${group.title} {#${groupSlug}}\n\n`;
    md += `*${group.description}*\n\n`;

    items.forEach(({ name, field }) => {
      md += renderFieldEntry(name, field, headingLevel);
    });
  }

  // Render "Other" group
  const otherItems = classified['other'];
  if (otherItems && otherItems.length > 0) {
    md += `### Other {#${sectionSlug}--other}\n\n`;
    md += '*Uncategorized operations.*\n\n';
    otherItems.forEach(({ name, field }) => {
      md += renderFieldEntry(name, field, headingLevel);
    });
  }

  return md;
}

function renderTypes(classifiedTypes, groups) {
  let md = '## Types\n\n';

  // Core types
  md += '### Core Types\n\n';
  md += 'Primary entity types, response types, and enums.\n\n';

  for (const group of groups) {
    const items = classifiedTypes.core[group.id];
    if (!items || items.length === 0) continue;

    md += `#### ${group.title}\n\n`;
    items.forEach(({ name, type }) => {
      md += renderTypeEntry(name, type, 5);
    });
  }

  const otherCore = classifiedTypes.core['other'];
  if (otherCore && otherCore.length > 0) {
    md += '#### Other\n\n';
    otherCore.forEach(({ name, type }) => {
      md += renderTypeEntry(name, type, 5);
    });
  }

  // Helper types in collapsible sections
  md += '### Helper Types (Filter, Input, Ordering)\n\n';
  md += 'Auto-generated types for filtering, sorting, and input operations. Expand each category to view.\n\n';

  for (const group of groups) {
    const items = classifiedTypes.helper[group.id];
    if (!items || items.length === 0) continue;

    md += `<details>\n<summary><strong>${group.title}</strong> (${items.length} types)</summary>\n\n`;
    items.forEach(({ name, type }) => {
      md += renderTypeEntry(name, type, 4);
    });
    md += '</details>\n\n';
  }

  const otherHelper = classifiedTypes.helper['other'];
  if (otherHelper && otherHelper.length > 0) {
    md += `<details>\n<summary><strong>Other</strong> (${otherHelper.length} types)</summary>\n\n`;
    otherHelper.forEach(({ name, type }) => {
      md += renderTypeEntry(name, type, 4);
    });
    md += '</details>\n\n';
  }

  return md;
}

function renderTOC(groups, classifiedQueries, classifiedMutations, classifiedSubscriptions, classifiedTypes, undeclaredActions) {
  let md = '## Table of Contents\n\n';

  md += '- [Getting Started](#getting-started)\n';
  md += '  - [Authentication](#authentication)\n';
  md += '  - [List Cloud Accounts Example](#list-cloud-accounts-example)\n';
  md += '  - [Errors](#errors)\n';
  md += '- [Common Examples](#common-examples)\n';

  // Queries TOC
  const queryTotal = countItems(classifiedQueries);
  md += `- [Queries](#queries) (${queryTotal} total)\n`;
  for (const group of groups) {
    const count = (classifiedQueries[group.id] || []).length;
    if (count === 0) continue;
    md += `  - [${group.title}](#queries--${slugify(group.title)}) (${count})\n`;
  }
  if ((classifiedQueries['other'] || []).length > 0) {
    md += `  - [Other](#queries--other) (${classifiedQueries['other'].length})\n`;
  }

  // Mutations TOC
  const mutationTotal = countItems(classifiedMutations);
  md += `- [Mutations](#mutations) (${mutationTotal} total)\n`;
  for (const group of groups) {
    const count = (classifiedMutations[group.id] || []).length;
    if (count === 0) continue;
    md += `  - [${group.title}](#mutations--${slugify(group.title)}) (${count})\n`;
  }
  if ((classifiedMutations['other'] || []).length > 0) {
    md += `  - [Other](#mutations--other) (${classifiedMutations['other'].length})\n`;
  }

  // Subscriptions TOC
  const subTotal = countItems(classifiedSubscriptions);
  md += `- [Subscriptions](#subscriptions) (${subTotal} total)\n`;
  for (const group of groups) {
    const count = (classifiedSubscriptions[group.id] || []).length;
    if (count === 0) continue;
    md += `  - [${group.title}](#subscriptions--${slugify(group.title)}) (${count})\n`;
  }
  if ((classifiedSubscriptions['other'] || []).length > 0) {
    md += `  - [Other](#subscriptions--other) (${classifiedSubscriptions['other'].length})\n`;
  }

  // Undeclared actions TOC
  if (undeclaredActions && undeclaredActions.length > 0) {
    md += `- [Actions Without a Schema Entry](#actions-without-a-schema-entry) (${undeclaredActions.length})\n`;
  }

  // Types TOC
  let coreTotal = 0;
  let helperTotal = 0;
  for (const items of Object.values(classifiedTypes.core)) coreTotal += items.length;
  for (const items of Object.values(classifiedTypes.helper)) helperTotal += items.length;

  md += `- [Types](#types) (${coreTotal + helperTotal} total)\n`;
  md += `  - [Core Types](#core-types) (${coreTotal})\n`;
  md += `  - [Helper Types](#helper-types-filter-input-ordering) (${helperTotal})\n`;

  md += '\n';
  return md;
}

/**
 * Escapes one free-text value for a Markdown table cell.
 *
 * Order matters: backslashes go first, or escaping the pipe would itself be
 * neutralised by a trailing backslash already in the text (`a\\` + `|` renders
 * as an escaped backslash followed by a live column separator). Newlines are
 * collapsed for the same reason — a row ends at the line break.
 */
function escapeTableCell(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\s*[\r\n]+\s*/g, ' ')
    .trim();
}

/**
 * Actions the gateway routes that have no definition in the SDL.
 *
 * `actions.yaml` is the routing table and `actions.graphql` is the type
 * surface, and the two are not in lockstep: an action can be routed without a
 * schema entry (the gateway only needs the SDL for input coercion on its
 * bypass path). Those actions are callable and undocumented, which is exactly
 * the gap that let this reference drift unnoticed — so they are listed rather
 * than quietly omitted, with the one-line description actions.yaml carries.
 */
function renderUndeclaredActions(actions) {
  if (!actions || actions.length === 0) return '';

  let md = '\n## Actions Without a Schema Entry\n\n';
  md += `These ${actions.length} actions are routed by the gateway but declare no types in the schema, `;
  md += 'so they have no signature above. They are callable; their arguments and response shape have to be ';
  md += 'confirmed against a live environment. Descriptions come from the routing table.\n\n';
  md += '| Action | Description |\n|---|---|\n';
  for (const action of actions) {
    const comment = escapeTableCell(action.comment);
    md += `| \`${action.name}\` | ${comment} |\n`;
  }
  md += '\n---\n';
  return md;
}

function renderMarkdown({ gettingStarted, examples, groups, classifiedQueries, classifiedMutations, classifiedSubscriptions, classifiedTypes, undeclaredActions }) {
  let md = '# Nudgebee GraphQL API Documentation\n\n';
  md += `Generated on: ${new Date().toISOString()}\n\n`;

  // Table of Contents
  md += renderTOC(groups, classifiedQueries, classifiedMutations, classifiedSubscriptions, classifiedTypes, undeclaredActions);

  // Getting Started
  md += gettingStarted || getGettingStarted();

  // Common Examples
  md += renderExamples(examples, groups);

  // Queries
  md += renderGroupedOperations('Queries', classifiedQueries, groups, 4);

  // Mutations
  md += renderGroupedOperations('Mutations', classifiedMutations, groups, 4);

  // Subscriptions
  md += renderGroupedOperations('Subscriptions', classifiedSubscriptions, groups, 4);

  // Actions routed but not declared in the schema
  md += renderUndeclaredActions(undeclaredActions);

  // Types
  md += renderTypes(classifiedTypes, groups);

  return md;
}

module.exports = { renderMarkdown };
