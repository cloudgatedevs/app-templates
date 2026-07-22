// Request signing for Cloudgate gateway calls.
//
// Every request to the gateway gets three headers:
//   X-Api-Key                  -> the API key
//   X-Timestamp                -> Unix milliseconds
//   X-Authentication-Signature -> HMAC-SHA512 hex of (timestamp + VERB + path + body)
//
// `path` is the URL path INCLUDING the query string (e.g. /sbx/api/explorer/stats?count=10).
// The HMAC is computed in-browser via Web Crypto (no extra dependency).
//
// NOTE: because the SPA calls Cloudgate directly, the secret is bundled into the
// browser. Signing is normally a server-side concern; this exposes the secret.

import axios from 'axios';

const API_KEY = String(import.meta.env.VITE_API_KEY ?? '').trim();
const API_SECRET = String(import.meta.env.VITE_API_SECRET ?? '').trim();
const EXPLORER_BASE = String(import.meta.env.VITE_CLOUDGATE_API_URL ?? '').trim().replace(/\/$/, '');

let GATEWAY_ORIGIN = '';
try {
  GATEWAY_ORIGIN = EXPLORER_BASE ? new URL(EXPLORER_BASE).origin : '';
} catch {
  GATEWAY_ORIGIN = '';
}

async function hmacSha512Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Resolve config to an absolute URL and fold params into the URL so the string
// we sign is exactly the string axios sends.
function resolveUrl(config) {
  let url = config.url || '';
  if (!/^https?:\/\//i.test(url)) {
    const base = (config.baseURL || '').replace(/\/$/, '');
    url = base + (url.startsWith('/') ? url : `/${url}`);
  }
  const params = config.params;
  if (params && typeof params === 'object' && Object.keys(params).length) {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) usp.append(k, v);
    }
    const qs = usp.toString();
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    config.params = undefined;
  }
  config.url = url;
  config.baseURL = undefined;
  return url;
}

async function signInterceptor(config) {
  if (!API_KEY || !API_SECRET || !GATEWAY_ORIGIN) return config;
  let full;
  try {
    full = resolveUrl(config);
  } catch {
    return config;
  }
  if (!full.startsWith(GATEWAY_ORIGIN)) return config; // only sign gateway calls

  const u = new URL(full);
  const path = u.pathname + u.search;
  const verb = String(config.method || 'get').toUpperCase();
  let body = '';
  if (verb !== 'GET' && config.data != null) {
    body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
  }
  const timestamp = Date.now(); // milliseconds, matches the server's replay check
  const payload = `${timestamp}${verb}${path}${body}`;
  try {
    const signature = await hmacSha512Hex(API_SECRET, payload);
    config.headers = config.headers || {};
    config.headers['X-Api-Key'] = API_KEY;
    config.headers['X-Timestamp'] = String(timestamp);
    config.headers['X-Authentication-Signature'] = signature;
  } catch {
    /* signing unavailable — send unsigned */
  }
  return config;
}

/** Attach the signing interceptor to an axios instance. */
export function installSigning(instance) {
  instance.interceptors.request.use(signInterceptor);
}

// Sign requests made through the global axios instance (any direct axios call
// to the Cloudgate gateway). The dedicated client in api.js is signed too.
installSigning(axios);

export const signingEnabled = Boolean(API_KEY && API_SECRET);
