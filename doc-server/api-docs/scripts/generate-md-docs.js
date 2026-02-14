const fs = require('fs');
const { buildClientSchema, getIntrospectionQuery } = require('graphql');
const fetch = require('node-fetch');

async function generateMarkdownDocs() {
  // Fetch schema from Hasura
  const HASURA_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql';
  const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

  if (!HASURA_ADMIN_SECRET) {
    throw new Error('HASURA_ADMIN_SECRET environment variable is required');
  }

  const response = await fetch(HASURA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET
    },
    body: JSON.stringify({
      query: getIntrospectionQuery()
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}. Body: ${errorText}`);
  }

  const { data, errors } = await response.json();
  if (errors || !data) {
    throw new Error(`GraphQL introspection query failed: ${JSON.stringify(errors || 'No data returned', null, 2)}`);
  }
  const schema = buildClientSchema(data);
  
  // Generate markdown
  let markdown = '# GraphQL API Documentation\n\n';
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // Queries
  const queryType = schema.getQueryType();
  if (queryType) {
    markdown += '## Queries\n\n';
    const fields = queryType.getFields();
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      markdown += `### ${fieldName}\n\n`;
      if (field.description) {
        markdown += `${field.description}\n\n`;
      }
      if (field.args.length > 0) {
        markdown += '**Arguments:**\n\n';
        field.args.forEach(arg => {
          markdown += `- \`${arg.name}\`: \`${arg.type}\`${arg.description ? ` - ${arg.description}` : ''}\n`;
        });
        markdown += '\n';
      }
      markdown += `**Returns:** \`${field.type}\`\n\n`;
      markdown += '---\n\n';
    });
  }
  
  // Mutations
  const mutationType = schema.getMutationType();
  if (mutationType) {
    markdown += '## Mutations\n\n';
    const fields = mutationType.getFields();
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      markdown += `### ${fieldName}\n\n`;
      if (field.description) {
        markdown += `${field.description}\n\n`;
      }
      if (field.args.length > 0) {
        markdown += '**Arguments:**\n\n';
        field.args.forEach(arg => {
          markdown += `- \`${arg.name}\`: \`${arg.type}\`${arg.description ? ` - ${arg.description}` : ''}\n`;
        });
        markdown += '\n';
      }
      markdown += `**Returns:** \`${field.type}\`\n\n`;
      markdown += '---\n\n';
    });
  }

  // Subscriptions
  const subscriptionType = schema.getSubscriptionType();
  if (subscriptionType) {
    markdown += '## Subscriptions\n\n';
    const fields = subscriptionType.getFields();
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      markdown += `### ${fieldName}\n\n`;
      if (field.description) {
        markdown += `${field.description}\n\n`;
      }
      if (field.args.length > 0) {
        markdown += '**Arguments:**\n\n';
        field.args.forEach(arg => {
          markdown += `- \`${arg.name}\`: \`${arg.type}\`${arg.description ? ` - ${arg.description}` : ''}\n`;
        });
        markdown += '\n';
      }
      markdown += `**Returns:** \`${field.type}\`\n\n`;
      markdown += '---\n\n';
    });
  }
  
  // Types
  markdown += '## Types\n\n';
  const typeMap = schema.getTypeMap();
  Object.keys(typeMap)
    .filter(typeName => !typeName.startsWith('__'))
    .sort()
    .forEach(typeName => {
      const type = typeMap[typeName];
      
      // Skip built-in scalars
      if (['String', 'Int', 'Float', 'Boolean', 'ID'].includes(typeName)) {
        return;
      }
      
      markdown += `### ${typeName}\n\n`;
      if (type.description) {
        markdown += `${type.description}\n\n`;
      }
      
      if (type.getFields) {
        markdown += '**Fields:**\n\n';
        const fields = type.getFields();
        Object.keys(fields).forEach(fieldName => {
          const field = fields[fieldName];
          markdown += `- \`${fieldName}\`: \`${field.type}\`${field.description ? ` - ${field.description}` : ''}\n`;
        });
        markdown += '\n';
      }
      
      if (type.getValues) {
        markdown += '**Values:**\n\n';
        type.getValues().forEach(value => {
          markdown += `- \`${value.name}\`${value.description ? ` - ${value.description}` : ''}\n`;
        });
        markdown += '\n';
      }
    });
  
  // Create docs directory if it doesn't exist
  if (!fs.existsSync('./docs')) {
    fs.mkdirSync('./docs');
  }
  
  fs.writeFileSync('./docs/api.md', markdown);
  console.log('✅ Markdown documentation generated at ./docs/api.md');
}

generateMarkdownDocs().catch(console.error);