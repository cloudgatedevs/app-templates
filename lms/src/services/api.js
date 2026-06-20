// Generic Cloudgate workflow-API client.
//
// The React client talks ONLY to Cloudgate workflow endpoints — never to any
// backend service or database directly. Point it at the gateway base with
// VITE_CLOUDGATE_API_URL (e.g. http://{tenant}.localhost:44301/sbx/api).
//
// Every request is:
//   - signed with the gateway HMAC headers (see apiClient.js), and
//   - carries the IdP bearer token automatically (see auth/authHelpers.setupAxios).
//
// Usage:
//   import { api } from '@/services/api';
//   const data   = await api.get('/example/list', { take: 20 });
//   const result = await api.post('/example/create', { name: 'Acme' });

import axios from 'axios';
import { installSigning } from './apiClient';

const API_BASE = String(import.meta.env.VITE_CLOUDGATE_API_URL ?? '').trim().replace(/\/$/, '');

export const apiConfigured = Boolean(API_BASE);

// Dedicated instance so app calls share the same base + signing config.
const http = axios.create({ baseURL: API_BASE, timeout: 20000 });
installSigning(http);

// Cloudgate may return a workflow result as a JSON string (text/plain) or even
// double-encoded. Coerce to a real JS value and unwrap common { result } / { data }
// envelopes.
export function coerce(data) {
  let d = data;
  for (let i = 0; i < 4 && typeof d === 'string'; i++) {
    const t = d.trim();
    if (!t) return null;
    try {
      d = JSON.parse(t);
    } catch {
      return d; // a plain (non-JSON) string, e.g. an error message
    }
  }
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    if ('result' in d && (Array.isArray(d.result) || typeof d.result === 'object')) return d.result;
    if ('data' in d && (Array.isArray(d.data) || typeof d.data === 'object')) return d.data;
  }
  return d;
}

function ensureConfigured() {
  if (!API_BASE) throw new Error('VITE_CLOUDGATE_API_URL is not configured.');
}

export const api = {
  /** GET {base}{path}?...params -> coerced workflow result. */
  async get(path, params, config) {
    ensureConfigured();
    const res = await http.get(path, { params, ...config });
    return coerce(res.data);
  },
  /** POST {base}{path} with a JSON body -> coerced workflow result. */
  async post(path, body, config) {
    ensureConfigured();
    const res = await http.post(path, body, config);
    return coerce(res.data);
  },
  /** PUT {base}{path} with a JSON body -> coerced workflow result. */
  async put(path, body, config) {
    ensureConfigured();
    const res = await http.put(path, body, config);
    return coerce(res.data);
  },
  /** DELETE {base}{path} -> coerced workflow result. */
  async del(path, config) {
    ensureConfigured();
    const res = await http.delete(path, config);
    return coerce(res.data);
  },
  /** The raw signed axios instance, for advanced cases. */
  http,
};
