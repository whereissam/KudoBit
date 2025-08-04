export const parsePaginationParams = (c) => {
  const limit = Math.min(parseInt(c.req.query('limit') || '10'), 100); // Max 100 items
  const startingAfter = c.req.query('starting_after');
  const endingBefore = c.req.query('ending_before');
  
  // Filtering support
  const filters = {};
  const filterParams = ['status', 'type', 'created_after', 'created_before'];
  filterParams.forEach(param => {
    const value = c.req.query(param);
    if (value) filters[param] = value;
  });
  
  // Sorting support
  const sortBy = c.req.query('sort_by') || 'created';
  const order = c.req.query('order') === 'asc' ? 'asc' : 'desc';
  
  // Field selection support
  const fields = c.req.query('fields');
  const selectedFields = fields ? fields.split(',').map(f => f.trim()) : null;
  
  return { 
    limit, 
    startingAfter, 
    endingBefore, 
    filters, 
    sortBy, 
    order, 
    selectedFields 
  };
};

export const paginateResults = (results, limit, hasMore = false, url = null) => {
  return {
    object: 'list',
    data: results,
    has_more: hasMore,
    url: url || '/v1/endpoint'
  };
};

export const applyFieldSelection = (data, selectedFields) => {
  if (!selectedFields || !Array.isArray(selectedFields)) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => selectFields(item, selectedFields));
  } else {
    return selectFields(data, selectedFields);
  }
};

function selectFields(obj, fields) {
  const result = {};
  
  // Always include core fields required by Stripe standards
  const coreFields = ['id', 'object', 'created'];
  const allFields = [...new Set([...coreFields, ...fields])];
  
  allFields.forEach(field => {
    if (obj.hasOwnProperty(field)) {
      result[field] = obj[field];
    }
  });
  
  return result;
}

export const buildSqlWhere = (filters, tableName = '') => {
  const conditions = [];
  const params = [];
  const prefix = tableName ? `${tableName}.` : '';
  
  Object.entries(filters).forEach(([key, value]) => {
    switch (key) {
      case 'status':
        conditions.push(`${prefix}is_active = ?`);
        params.push(value === 'active' ? 1 : 0);
        break;
      case 'created_after':
        conditions.push(`${prefix}created_at > ?`);
        params.push(new Date(value).toISOString());
        break;
      case 'created_before':
        conditions.push(`${prefix}created_at < ?`);
        params.push(new Date(value).toISOString());
        break;
      default:
        // Handle other filters as needed
        break;
    }
  });
  
  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
};