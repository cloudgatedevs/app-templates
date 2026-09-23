// Runs the real Vite app with intercepted Cloudgate APIs. No tenant data is changed.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { DEFAULT_SETTINGS } from '../src/settings/model.js';

const webAppId = '12345678-1234-1234-1234-123456789abc';
const origin = 'http://127.0.0.1:3199';
const env = {
  VITE_IDP_BASE_URL: 'https://hub.example.invalid', VITE_IDP_API_URL: 'https://api.example.invalid', VITE_IDP_TENANCY_NAME: 'qa', VITE_IDP_RETURN_URL: '',
  VITE_CLOUDGATE_API_URL: 'https://api.example.invalid', VITE_CLOUDGATE_API_ENV: 'sbx', VITE_CLOUDGATE_API_PROJECT: '', VITE_CLOUDGATE_MEDIA_FOLDER: '', VITE_API_KEY: 'test-key', VITE_API_SECRET: 'test-secret',
};
const server = await createServer({ server: { host: '127.0.0.1', port: 3199, strictPort: true }, define: Object.fromEntries(Object.entries(env).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])) });
await server.listen();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [], calls = [];
page.on('pageerror', error => errors.push(error.message));
let role = 'Admin', analyticsUnavailable = false, usersFail = false, appearanceUnavailable = false, paymentsUnavailable = false, walletReady = true;
let settings = { ...DEFAULT_SETTINGS };
let appearanceRevision = '00000000-0000-0000-0000-000000000000';
let users = [
  { id: 1, name: 'Alex', surname: 'Admin', email: 'admin@example.invalid', role: 'Admin', isActive: true },
  { id: 2, name: 'Ava', surname: 'Nkosi', email: 'ava@example.invalid', role: 'User', isActive: true, phoneNumber: '' },
];
let files = [{ id: 'image-1', fileId: 'image-1', name: 'Workspace.png', path: `apps/${webAppId}/media`, url: 'https://api.example.invalid/image.png', thumbUrl: 'https://api.example.invalid/image.png', size: 1400 }];
let smtp = { smtpEnabled: false, smtpHost: '', smtpPort: 587, smtpUserName: '', smtpDomain: '', fromAddress: '', fromDisplayName: '', smtpEnableSsl: true, smtpUseDefaultCredentials: false, hasPassword: true };
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const log = { id: 'call-1', route: 'orders', op: 'list', outcome: 'success', httpStatusCode: 200, durationMs: 45, creationTime: '2026-09-21T10:00:00Z', sessionId: 'session-1', idpUserId: 2, idpUserEmail: 'ava@example.invalid', country: 'ZA', method: 'POST', body: '{"take":10}', response: '{"items":[]}' };
const token = `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({ sub: '1', email: 'admin@example.invalid', name: 'Alex Admin', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test`;
await context.addInitScript(value => { localStorage.setItem('idp_access_token', value); }, token);
await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ body: '', contentType: 'text/css' }));
await context.route('**/cg-analytics.json', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ webAppId, isProduction: false }) }));
await context.route('https://api.example.invalid/**', async route => {
  const request = route.request();
  const url = new URL(request.url());
  let body = {}; try { body = request.postDataJSON() || {}; } catch { /* multipart */ }
  calls.push({ path: url.pathname, body, method: request.method() });
  const reply = (value, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
  if (url.pathname === '/image.png') return route.fulfill({ contentType: 'image/png', body: pixel });
  if (url.pathname.endsWith('/profile')) return reply({ id: 1, name: 'Alex', surname: 'Admin', email: 'admin@example.invalid', role });
  if (url.pathname.startsWith('/api/idp/qa/admin/appearance/')) {
    if (appearanceUnavailable) return reply({ message: 'Appearance API is unavailable on this server.' }, 404);
    assert.equal(body.webAppId, webAppId); assert.equal(body.projectPath, undefined); assert.equal(body.environment, 'sbx');
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    if (url.pathname.endsWith('/update')) {
      if (body.revision !== appearanceRevision) return reply({ message: 'Appearance changed since you loaded it. Reload the page before saving again.' }, 409);
      settings = { ...settings, ...body.values }; appearanceRevision = randomUUID();
    }
    return reply({ values: settings, revision: appearanceRevision });
  }
  if (url.pathname === '/api/idp/qa/admin/payments/status') {
    assert.deepEqual(body, { environment: 'sbx' });
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    assert.equal(request.headers()['x-authentication-signature'], undefined);
    if (paymentsUnavailable) return reply({ message: 'Payments API is unavailable on this server.' }, 404);
    return reply({ result: { ready: walletReady, provider: walletReady ? 'StripeConnect' : 'None', status: walletReady ? 'Active' : 'Missing', chargesEnabled: walletReady, payoutsEnabled: false, currency: walletReady ? 'USD' : null, country: walletReady ? 'US' : null, production: false, reason: walletReady ? null : 'Open Wallet to complete onboarding.' } });
  }
  if (url.pathname.includes('/admin/users/')) {
    if (usersFail) return reply({ error: { message: 'User service temporarily unavailable' } }, 503);
    const action = url.pathname.split('/').pop();
    const user = users.find(item => item.id === body.id);
    if (action === 'list') { const items = users.filter(item => JSON.stringify(item).toLowerCase().includes((body.filter || '').toLowerCase())); return reply({ items: items.slice(body.skip, body.skip + body.take), totalCount: items.length }); }
    if (action === 'details') return reply(user);
    if (action === 'create') { const value = { ...body, id: 3, role: 'User', isActive: true }; delete value.password; users.push(value); return reply(value); }
    if (action === 'update') { Object.assign(user, body); return reply(user); }
    if (action === 'set-active') { user.isActive = body.isActive; return reply(user); }
    if (action === 'delete') { users = users.filter(item => item.id !== body.id); return reply({ deleted: true }); }
    if (action === 'request-password-reset') return reply({ success: true });
  }
  if (url.pathname.includes('/admin/email-settings/')) {
    const action = url.pathname.split('/').pop();
    if (action === 'send-test') return reply({ sent: true, to: body.to, via: 'Cloudgate' });
    if (action === 'update') smtp = { ...smtp, ...body, hasPassword: true };
    if (action === 'delete') smtp = { ...smtp, smtpEnabled: false, smtpHost: '', hasPassword: false };
    return reply(smtp);
  }
  if (url.pathname.endsWith('/files/upload')) { const value = { id: 'upload-2', fileId: 'upload-2', name: 'Upload.png', url: 'https://api.example.invalid/image.png', path: url.searchParams.get('path') }; files.push(value); return reply(value); }
  if (url.pathname.endsWith('/files')) { const items = files.filter(item => item.path === url.searchParams.get('path')); return reply({ items, total: items.length }); }
  if (/\/files\/[^/]+$/.test(url.pathname) && request.method() === 'DELETE') { files = files.filter(item => item.id !== url.pathname.split('/').pop()); return reply({ deleted: true }); }
  if (url.pathname.includes('/admin/analytics/')) {
    if (analyticsUnavailable) return reply({ message: 'Unavailable' }, 404);
    if (url.pathname.endsWith('/overview')) return reply({ app: { name: 'Admin' }, summary: { viewCount: 150, uniqueSessionCount: 50, signedInVisitorCount: 20, bounceRate: .3, averageSessionDurationMs: 120000 }, geographic: { countries: [{ countryCode: 'ZA', requestCount: 100 }] }, devices: {}, referrers: { directViewCount: 120, internalViewCount: 30 } });
    if (url.pathname.endsWith('/pages')) return reply({ totalCount: 1, items: [{ pagePath: '/', viewCount: 150, uniqueSessionCount: 50 }] });
    if (url.pathname.endsWith('/sessions')) return reply({ totalCount: 1, items: [{ clientSessionId: 'session-1', idpUserId: 2, idpUserName: 'Ava', idpUserSurname: 'Nkosi', idpUserEmailAddress: 'ava@example.invalid', country: 'ZA', viewCount: 3, totalDurationMs: 120000, lastSeen: '2026-09-21T10:00:00Z' }] });
    return reply({ totalCount: 0, items: [] });
  }
  if (url.pathname.includes('/admin/workflow-logs/')) {
    if (url.pathname.endsWith('/summary')) return reply({ current: { calls: 12, successRate: 100, success: 12, errors: 0, unauthorized: 0, avgMs: 45, p95Ms: 70 }, previous: { calls: 0 }, buckets: [], byRoute: [] });
    if (url.pathname.endsWith('/list')) return reply({ totalCount: 1, items: [log] });
    if (url.pathname.endsWith('/get')) return reply(log);
    return reply({ totalCount: 0, items: [] });
  }
  errors.push(`Unexpected API call: ${request.method()} ${url.pathname}`);
  return reply({ message: 'Unexpected test request' }, 500);
});
const go = async path => { await page.goto(`${origin}${path}`); await page.locator('main').waitFor(); };
const visible = async locator => { await locator.first().waitFor({ state: 'visible' }); };
const shot = async name => {
  if (!process.env.ADMIN_TEST_OUTPUT_DIR) return;
  await fs.mkdir(process.env.ADMIN_TEST_OUTPUT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(process.env.ADMIN_TEST_OUTPUT_DIR, `${name}.png`), fullPage: true, animations: 'disabled' });
};
try {
  await go('/users');
  await visible(page.getByRole('cell', { name: 'ava@example.invalid', exact: true }));
  assert.equal(await page.getByLabel('Actions for admin@example.invalid').count(), 0);
  await page.getByRole('button', { name: 'Add user', exact: true }).click();
  await visible(page.getByRole('dialog', { name: 'Create user', exact: true }));
  await shot('create-user-dialog');
  await page.getByLabel('Email', { exact: true }).fill('new@example.invalid');
  await page.getByLabel('First name', { exact: true }).fill('New');
  await page.getByLabel('Surname', { exact: true }).fill('Person');
  await page.getByLabel('Initial password').fill('Test-password-123');
  await page.getByRole('button', { name: 'Save user', exact: true }).click();
  await visible(page.getByRole('cell', { name: 'new@example.invalid', exact: true }));
  await page.getByRole('row').filter({ hasText: 'new@example.invalid' }).getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('First name', { exact: true }).fill('Updated');
  await page.getByRole('button', { name: 'Save user', exact: true }).click();
  await visible(page.getByRole('cell', { name: 'Updated Person', exact: true }));
  await page.getByLabel('Actions for new@example.invalid').last().selectOption('set-active');
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await visible(page.getByRole('row').filter({ hasText: 'new@example.invalid' }).getByText('Disabled', { exact: true }));
  await page.getByLabel('Actions for new@example.invalid').last().selectOption('set-active');
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await visible(page.getByRole('row').filter({ hasText: 'new@example.invalid' }).getByText('Active', { exact: true }));
  await page.getByLabel('Actions for new@example.invalid').last().selectOption('request-password-reset');
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await visible(page.getByText('Password reset email requested.', { exact: true }));
  await page.getByLabel('Actions for new@example.invalid').last().selectOption('delete');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.ok(users.some(user => user.id === 3));
  await page.getByLabel('Actions for new@example.invalid').last().selectOption('delete');
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await visible(page.getByText('User deleted.', { exact: true }));
  assert.equal(users.length, 2);
  await shot('users-desktop');
  usersFail = true;
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'User service temporarily unavailable' }));
  usersFail = false;
  console.log('PASS user CRUD, activation, reset, confirmation, protected accounts and failure states');

  await go('/appearance');
  await page.getByLabel('Application name', { exact: true }).fill('Atlas Admin');
  await page.getByLabel('Footer note', { exact: true }).fill('Atlas workspace');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await visible(page.getByText('Appearance saved.', { exact: true }));
  assert.equal(settings.app_name, 'Atlas Admin');
  assert.match(await page.title(), /Atlas Admin/);
  await page.reload();
  await visible(page.getByRole('textbox', { name: 'Application name', exact: true }));
  assert.equal(await page.getByLabel('Application name', { exact: true }).inputValue(), 'Atlas Admin');
  appearanceRevision = randomUUID(); // Another administrator saved while this form was open.
  await page.getByLabel('Application name', { exact: true }).fill('Stale tab');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'Appearance changed since you loaded it.' }));
  assert.equal(settings.app_name, 'Atlas Admin');
  await page.reload();
  await visible(page.getByRole('textbox', { name: 'Application name', exact: true }));
  appearanceUnavailable = true;
  await page.reload();
  await visible(page.getByRole('alert').filter({ hasText: 'Appearance API is unavailable on this server.' }));
  assert.equal(await page.getByLabel('Application name', { exact: true }).isDisabled(), true);
  appearanceUnavailable = false;
  await page.getByRole('button', { name: 'Retry loading settings', exact: true }).click();
  await page.getByLabel('Application name', { exact: true }).waitFor();
  await page.waitForFunction(() => document.querySelector('#app_name')?.value === 'Atlas Admin');
  await go('/theme');
  await page.getByRole('button', { name: 'Forest', exact: true }).click();
  await page.getByLabel('Display mode', { exact: true }).selectOption('dark');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await visible(page.getByText('Theme saved.', { exact: true }));
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  assert.equal(settings.theme_primary, '#047857');
  await shot('theme-dark-desktop');
  await go('/');
  await visible(page.getByRole('heading', { name: 'Your overview starts here', exact: true }));
  await shot('dashboard-dark-desktop');
  await go('/orders');
  await visible(page.getByRole('heading', { name: 'Order management starts here', exact: true }));
  await shot('orders-dark-desktop');
  await go('/theme');
  await visible(page.getByLabel('Display mode', { exact: true }));
  await page.getByLabel('Display mode', { exact: true }).selectOption('light');
  await page.getByRole('button', { name: 'Indigo', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await visible(page.getByText('Theme saved.', { exact: true }));
  await shot('theme-light-desktop');
  const navigation = await page.locator('.app-sidebar').elementHandle();
  await page.getByRole('link', { name: 'User management', exact: true }).click();
  await visible(page.getByRole('heading', { name: 'User management', exact: true }));
  assert.equal(await navigation.evaluate(el => el.isConnected), true, 'Navigation stays mounted during lazy route transitions');
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await visible(page.getByRole('heading', { name: 'Your overview starts here', exact: true }));
  await visible(page.getByText('Placeholder', { exact: true }));
  assert.equal(await page.locator('main table, main .stat-card').count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Refresh', exact: true }).count(), 0);
  await shot('dashboard-desktop');
  await page.getByRole('link', { name: 'Orders', exact: true }).click();
  await visible(page.getByRole('heading', { name: 'Order management starts here', exact: true }));
  await visible(page.getByText('Placeholder', { exact: true }));
  assert.equal(await page.locator('main table, main input, main select').count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Refresh', exact: true }).count(), 0);
  await shot('orders-desktop');
  await go('/sample-users');
  await page.waitForURL(`${origin}/users`);
  await visible(page.getByRole('cell', { name: 'ava@example.invalid', exact: true }));
  console.log('PASS Dashboard and Orders placeholders, removed sample users and native user management redirect');
  console.log('PASS appearance persistence, branding updates and theme switching');

  await go('/smtp');
  await page.getByLabel('Use my own SMTP server instead').check();
  await page.getByLabel('SMTP host', { exact: true }).fill('smtp.example.invalid');
  await page.getByRole('button', { name: 'Save email settings' }).click();
  await visible(page.getByText('Cloudgate SMTP settings saved.', { exact: true }));
  assert.equal(calls.findLast(call => call.path.endsWith('/email-settings/update')).body.smtpPassword, '');
  await page.getByRole('button', { name: 'Send test email', exact: true }).click();
  await visible(page.getByText(/Test email sent to/));
  assert.equal(calls.filter(call => call.path.endsWith('/send-test')).length, 1);
  console.log('PASS SMTP configuration, preserved password and explicit test send');

  await go('/media'); await visible(page.getByText('Workspace.png', { exact: true }));
  await page.getByLabel('Upload images', { exact: true }).setInputFiles({ name: 'Upload.png', mimeType: 'image/png', buffer: pixel });
  await visible(page.getByText('Upload.png', { exact: true }));
  await page.getByRole('button', { name: 'Delete Upload.png', exact: true }).click();
  await page.getByRole('button', { name: 'Delete image', exact: true }).click();
  await visible(page.getByText('Image deleted.', { exact: true }));
  assert.equal(files.length, 1);
  settings.app_logo_url = files[0].url;
  await page.reload();
  await visible(page.getByText('Used in application branding', { exact: true }));
  assert.equal(await page.getByRole('button', { name: 'Delete Workspace.png', exact: true }).isDisabled(), true);
  settings.app_logo_url = '';
  console.log('PASS app-scoped media listing, upload and confirmed deletion');

  await go('/payments'); await visible(page.getByText('Ready to accept payments', { exact: true }));
  assert.equal(await page.getByRole('link', { name: 'Open Wallet' }).getAttribute('href'), 'https://hub.example.invalid/wallet');
  walletReady = false;
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await visible(page.getByText('Wallet setup required', { exact: true }));
  paymentsUnavailable = true;
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'Payments API is unavailable on this server.' }));
  assert.equal(await page.getByText('Ready to accept payments', { exact: true }).count(), 0);
  paymentsUnavailable = false; walletReady = true;
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await visible(page.getByText('Ready to accept payments', { exact: true }));
  await go('/analytics'); await visible(page.getByRole('heading', { name: 'Countries', exact: true }));
  await page.getByLabel('Analytics period').selectOption('2');
  await visible(page.getByRole('heading', { name: 'Pages', exact: true }));
  await shot('analytics-desktop');
  assert.equal(await page.getByRole('button', { name: 'Workflow calls for Ava Nkosi', exact: true }).count(), 0);
  analyticsUnavailable = true;
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await visible(page.getByText('Analytics is not connected yet', { exact: true }));
  analyticsUnavailable = false;
  await go('/logs'); await visible(page.getByText(/This app has no workflow controller configured/));
  assert.equal(calls.filter(call => call.path.includes('/admin/workflow-logs/')).length, 0);
  await go('/about'); await visible(page.getByRole('heading', { name: 'Your Cloudgate tenancy', exact: true }));
  console.log('PASS Wallet status/link, Analytics filters/unavailable server, Logs and About');

  await page.setViewportSize({ width: 360, height: 800 });
  await go('/users');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Navigation' });
  await visible(dialog);
  for (let i = 0; i < 18; i++) { await page.keyboard.press('Tab'); assert.ok(await dialog.evaluate(el => el.contains(document.activeElement))); }
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Open menu');
  assert.equal(await page.getByRole('button', { name: 'Open menu', exact: true }).evaluate(el => el === document.activeElement), true);
  for (const route of ['/', '/orders', '/users', '/theme', '/appearance', '/smtp', '/media', '/payments', '/analytics', '/logs', '/about']) {
    await go(route);
    await page.waitForLoadState('networkidle');
    const width = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, viewport: innerWidth, main: document.querySelector('main').scrollWidth, mainViewport: document.querySelector('main').clientWidth }));
    assert.ok(width.doc <= width.viewport, `${route}: horizontal overflow ${JSON.stringify(width)}`);
    assert.ok(width.main <= width.mainViewport, `${route}: content overflow ${JSON.stringify(width)}`);
    if (route === '/' || route === '/orders') await shot(route === '/' ? 'dashboard-mobile' : 'orders-mobile');
  }
  await shot('about-mobile');
  await go('/users');
  await page.getByRole('button', { name: 'Add user', exact: true }).click();
  await visible(page.getByRole('dialog', { name: 'Create user', exact: true }));
  await shot('create-user-mobile');
  await page.keyboard.press('Escape');
  await page.getByRole('dialog', { name: 'Create user', exact: true }).waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.activeElement?.textContent.includes('Add user'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Add user', exact: true }).click();
  const reducedDialog = page.getByRole('dialog', { name: 'Create user', exact: true });
  await visible(reducedDialog);
  assert.ok(await reducedDialog.evaluate(el => parseFloat(getComputedStyle(el).animationDuration) < .01), 'Reduced-motion mode removes visible dialog motion');
  await page.keyboard.press('Escape');
  await reducedDialog.waitFor({ state: 'detached' });
  await page.getByRole('button', { name: 'Add user', exact: true }).waitFor();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  console.log('PASS all pages at 360px, mobile focus trap, Escape and focus restoration');

  role = 'User';
  const count = calls.length;
  await page.goto(`${origin}/users`);
  await visible(page.getByRole('heading', { name: 'Back office access required' }));
  assert.equal(calls.slice(count).filter(call => call.path.includes('/admin/users/') || call.path.includes('/admin/appearance/') || call.path.includes('/admin/payments/')).length, 0);
  assert.equal(calls.filter(call => call.path === '/sbx/admin/settings').length, 0);
  assert.equal(calls.filter(call => call.path === '/sbx/admin/payments').length, 0);
  assert.equal(calls.filter(call => /^\/(sbx|prod)\/admin\/(dashboard|orders|users)$/.test(call.path)).length, 0, 'Placeholders and legacy sample URLs never call sample workflows');
  console.log('PASS non-admin users cannot open back office or trigger admin data calls');
  assert.deepEqual(errors, []);
  console.log('PASS no browser runtime errors');
} catch (error) {
  await shot('failure');
  console.error(await page.locator('main').innerText());
  throw error;
} finally {
  await context.close(); await browser.close(); await server.close();
}
