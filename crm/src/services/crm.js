// CRM service layer — thin wrappers over the signed Cloudgate workflow API.
//
// Every CRM call is `api.post('/<route>', { op, ...fields })`. Responses are
// coerced into arrays of rows. For `list` we return the array; for
// `get/create/update` we return the first row. Columns are PascalCase.

import { api } from './api';
// CRM service layer.

function asArray(res) {
  if (Array.isArray(res)) return res;
  if (res == null) return [];
  if (typeof res === 'object') return [res];
  return [];
}

function first(res) {
  const arr = asArray(res);
  return arr.length ? arr[0] : null;
}

function clean(fields = {}) {
  // Drop undefined so we don't send noise; keep null/empty intentionally.
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

async function listCall(route, op, fields) {
  return asArray(await api.post(route, clean({ op, ...fields })));
}

async function rowCall(route, op, fields) {
  return first(await api.post(route, clean({ op, ...fields })));
}

async function voidCall(route, op, fields) {
  return api.post(route, clean({ op, ...fields }));
}

export const leadsApi = {
  list: (filters = {}) => listCall('/leads', 'list', filters),
  get: (id) => rowCall('/leads', 'get', { id }),
  create: (fields) => rowCall('/leads', 'create', fields),
  update: (id, fields) => rowCall('/leads', 'update', { id, ...fields }),
  remove: (id) => voidCall('/leads', 'delete', { id }),
  stage: (id, stageId) => rowCall('/leads', 'stage', { id, stageId }),
  archive: (id) => voidCall('/leads', 'archive', { id }),
};

export const companiesApi = {
  list: (filters = {}) => listCall('/companies', 'list', filters),
  get: (id) => rowCall('/companies', 'get', { id }),
  create: (fields) => rowCall('/companies', 'create', fields),
  update: (id, fields) => rowCall('/companies', 'update', { id, ...fields }),
  remove: (id) => voidCall('/companies', 'delete', { id }),
};

export const contactsApi = {
  list: (filters = {}) => listCall('/contacts', 'list', filters),
  get: (id) => rowCall('/contacts', 'get', { id }),
  create: (fields) => rowCall('/contacts', 'create', fields),
  update: (id, fields) => rowCall('/contacts', 'update', { id, ...fields }),
  remove: (id) => voidCall('/contacts', 'delete', { id }),
};

export const tasksApi = {
  list: (filters = {}) => listCall('/tasks', 'list', filters),
  get: (id) => rowCall('/tasks', 'get', { id }),
  create: (fields) => rowCall('/tasks', 'create', fields),
  update: (id, fields) => rowCall('/tasks', 'update', { id, ...fields }),
  remove: (id) => voidCall('/tasks', 'delete', { id }),
  complete: (id) => voidCall('/tasks', 'complete', { id }),
};

export const activitiesApi = {
  list: (leadId) => listCall('/activities', 'list', { leadId }),
  create: (fields) => rowCall('/activities', 'create', fields),
  remove: (id) => voidCall('/activities', 'delete', { id }),
};

export const stagesApi = {
  list: () => listCall('/stages', 'list', {}),
  create: (fields) => rowCall('/stages', 'create', fields),
  update: (id, fields) => rowCall('/stages', 'update', { id, ...fields }),
  remove: (id) => voidCall('/stages', 'delete', { id }),
};

export const tagsApi = {
  list: () => listCall('/tags', 'list', {}),
  create: (fields) => rowCall('/tags', 'create', fields),
  remove: (id) => voidCall('/tags', 'delete', { id }),
  forLead: (leadId) => listCall('/tags', 'forLead', { leadId }),
  assign: (leadId, tagId) => voidCall('/tags', 'assign', { leadId, tagId }),
  unassign: (leadId, tagId) => voidCall('/tags', 'unassign', { leadId, tagId }),
};

export const emailsApi = {
  list: (leadId) => listCall('/emails', 'list', { leadId }),
  get: (id) => rowCall('/emails', 'get', { id }),
  send: ({ leadId, to, subject, body, ownerUserId }) =>
    api.post('/email-send', clean({ leadId, to, subject, body, ownerUserId })),
  bulk: ({ subject, body, recipients, ownerUserId }) =>
    api
      .post('/email-bulk', clean({ subject, body, recipients, ownerUserId }))
      .then((r) => (Array.isArray(r) ? r[0] : r) || {}),
};

export const importApi = {
  leads: (rows) =>
    api.post('/import', { op: 'leads', rows }).then((r) => (Array.isArray(r) ? r[0] : r) || {}),
};

export const dashboardApi = {
  stats: async () => first(await api.post('/dashboard', { op: 'stats' })) || {},
  byStage: () => listCall('/dashboard', 'byStage', {}),
  recent: () => listCall('/dashboard', 'recent', {}),
};
