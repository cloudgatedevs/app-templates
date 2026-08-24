// Admin API — thin wrappers over the Cloudgate workflow endpoints this app
// calls. Publish endpoints with these routes in your workflow project (the one
// named by VITE_CLOUDGATE_API_PROJECT) and the pages light up.
//
// Paging convention (matches the shared <Pager />): the client sends
// `skip`/`take` and each returned row carries a `TotalCount` column with the
// full result-set size, e.g. in SQLite:
//
//   SELECT u.*, COUNT(*) OVER () AS TotalCount
//   FROM Users u
//   WHERE (@search = '' OR u.Name LIKE '%' || @search || '%'
//                       OR u.Email LIKE '%' || @search || '%')
//   ORDER BY u.CreatedAt DESC
//   LIMIT @take OFFSET @skip;
//
// Expected row shapes (rename freely — the pages read these keys):
//   /dashboard -> [{ Users, Orders, Revenue30d, PendingOrders }]
//   /users     -> [{ Id, Name, Surname, Email, Role, Status, CreatedAt, TotalCount }]
//   /orders    -> [{ Id, Reference, CustomerName, CustomerEmail, Items, Total,
//                    Status, CreatedAt, TotalCount }]

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
  dashboard: () => api.get('/dashboard').then(asRows),

  // --- users (server-paged; each row carries TotalCount for the pager) -----
  users: ({ search, skip = 0, take = 50 } = {}) =>
    api.get('/users', { skip, take, ...(search ? { search } : {}) }).then(asRows),

  // --- orders (server-paged, with an optional status filter) ---------------
  orders: ({ search, status, skip = 0, take = 50 } = {}) =>
    api
      .get('/orders', { skip, take, ...(search ? { search } : {}), ...(status ? { status } : {}) })
      .then(asRows),
};
