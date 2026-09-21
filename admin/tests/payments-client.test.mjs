import assert from 'node:assert/strict';
import test from 'node:test';
import { createPaymentsClient } from '../src/services/paymentsClient.js';

const status = { ready: true, provider: 'StripeConnect', status: 'Active', chargesEnabled: true, payoutsEnabled: false, production: true };
test('payments uses the native IdP endpoint with normalized application scope', async () => {
  const calls = [];
  const client = createPaymentsClient({ projectPath: '/admin/', environment: 'PROD', request: async (...args) => { calls.push(args); return status; } });
  assert.equal(await client.status(), status);
  assert.deepEqual(calls, [['admin/payments/status', { body: { projectPath: 'admin', environment: 'prod' } }]]);
});
test('payments rejects missing or invalid scope without sending a request', async () => {
  let calls = 0;
  for (const [projectPath, environment] of [['', 'sbx'], ['*', 'sbx'], ['///', 'prod'], ['admin', 'invalid']])
    await assert.rejects(createPaymentsClient({ projectPath, environment, request: async () => { calls++; } }).status(), /Payments needs/);
  assert.equal(calls, 0);
});
test('payments preserves setup-required status and surfaces API errors without a workflow fallback', async () => {
  const missing = { ...status, ready: false, provider: 'None', status: 'Missing', chargesEnabled: false, production: false };
  assert.equal(await createPaymentsClient({ projectPath: 'admin', request: async () => missing }).status(), missing);
  const failure = new Error('No application uses that controller path in this environment.');
  await assert.rejects(createPaymentsClient({ projectPath: 'admin', request: async () => { throw failure; } }).status(), error => error === failure);
});
test('payments does not show readiness from a malformed response', async () => {
  for (const value of [null, {}, { ready: true }, { ...status, payoutsEnabled: 'false' }])
    await assert.rejects(createPaymentsClient({ projectPath: 'admin', request: async () => value }).status(), /invalid Wallet status/);
});
