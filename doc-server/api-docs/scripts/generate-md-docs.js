const fs = require('fs');
const { fetchSchema } = require('./lib/schema-fetcher');
const { classifyField, classifyFields } = require('./lib/grouper');
const { classifyTypes } = require('./lib/type-classifier');
const { renderMarkdown } = require('./lib/markdown-renderer');
const groups = require('./config/groups');
const examples = require('./config/examples');
const getGettingStarted = require('./templates/getting-started');

async function generateMarkdownDocs() {
  console.log('Fetching schema from Hasura...');
  const schema = await fetchSchema();

  console.log('Classifying queries...');
  const classifiedQueries = classifyFields(schema.getQueryType(), 'query', groups);

  console.log('Classifying mutations...');
  const classifiedMutations = classifyFields(schema.getMutationType(), 'mutation', groups);

  console.log('Classifying subscriptions...');
  const classifiedSubscriptions = classifyFields(schema.getSubscriptionType(), 'subscription', groups);

  console.log('Classifying types...');
  const classifiedTypes = classifyTypes(schema.getTypeMap(), groups, classifyField);

  console.log('Rendering markdown...');
  const markdown = renderMarkdown({
    gettingStarted: getGettingStarted(),
    examples,
    groups,
    classifiedQueries,
    classifiedMutations,
    classifiedSubscriptions,
    classifiedTypes,
  });

  fs.writeFileSync('../docs/features/api.md', markdown);

  // Print summary
  const countAll = (classified) => Object.values(classified).reduce((sum, items) => sum + items.length, 0);
  console.log(`\nGeneration complete!`);
  console.log(`  Queries:       ${countAll(classifiedQueries)}`);
  console.log(`  Mutations:     ${countAll(classifiedMutations)}`);
  console.log(`  Subscriptions: ${countAll(classifiedSubscriptions)}`);
  console.log(`  Core Types:    ${countAll(classifiedTypes.core)}`);
  console.log(`  Helper Types:  ${countAll(classifiedTypes.helper)}`);
  console.log(`\nOutput: ./docs/api.md`);
}

generateMarkdownDocs().catch(console.error);
