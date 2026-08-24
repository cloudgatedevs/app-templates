// Admin API — thin wrappers over the Cloudgate workflow endpoints bundled in
// .template/workflow-template.json (imported by Quick Start into the project
// named by VITE_CLOUDGATE_API_PROJECT, path `admin`, with its `admin_db`
// SQLite database provisioned from .template/schema.sql).
//
// Convention (same as the Cloudgate CRM template): every endpoint is called as
// POST {base}/<route> with a JSON body { "op": "...", ...params } — the
// workflow's Function node dispatches on `op` and builds the SQL the Database
// node runs. Paging: send `skip`/`take`; every row of a `list` result carries
// a `TotalCount` column (COUNT(*) OVER ()) that feeds the shared <Pager />.
//
// Ops available server-side beyond what the pages use today:
//   users:  list | get | create | update | disable | enable | delete
//   orders: list | get | create | update | status | delete
//   dashboard: stats | recent

import { api } from './api';

// Normalize a workflow response to an array of row objects. Cloudgate DB nodes
// return the string "No records found" (or other non-row payloads) when a
// query yields nothing — treat anything that isn't an object row as empty.
const asRows = (r) => {
  if (Array.isArray(r)) return r.filter((x) => x && typeof x === 'object');
  return r && typeof r === 'object' ? [r] : [];
};

export const admin = {
  // --- dashboard -----------------------------------------------------------
  dashboard: () => api.post('/dashboard', { op: 'stats' }).then(asRows),

  // --- users (server-paged; each row carries TotalCount for the pager) -----
  users: ({ search, skip = 0, take = 50 } = {}) =>
    api.post('/users', { op: 'list', skip, take, ...(search ? { search } : {}) }).then(asRows),

  // --- orders (server-paged, with an optional status filter) ---------------
  orders: ({ search, status, skip = 0, take = 50 } = {}) =>
    api
      .post('/orders', { op: 'list', skip, take, ...(search ? { search } : {}), ...(status ? { status } : {}) })
      .then(asRows),
};
