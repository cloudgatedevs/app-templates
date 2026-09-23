import assert from 'node:assert/strict';
import test from 'node:test';
import { createAppearanceClient } from '../src/services/appearanceClient.js';

const revision = '11111111-1111-1111-1111-111111111111';
test('native appearance carries app/environment and revision while saving only supplied fields', async () => {
  const calls = [];
  const client = createAppearanceClient({ webAppId: revision, environment: 'PROD', request: async (...args) => {
    calls.push(args); return { values: { app_name: 'Atlas', theme_mode: 'dark' }, revision };
  } });
  const loaded = await client.get();
  assert.equal(loaded.values.app_name, 'Atlas'); assert.equal(loaded.values.theme_mode, 'dark');
  await client.save({ theme_primary: '#123456' }, loaded.revision);
  await client.reset(loaded.revision);
  assert.deepEqual(calls, [
    ['admin/appearance/details', { body: { webAppId: revision, environment: 'prod' } }],
    ['admin/appearance/update', { body: { values: { theme_primary: '#123456' }, revision, webAppId: revision, environment: 'prod' } }],
    ['admin/appearance/reset', { body: { revision, webAppId: revision, environment: 'prod' } }],
  ]);
});
test('appearance fails closed without a scope or loaded revision', async () => {
  let calls = 0;
  const request = async () => { calls++; };
  for (const [webAppId, environment] of [['', 'sbx'], ['*', 'sbx'], [revision, 'oops']])
    await assert.rejects(createAppearanceClient({ request, webAppId, environment }).get(), /Appearance needs/);
  await assert.rejects(createAppearanceClient({ request, webAppId: revision }).save({ app_name: 'Atlas' }), /Load the saved/);
  assert.equal(calls, 0);
});
test('appearance surfaces server conflicts and rejects malformed responses', async () => {
  const conflict = new Error('Appearance changed since you loaded it. Reload the page before saving again.');
  const client = createAppearanceClient({ webAppId: revision, request: async () => { throw conflict; } });
  await assert.rejects(client.save({ app_name: 'Atlas' }, revision), error => error === conflict);
  for (const response of [null, { values: [], revision }, { values: {}, revision: 'bad' }, { values: {} }])
    await assert.rejects(createAppearanceClient({ webAppId: revision, request: async () => response }).get(), /invalid appearance response/);
});
