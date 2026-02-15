const { buildClientSchema, getIntrospectionQuery } = require('graphql');
const fetch = require('node-fetch');

async function fetchSchema() {
  const HASURA_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql';
  const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

  if (!HASURA_ADMIN_SECRET) {
    throw new Error('HASURA_ADMIN_SECRET environment variable is required');
  }

  const response = await fetch(HASURA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: getIntrospectionQuery(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}. Body: ${errorText}`);
  }

  const { data, errors } = await response.json();
  if (errors || !data) {
    throw new Error(`GraphQL introspection query failed: ${JSON.stringify(errors || 'No data returned', null, 2)}`);
  }

  return buildClientSchema(data);
}

module.exports = { fetchSchema };
