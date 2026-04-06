const HELPER_SUFFIXES = [
  '_bool_exp',
  '_order_by',
  '_set_input',
  '_insert_input',
  '_pk_columns_input',
  '_select_column',
  '_mutation_response',
  '_aggregate_fields',
  '_aggregate_order_by',
  '_arr_rel_insert_input',
  '_obj_rel_insert_input',
  '_constraint',
  '_on_conflict',
  '_stream_cursor_input',
  '_stream_cursor_value_input',
  '_update_column',
  '_min_fields',
  '_max_fields',
  '_avg_fields',
  '_sum_fields',
  '_var_pop_fields',
  '_var_samp_fields',
  '_variance_fields',
  '_stddev_fields',
  '_stddev_pop_fields',
  '_stddev_samp_fields',
  '_min_order_by',
  '_max_order_by',
  '_avg_order_by',
  '_sum_order_by',
  '_inc_input',
  '_prepend_input',
  '_append_input',
  '_delete_key_input',
  '_delete_elem_input',
  '_delete_at_path_input',
  '_aggregate_bool_exp',
  '_aggregate_bool_exp_count',
  '_select_column_aggregate_bool_exp_count_arguments_columns',
];

const BUILT_IN_SCALARS = ['String', 'Int', 'Float', 'Boolean', 'ID'];

function isHelperType(typeName) {
  return HELPER_SUFFIXES.some((suffix) => typeName.endsWith(suffix));
}

function classifyTypes(typeMap, groups, classifyField) {
  const core = {};
  const helper = {};

  groups.forEach((g) => {
    core[g.id] = [];
    helper[g.id] = [];
  });
  core['other'] = [];
  helper['other'] = [];

  Object.keys(typeMap)
    .filter((name) => !name.startsWith('__') && !BUILT_IN_SCALARS.includes(name))
    .sort()
    .forEach((typeName) => {
      const type = typeMap[typeName];
      const groupId = classifyField(typeName, 'type', groups);
      const bucket = isHelperType(typeName) ? helper : core;
      bucket[groupId].push({ name: typeName, type });
    });

  return { core, helper };
}

module.exports = { isHelperType, classifyTypes };
