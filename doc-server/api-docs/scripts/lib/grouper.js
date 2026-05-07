function classifyField(fieldName, operationType, groups) {
  let domainName = fieldName;

  // For mutations, strip Hasura CRUD prefixes to get the domain name
  if (operationType === 'mutation') {
    domainName = fieldName
      .replace(/^insert_/, '')
      .replace(/^update_/, '')
      .replace(/^delete_/,'');
  }

  // Also strip common suffixes for better matching on types
  let matchName = domainName;
  if (operationType === 'type') {
    // Strip _by_pk, _aggregate, _one suffixes for matching
    matchName = domainName
      .replace(/_by_pk$/, '')
      .replace(/_aggregate$/, '')
      .replace(/_one$/, '');
  }

  // Sort all prefixes from all groups longest-first to ensure greedy matching
  const allPrefixes = [];
  for (const group of groups) {
    for (const prefix of group.prefixes) {
      allPrefixes.push({ prefix, groupId: group.id });
    }
  }
  allPrefixes.sort((a, b) => b.prefix.length - a.prefix.length);

  for (const { prefix, groupId } of allPrefixes) {
    if (matchName === prefix || matchName.startsWith(prefix + '_')) {
      return groupId;
    }
  }

  return 'other';
}

function classifyFields(schemaType, operationType, groups) {
  if (!schemaType) return {};

  const fields = schemaType.getFields();
  const result = {};

  groups.forEach((g) => {
    result[g.id] = [];
  });
  result['other'] = [];

  Object.keys(fields)
    .sort()
    .forEach((fieldName) => {
      const groupId = classifyField(fieldName, operationType, groups);
      result[groupId].push({ name: fieldName, field: fields[fieldName] });
    });

  return result;
}

module.exports = { classifyField, classifyFields };
