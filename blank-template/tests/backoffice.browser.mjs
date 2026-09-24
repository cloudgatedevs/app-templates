// Runs the real Vite app with intercepted Cloudgate APIs. No tenant data is changed.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';
import { build, preview } from 'vite';
import viteConfig from '../vite.config.js';
import { DEFAULT_SETTINGS } from '@cloudgatedevs/cloudgate-client/platform';

const webAppId = '12345678-1234-1234-1234-123456789abc';
const origin = 'http://127.0.0.1:3199';
const env = {
  VITE_IDP_BASE_URL: 'https://hub.example.invalid', VITE_IDP_API_URL: 'https://api.example.invalid', VITE_IDP_TENANCY_NAME: 'qa', VITE_IDP_RETURN_URL: '',
  VITE_CLOUDGATE_API_URL: 'https://api.example.invalid', VITE_CLOUDGATE_API_ENV: 'sbx', VITE_CLOUDGATE_API_PROJECT: '', VITE_CLOUDGATE_MEDIA_FOLDER: '', VITE_API_KEY: 'test-key', VITE_API_SECRET: 'test-secret',
};
await build({ ...viteConfig({ mode: 'production' }), configFile: false, logLevel: 'warn', esbuild: { tsconfigRaw: { compilerOptions: {} } }, define: Object.fromEntries(Object.entries(env).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])) });
const server = await preview({ configFile: false, preview: { host: '127.0.0.1', port: 3199, strictPort: true } });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [], calls = [];
page.on('pageerror', error => errors.push(error.message));
let role = 'Admin', analyticsUnavailable = false, usersFail = false, appearanceUnavailable = false, paymentsUnavailable = false, walletReady = true;
let settings = { ...DEFAULT_SETTINGS };
let notificationsUnavailable = false;
let notificationAdminAccess = 'allowed', notificationSendFails = false;
const sentNotifications = { sbx: [], prod: [] }, notificationRecipients = new Map();
let accountLinked = false, accountApproved = false;
let linkedPhoto = true;
let emailTemplate = { templateEnabled: false, templateHtml: '', scope: 'tenant' }, templateAccess = 'allowed', templateSaveFails = false;
let allowSelfRegistration = false, registrationAccess = 'allowed', registrationSaveFails = false;
const linkCode = 'x'.repeat(43);
let notifications = [
  { id: 'notification-1', title: 'Order ready', body: 'Your order is ready to collect.', style: 'success', actionUrl: '/orders', actionLabel: 'View order', creationTime: '2026-09-23T10:00:00Z', isRead: false, readAtUtc: null },
  { id: 'notification-2', title: 'Account update', body: '<b>This is plain text</b>', actionUrl: 'javascript:alert(1)', creationTime: '2026-09-23T09:00:00Z', isRead: false, readAtUtc: null },
];
const notificationSockets = new Set();
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
await context.addInitScript(value => { if (window === window.top) localStorage.setItem('idp_access_token', value); }, token);
await context.routeWebSocket('wss://api.example.invalid/ws-idp-notifications?*', socket => {
  const url = new URL(socket.url());
  assert.equal(url.searchParams.get('access_token'), token);
  assert.equal(url.searchParams.get('environment'), 'sbx');
  notificationSockets.add(socket);
  socket.onClose(() => notificationSockets.delete(socket));
  socket.send(JSON.stringify({ type: 'ready', environment: 'sbx' }));
});
await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ body: '', contentType: 'text/css' }));
await context.route('https://hub.example.invalid/account-link**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Cloudgate approval</h1>' }));
await context.route('https://hub.example.invalid/developer**', route => route.fulfill({ contentType: 'text/html', body: `<h1>Cloudgate developer tools</h1><input aria-label="Workflow draft"/><script>
  const parentOrigin = ${JSON.stringify(origin)};
  parent.postMessage({source:'cloudgate-developer',type:'ready'},parentOrigin);
  addEventListener('message',e=>{if(e.origin===parentOrigin&&e.source===parent&&e.data?.type==='end')parent.postMessage({source:'cloudgate-developer',type:'ended'},parentOrigin)});
</script>` }));
await context.route('**/cg-analytics.json', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ webAppId, isProduction: false }) }));
await context.route('https://api.example.invalid/**', async route => {
  const request = route.request();
  const url = new URL(request.url());
  let body = {}; try { body = request.postDataJSON() || {}; } catch { /* multipart */ }
  calls.push({ path: url.pathname, body, method: request.method() });
  if (url.pathname.startsWith('/api/idp/qa/admin/')) assert.equal(request.headers().authorization, `Bearer ${token}`, 'All back-office admin requests use the IdP token');
  const reply = (value, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
  if (url.pathname === '/image.png') return route.fulfill({ contentType: 'image/png', body: pixel });
  if (url.pathname.endsWith('/branding/logo')) return route.fulfill({ contentType: 'image/png', body: pixel });
  if (url.pathname.endsWith('/profile')) return reply({ id: 1, name: 'Alex', surname: 'Admin', email: 'admin@example.invalid', role });
  if (url.pathname === '/api/idp/qa/developer-workspace') {
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    assert.equal(body.webAppId, webAppId); assert.equal(body.environment, 'sbx');
    assert.equal(new URL(body.returnUrl).origin, origin);
    if (!accountLinked) return reply({ message: 'Link your Cloudgate account in your profile.' }, 403);
    return reply({ frameUrl: `https://hub.example.invalid/developer#code=${linkCode}&parent=${encodeURIComponent(origin)}`, projectName: 'qa', appName: 'Blank app', environment: 'sbx' });
  }
  if (url.pathname === '/api/idp/qa/admin/email-template') {
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    if (templateAccess === 'unavailable') return reply({}, 404);
    if (role !== 'Admin' || templateAccess === 'denied') return reply({ code: 'idp-admin-required', message: 'An active IdP account with the Admin role is required.' }, 403);
    if (request.method() === 'PUT') {
      assert.deepEqual(Object.keys(body), ['templateEnabled', 'templateHtml']);
      assert.equal(typeof body.templateEnabled, 'boolean'); assert.equal(typeof body.templateHtml, 'string');
      if (templateSaveFails) return reply({}, 503);
      emailTemplate = { ...body, scope: 'tenant' };
    } else assert.equal(request.method(), 'GET');
    return reply(emailTemplate);
  }
  if (url.pathname === '/api/idp/qa/admin/registration') {
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    if (registrationAccess === 'unavailable') return reply({}, 404);
    if (role !== 'Admin' || registrationAccess === 'denied') return reply({code:'idp-admin-required',message:'An active IdP account with the Admin role is required.'},403);
    if (request.method() === 'PUT') {
      assert.deepEqual(Object.keys(body), ['allowSelfRegistration']); assert.equal(typeof body.allowSelfRegistration, 'boolean');
      if (registrationSaveFails) return reply({}, 503);
      allowSelfRegistration = body.allowSelfRegistration;
    } else assert.equal(request.method(), 'GET');
    return reply({allowSelfRegistration,scope:'tenant'});
  }
  if (url.pathname.includes('/profile/cloudgate-link')) {
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    if (url.pathname.endsWith('/start')) { accountApproved = false; return reply({ code: linkCode, expiresAt: new Date(Date.now() + 300000).toISOString(), authorizationUrl: `https://hub.example.invalid/account-link#code=${linkCode}` }); }
    if (url.pathname.endsWith('/complete')) { assert.equal(body.code, linkCode); if (!accountApproved) return reply({ pending: true }, 202); accountLinked = true; }
    if (request.method() === 'DELETE') { accountLinked = false; accountApproved = false; }
    return reply({ linked: accountLinked, available: accountLinked, userId: accountLinked ? 7 : null, displayName: accountLinked ? 'Alex Cloudgate' : null, email: accountLinked ? 'hub@example.invalid' : null, photoUrl: accountLinked && linkedPhoto ? `data:image/png;base64,${pixel.toString('base64')}` : null });
  }
  if (url.pathname.startsWith('/api/idp/qa/admin/notifications/')) {
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    assert.ok(['sbx', 'prod'].includes(body.environment));
    assert.equal(body.tenantId, undefined); assert.equal(body.senderId, undefined);
    if (notificationAdminAccess === 'denied') return reply({ message: 'Administrator access was revoked.' }, 403);
    if (notificationAdminAccess === 'unavailable') return reply({}, 404);
    const action = url.pathname.split('/').pop();
    if (action === 'history') return reply({ items: sentNotifications[body.environment].slice(body.skip, body.skip + body.take), totalCount: sentNotifications[body.environment].length });
    if (action === 'send') {
      await new Promise(resolve => setTimeout(resolve, 180));
      if (notificationSendFails) return reply({}, 503);
      assert.equal(body.allUsers ? body.userId == null : Number.isSafeInteger(body.userId), true);
      const targets = body.allUsers ? users : users.filter(user => user.id === body.userId);
      const row = { ...body, id: randomUUID(), creationTime: '2026-09-24T12:00:00Z', isBroadcast: body.allUsers, recipientCount: targets.length, readCount: 0, senderIdpUserId: 1 };
      sentNotifications[body.environment].unshift(row);
      notificationRecipients.set(row.id, targets.map(user => ({ userId: user.id, email: user.email, isRead: false, readAtUtc: null })));
      return reply({ id: row.id, recipientCount: row.recipientCount });
    }
    if (action === 'recipients') {
      assert.ok(sentNotifications[body.environment].some(item => item.id === body.id), 'Read receipts stay in the selected environment');
      const targets = notificationRecipients.get(body.id).filter(user => body.isRead == null || user.isRead === body.isRead);
      return reply({ items: targets.slice(body.skip, body.skip + body.take), totalCount: targets.length });
    }
  }
  if (url.pathname.startsWith('/api/idp/qa/notifications/')) {
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    assert.equal(body.environment, 'sbx'); assert.equal(body.userId, undefined);
    if (notificationsUnavailable) return reply({ error: { message: 'Notification service temporarily unavailable' } }, 503);
    const action = url.pathname.split('/').pop();
    if (action === 'unread-count') return reply({ result: { unreadCount: notifications.filter(item => !item.isRead).length } });
    if (action === 'list') { const items = notifications.filter(item => !body.unreadOnly || !item.isRead); return reply({ result: { totalCount: items.length, items: items.slice(body.skip, body.skip + body.take) } }); }
    if (action === 'read') { const item = notifications.find(item => item.id === body.id); Object.assign(item, { isRead: true, readAtUtc: item.readAtUtc || new Date().toISOString() }); return reply({ read: true }); }
    if (action === 'read-all') { let count = 0; for (const item of notifications) if (!item.isRead) { item.isRead = true; item.readAtUtc = new Date().toISOString(); count++; } return reply({ updatedCount: count }); }
  }
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
  await (await import('./account-security.browser.mjs')).checkAccountSecurity({ page, context, token, go, visible, shot });
  await (await import('./profile-picture.browser.mjs')).checkProfilePicture({ page, context, token, go, visible, shot });
  await go('/');
  const sidebar = page.getByRole('complementary', { name: 'Sidebar' });
  const administration = sidebar.getByRole('button', { name: 'Administration', exact: true });
  const commerce = sidebar.getByRole('button', { name: 'Commerce', exact: true });
  await visible(commerce);
  assert.equal(await administration.getAttribute('aria-expanded'), 'false');
  assert.equal(await commerce.getAttribute('aria-expanded'), 'true');
  assert.equal(await sidebar.getByRole('link', { name: 'User management', exact: true }).isVisible(), false);
  assert.equal(Math.round((await sidebar.boundingBox()).width), 232);
  assert.ok((await page.locator('.workspace-bar').boundingBox()).height <= 50);
  await shot('compact-navigation-desktop');
  await commerce.focus(); await page.keyboard.press('Enter');
  assert.equal(await sidebar.getByRole('link', { name: 'Orders', exact: true }).isVisible(), false);
  await page.reload(); await visible(commerce);
  assert.equal(await commerce.getAttribute('aria-expanded'), 'false', 'Module collapse survives reload');
  await commerce.click();
  await administration.focus(); await page.keyboard.press('Space');
  await sidebar.getByRole('button', { name: 'Content & email', exact: true }).click();
  await sidebar.getByRole('link', { name: 'SMTP settings', exact: true }).waitFor();
  await administration.click();
  const menuSearch = sidebar.getByRole('searchbox', { name: 'Search menu' });
  await menuSearch.fill('delivery');
  await visible(sidebar.getByRole('link', { name: 'SMTP settings', exact: true }));
  assert.equal(await sidebar.getByRole('link', { name: 'Orders', exact: true }).count(), 0);
  await shot('compact-menu-search');
  await menuSearch.press('Escape');
  assert.equal(await menuSearch.inputValue(), '');
  assert.equal(await administration.getAttribute('aria-expanded'), 'false', 'Search does not overwrite expansion preference');
  await menuSearch.fill('does-not-exist');
  await visible(sidebar.getByRole('status'));
  await sidebar.getByRole('button', { name: 'Clear menu search' }).click();
  await page.getByRole('button', { name: 'Hide sidebar', exact: true }).click();
  assert.equal(await sidebar.isVisible(), false);
  await page.reload(); await visible(page.getByRole('button', { name: 'Show sidebar', exact: true }));
  assert.equal(await sidebar.isVisible(), false, 'Sidebar preference survives reload');
  await page.getByRole('button', { name: 'Show sidebar', exact: true }).click();
  await go('/smtp');
  await visible(sidebar.getByRole('link', { name: 'SMTP settings', exact: true }));
  assert.equal(await administration.getAttribute('aria-expanded'), 'true', 'Deep link opens its ancestors');
  assert.equal(await sidebar.getByRole('link', { name: 'SMTP settings', exact: true }).getAttribute('aria-current'), 'page');
  assert.match(await page.getByRole('navigation', { name: 'Breadcrumb' }).innerText(), /Administration.*Content & email.*SMTP settings/s);
  console.log('PASS compact app-first navigation, nested keyboard toggles, search, persistence, sidebar toggle and deep links');
  await go('/app-notifications');
  const notificationEnvironment = page.getByRole('combobox', { name: 'Notification environment', exact: true });
  const createNotification = page.getByRole('button', { name: 'Create notification', exact: true });
  await visible(createNotification); await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(button => button.textContent.includes('Create notification'))?.disabled);
  assert.equal(await notificationEnvironment.inputValue(), 'sbx');
  await createNotification.click();
  let composer = page.getByRole('dialog', { name: 'Create notification', exact: true });
  await visible(composer);
  await composer.getByLabel('Title', { exact: true }).fill('Report published');
  await composer.getByLabel('Message', { exact: true }).fill('<b>Ready to view</b>');
  await composer.getByRole('button', { name: 'Review notification', exact: true }).click();
  await visible(composer.getByRole('alert').filter({ hasText: 'Select one app user' }));
  await composer.getByLabel('Search app users', { exact: true }).fill('ava');
  await composer.getByRole('button', { name: 'Select ava@example.invalid', exact: true }).click();
  await composer.getByLabel('Alert style', { exact: true }).selectOption('success');
  await composer.getByLabel('Action link (optional)', { exact: true }).fill('javascript:alert(1)');
  await composer.getByRole('button', { name: 'Review notification', exact: true }).click();
  await visible(composer.getByRole('alert').filter({ hasText: 'HTTP(S)' }));
  assert.equal(sentNotifications.sbx.length, 0);
  await composer.getByLabel('Action link (optional)', { exact: true }).fill('/reports');
  await composer.getByLabel('Action label (optional)', { exact: true }).fill('View report');
  await shot('create-notification-desktop');
  await composer.getByRole('button', { name: 'Review notification', exact: true }).click();
  let review = page.getByRole('dialog', { name: 'Review notification', exact: true });
  await visible(review.getByText('Recipient: ava@example.invalid · Sandbox', { exact: true }));
  assert.equal(await review.locator('b').count(), 0, 'Notification messages remain plain text');
  assert.equal(await page.locator('main select').first().isDisabled(), true);
  await shot('review-notification-desktop');
  const sendsBefore = calls.filter(call => call.path.endsWith('/notifications/send')).length;
  await review.getByRole('button', { name: 'Send in Sandbox', exact: true }).dblclick();
  await visible(page.getByText('Notification sent to 1 app user in Sandbox.', { exact: true }));
  assert.equal(calls.filter(call => call.path.endsWith('/notifications/send')).length, sendsBefore + 1, 'Double click sends once');
  assert.equal(sentNotifications.sbx[0].userId, 2); assert.equal(sentNotifications.sbx[0].style, 'success');
  await page.reload(); await visible(page.getByRole('row').filter({ hasText: 'Report published' }));
  await page.getByRole('row').filter({ hasText: 'Report published' }).getByRole('button', { name: 'View recipients' }).click();
  const receipts = page.getByRole('region', { name: 'Notification recipients' });
  await visible(receipts.getByRole('cell', { name: 'ava@example.invalid', exact: true }));
  await receipts.getByLabel('Read state', { exact: true }).selectOption('read');
  await visible(receipts.getByText('No matching recipients.', { exact: true }).last());
  notificationRecipients.get(sentNotifications.sbx[0].id)[0] = { userId: 2, email: 'ava@example.invalid', isRead: true, readAtUtc: '2026-09-24T12:05:00Z' };
  sentNotifications.sbx[0].readCount = 1;
  await receipts.getByRole('button', { name: 'Refresh recipients', exact: true }).click();
  await visible(receipts.getByRole('cell', { name: 'ava@example.invalid', exact: true }));
  await receipts.getByRole('button', { name: 'Close recipients', exact: true }).click();
  await notificationEnvironment.selectOption('prod');
  await visible(page.getByText('No notifications have been sent in Production.', { exact: true }).last());
  assert.equal(await page.getByRole('row').filter({ hasText: 'Report published' }).count(), 0);
  await createNotification.click(); composer = page.getByRole('dialog', { name: 'Create notification', exact: true });
  await composer.getByLabel('Recipients', { exact: true }).selectOption('all');
  await composer.getByLabel('Title', { exact: true }).fill('Maintenance update');
  await composer.getByLabel('Message', { exact: true }).fill('A short maintenance window is scheduled for this evening.');
  await composer.getByLabel('Alert style', { exact: true }).selectOption('warning');
  await composer.getByRole('button', { name: 'Review notification', exact: true }).click();
  review = page.getByRole('dialog', { name: 'Review notification', exact: true });
  await visible(review.getByText('This sends to every current app user in this tenant in Production.', { exact: true }));
  notificationSendFails = true;
  await review.getByRole('button', { name: 'Send in Production', exact: true }).click();
  await visible(review.getByRole('alert').filter({ hasText: 'Cloudgate could not complete' }));
  await visible(review.getByText(/Delivery may have completed/));
  assert.equal(sentNotifications.prod.length, 0);
  await review.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Refresh history', exact: true }).click();
  await visible(page.getByText('No notifications have been sent in Production.', { exact: true }).last());
  await createNotification.click(); composer = page.getByRole('dialog', { name: 'Create notification', exact: true });
  assert.equal(await composer.getByLabel('Title', { exact: true }).inputValue(), 'Maintenance update', 'Failed send retains the draft');
  notificationSendFails = false;
  await composer.getByRole('button', { name: 'Review notification', exact: true }).click();
  await page.getByRole('dialog', { name: 'Review notification', exact: true }).getByRole('button', { name: 'Send in Production', exact: true }).click();
  await visible(page.getByText('Notification sent to 2 app users in Production.', { exact: true }));
  assert.equal(sentNotifications.prod[0].allUsers, true); assert.equal(sentNotifications.prod[0].userId, undefined);
  await shot('app-notifications-desktop');
  notificationAdminAccess = 'denied'; await page.getByRole('button', { name: 'Refresh history', exact: true }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'Administrator access was revoked' }));
  assert.equal(await createNotification.isDisabled(), true);
  notificationAdminAccess = 'unavailable'; await page.getByRole('button', { name: 'Refresh history', exact: true }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'not available on this Cloudgate server' }));
  assert.equal(await createNotification.isDisabled(), true);
  notificationAdminAccess = 'allowed'; await page.getByRole('button', { name: 'Refresh history', exact: true }).click();
  await visible(page.getByRole('row').filter({ hasText: 'Maintenance update' }));
  console.log('PASS notification creation, review, safe links/plain text, recipient search, environment isolation, read receipts, duplicate clicks, retained drafts and denied/unavailable server');

  assert.equal(accountLinked, false, 'Admin settings work before any account linking');
  await go('/email-template');
  const templateToggle = page.getByRole('switch', { name: 'Use custom template', exact: true });
  const templateEditor = page.getByRole('textbox', { name: 'Template HTML', exact: true });
  const templateSave = page.getByRole('button', { name: 'Save changes', exact: true });
  const templatePreview = page.frameLocator('iframe[title="Email preview"]');
  await visible(templateEditor);
  assert.equal(await templateToggle.isChecked(), false); assert.equal(await templateSave.isDisabled(), true);
  const defaultHtml = await templateEditor.inputValue(); assert.ok(defaultHtml.includes('${body}'));
  await templatePreview.getByRole('heading', { name: 'Reset your password' }).waitFor();
  assert.equal(await page.locator('iframe[title="Email preview"]').getAttribute('sandbox'), '');
  const smtpBeforeTemplate = JSON.stringify(smtp);
  await templateToggle.check(); await templateEditor.fill('<h1>Welcome</h1>');
  await visible(page.getByRole('alert').filter({ hasText: 'Include ${body}' }));
  assert.equal(await templateSave.isDisabled(), true);
  await templateEditor.evaluate(input => { input.setSelectionRange(input.value.length, input.value.length); });
  await page.getByRole('button', { name: 'Insert body field', exact: true }).click();
  assert.equal(await templateEditor.inputValue(), '<h1>Welcome</h1>${body}');
  await templateSave.click();
  await visible(page.getByText('Custom email template saved and enabled for this tenant.', { exact: true }));
  await page.reload(); await visible(templateEditor);
  assert.equal(await templateEditor.inputValue(), '<h1>Welcome</h1>${body}'); assert.equal(await templateToggle.isChecked(), true);
  await page.getByRole('button', { name: 'Restore default', exact: true }).click();
  assert.equal(await templateEditor.inputValue(), defaultHtml);
  assert.equal(emailTemplate.templateHtml, '<h1>Welcome</h1>${body}', 'Restore does not save automatically');
  await page.getByRole('button', { name: 'Undo restore', exact: true }).click();
  assert.equal(await templateEditor.inputValue(), '<h1>Welcome</h1>${body}');
  const hostile = '<style>body{background:rgb(1,2,3)}</style><script>parent.__templateScriptRan=true</script><meta http-equiv="refresh" content="0;url=https://example.invalid"><iframe src="https://example.invalid"></iframe><img src="data:," onerror="parent.__templateScriptRan=true"><a href="https://example.invalid">Preview link</a><h1>${title}</h1>${body}<p>${EMAIL} / ${unknown}</p>';
  const parentBackground = await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor);
  await templateEditor.fill(hostile);
  await templatePreview.getByRole('heading', { name: 'Reset your password' }).waitFor();
  assert.equal(await templatePreview.locator('script, iframe, meta[http-equiv="refresh"], [onerror], a[href]').count(), 0);
  assert.equal(await page.evaluate(() => window.__templateScriptRan), undefined);
  assert.equal(await page.locator('body').evaluate(node => getComputedStyle(node).backgroundColor), parentBackground);
  await visible(templatePreview.getByText('jane@example.com /', { exact: true }));
  templateSaveFails = true;
  await templateSave.click(); await visible(page.getByRole('alert').filter({ hasText: 'Cloudgate could not complete this request' }));
  assert.equal(await templateEditor.inputValue(), hostile); assert.equal(emailTemplate.templateHtml, '<h1>Welcome</h1>${body}');
  templateSaveFails = false;
  await page.getByRole('button', { name: 'Restore default', exact: true }).click(); await templateSave.click();
  await visible(page.getByText('Custom email template saved and enabled for this tenant.', { exact: true }));
  await templatePreview.getByRole('heading', { name: 'Reset your password' }).waitFor();
  assert.equal(await templateEditor.evaluate(input => input.scrollLeft), 0, 'Restore resets the editor horizontal position');
  await page.setViewportSize({ width: 1440, height: 1250 });
  await page.locator('main').evaluate(main => { main.scrollTop = 0; });
  await shot('email-template-desktop');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await templateToggle.uncheck(); await templateSave.click();
  await visible(page.getByText('Template saved. App-user emails use the standard Cloudgate layout.', { exact: true }));
  await page.reload(); await visible(templateEditor);
  assert.equal(await templateToggle.isChecked(), false); assert.equal(await templateEditor.inputValue(), defaultHtml);
  assert.equal(JSON.stringify(smtp), smtpBeforeTemplate, 'Template editing leaves SMTP untouched');
  await templateToggle.check(); role = 'User'; await templateSave.click();
  await visible(page.getByRole('alert').filter({ hasText: 'IdP account with the Admin role' }));
  assert.equal(await page.getByRole('link', { name: 'Manage linked Cloudgate account' }).count(), 0);
  role = 'Admin';
  assert.equal(await templateEditor.isDisabled(), true);
  for (const access of ['denied', 'unavailable']) {
    templateAccess = access; await page.getByRole('button', { name: 'Reload settings', exact: true }).click();
    await visible(page.getByRole('alert')); assert.equal(await templateEditor.isDisabled(), true);
  }
  templateAccess = 'allowed'; await page.getByRole('button', { name: 'Reload settings', exact: true }).click();
  await visible(templateEditor); assert.equal(await templateEditor.isDisabled(), false);
  console.log('PASS email template persistence, merge insertion, validation, restore/undo, isolated preview, disabled draft retention and permission/failure recovery');

  await go('/registration');
  const registrationToggle = page.getByRole('switch', { name: 'Allow self-registration', exact: true });
  const saveRegistration = page.getByRole('button', { name: 'Save changes', exact: true });
  await visible(registrationToggle);
  assert.equal(await registrationToggle.isChecked(), false);
  assert.equal(await saveRegistration.isDisabled(), true);
  await visible(page.getByText('This setting applies to all apps in your Cloudgate tenant, across sandbox and production.', { exact: true }));
  await registrationToggle.check(); await saveRegistration.click();
  await visible(page.getByText('Self-registration enabled for this tenant.', { exact: true }));
  assert.equal(allowSelfRegistration, true);
  await page.reload(); await visible(registrationToggle);
  assert.equal(await registrationToggle.isChecked(), true);
  await shot('registration-desktop');
  registrationSaveFails = true;
  await registrationToggle.uncheck(); await saveRegistration.click();
  await visible(page.getByRole('alert').filter({hasText:'Cloudgate could not complete this request'}));
  assert.equal(allowSelfRegistration, true);
  await visible(page.getByText('Currently enabled', {exact:true}));
  await visible(page.getByText('Unsaved changes', {exact:true}));
  registrationSaveFails = false;
  await saveRegistration.click();
  await visible(page.getByText('Self-registration disabled for this tenant.', {exact:true}));
  assert.equal(allowSelfRegistration, false);
  await page.reload(); await visible(registrationToggle);
  assert.equal(await registrationToggle.isChecked(), false);
  await registrationToggle.check(); role = 'User';
  await saveRegistration.click();
  await visible(page.getByRole('alert').filter({hasText:'IdP account with the Admin role'}));
  assert.equal(await registrationToggle.isDisabled(), true);
  assert.equal(allowSelfRegistration, false, 'An IdP role revoked after loading cannot change the setting');
  assert.equal(await page.getByRole('link', {name:'Manage linked Cloudgate account',exact:true}).count(), 0);
  role = 'Admin';
  registrationAccess = 'denied';
  await page.getByRole('button', {name:'Reload setting',exact:true}).click();
  await visible(page.getByRole('alert').filter({hasText:'IdP account with the Admin role'}));
  assert.equal(await registrationToggle.isDisabled(), true);
  registrationAccess = 'unavailable';
  await page.getByRole('button', {name:'Reload setting',exact:true}).click();
  await visible(page.getByRole('alert').filter({hasText:'not available on this Cloudgate server'}));
  assert.equal(await saveRegistration.isDisabled(), true);
  registrationAccess = 'allowed';
  await page.getByRole('button', {name:'Reload setting',exact:true}).click();
  await visible(registrationToggle); assert.equal(await registrationToggle.isDisabled(), false);
  console.log('PASS registration without ABP link, enable/disable persistence, failure recovery, revoked IdP role and unavailable backend');
  await go('/profile');
  await visible(page.getByRole('button', { name: 'Link Cloudgate account', exact: true }));
  const popupPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Link Cloudgate account', exact: true }).click();
  const linkPopup = await popupPromise;
  await linkPopup.waitForURL('https://hub.example.invalid/account-link**');
  assert.equal(new URL(linkPopup.url()).hash, `#code=${linkCode}&popup=1`);
  await visible(page.getByText('Waiting for you to sign in and approve the link in Cloudgate.'));
  const linkingButton = page.getByRole('button', { name: 'Linking…', exact: true });
  await visible(linkingButton);
  assert.equal(await linkingButton.isDisabled(), true);
  assert.equal(await linkingButton.getAttribute('aria-busy'), 'true');
  assert.equal(await page.getByRole('link', { name: 'Continue in this window' }).count(), 0);
  await visible(page.getByRole('button', { name: 'Cancel linking' }));
  accountApproved = true;
  await visible(page.getByText('Alex Cloudgate', { exact: true }));
  await visible(page.getByRole('img', { name: 'Profile picture of Alex Cloudgate' }));
  await page.getByRole('img', { name: 'Profile picture of Alex Cloudgate' }).evaluate(image => image.decode());
  await shot('linked-account-photo');
  await page.getByRole('img', { name: 'Profile picture of Alex Cloudgate' }).evaluate(image => image.dispatchEvent(new Event('error')));
  await visible(page.getByText('AC', { exact: true }));
  linkedPhoto = false;
  await page.reload();
  await visible(page.getByText('Alex Cloudgate', { exact: true }));
  await visible(page.getByText('AC', { exact: true }));
  linkedPhoto = true;
  await page.getByRole('button', { name: 'Detach Cloudgate account' }).click();
  await visible(page.getByRole('button', { name: 'Link Cloudgate account', exact: true }));
  assert.equal(accountLinked, false);
  await go('/registration'); await visible(registrationToggle);
  await registrationToggle.check(); await saveRegistration.click();
  await visible(page.getByText('Self-registration enabled for this tenant.', { exact: true }));
  await go('/email-template'); await visible(templateEditor);
  await templateToggle.check(); await templateSave.click();
  await visible(page.getByText('Custom email template saved and enabled for this tenant.', { exact: true }));
  assert.equal(accountLinked, false, 'Detaching ABP does not revoke the IdP Admin settings access');
  await go('/profile');
  const cancelledPopupPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: 'Link Cloudgate account', exact: true }).click();
  const cancelledPopup = await cancelledPopupPromise;
  await cancelledPopup.waitForURL('https://hub.example.invalid/account-link**');
  await visible(page.getByRole('button', { name: 'Cancel linking' }));
  const deletesBeforeCancel = calls.filter(call => call.path.endsWith('/profile/cloudgate-link') && call.method === 'DELETE').length;
  await page.getByRole('button', { name: 'Cancel linking' }).click();
  await visible(page.getByRole('button', { name: 'Link Cloudgate account', exact: true }));
  assert.equal(calls.filter(call => call.path.endsWith('/profile/cloudgate-link') && call.method === 'DELETE').length, deletesBeforeCancel + 1);
  assert.equal(await page.evaluate(() => Object.keys(sessionStorage).some(key => key.startsWith('cloudgate-link:'))), false);
  // Removing window.opener isolates the sign-in window, so browsers may block the parent's
  // best-effort close. Cancellation must revoke the request and allow a fresh start regardless.
  await cancelledPopup.close();
  // Blocked popup: redirect automatically, then resume the saved request on return.
  await page.evaluate(() => { window.open = () => null; });
  await page.getByRole('button', { name: 'Link Cloudgate account', exact: true }).click();
  await page.waitForURL('https://hub.example.invalid/account-link**');
  assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(1)).has('popup'), false, 'Redirect fallback must not close the app tab');
  await go('/profile');
  await visible(linkingButton);
  await page.reload();
  await visible(linkingButton);
  accountApproved = true;
  await visible(page.getByText('Alex Cloudgate', { exact: true }));
  await page.getByRole('button', { name: 'Detach Cloudgate account' }).click();
  await visible(page.getByRole('button', { name: 'Link Cloudgate account', exact: true }));
  assert.equal(accountLinked, false);
  console.log('PASS account link busy button, popup, persistence, detach with retained IdP Admin settings access and blocked-popup redirect');
  const dock = page.getByRole('button', { name: /^Developers/ });
  const developer = page.getByRole('dialog', { name: 'Developer workspace', exact: true });
  await dock.click();
  await visible(developer.getByRole('alert').filter({ hasText: 'Link your Cloudgate account' }));
  assert.equal(await page.locator('iframe[title="Cloudgate developer workspace"]').count(), 0);
  accountLinked = true;
  await developer.getByRole('button', { name: 'Reconnect', exact: true }).click();
  const devFrame = page.frameLocator('iframe[title="Cloudgate developer workspace"]');
  await visible(devFrame.getByRole('heading', { name: 'Cloudgate developer tools' }));
  await visible(developer.getByText('Project locked', { exact: true }));
  await devFrame.getByRole('textbox', { name: 'Workflow draft' }).fill('Unsaved workflow');
  await shot('developer-workspace-desktop');
  await developer.getByRole('button', { name: 'Minimize developer workspace' }).click();
  await developer.waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Detach Cloudgate account' }).isVisible();
  await dock.click();
  assert.equal(await devFrame.getByRole('textbox', { name: 'Workflow draft' }).inputValue(), 'Unsaved workflow');
  const frameCount = calls.filter(c => c.path.endsWith('/developer-workspace')).length;
  await page.evaluate(() => window.dispatchEvent(new MessageEvent('message', { origin: 'https://hub.example.invalid', source: window, data: { source: 'cloudgate-developer', type: 'expired' } })));
  assert.equal(await devFrame.getByRole('textbox', { name: 'Workflow draft' }).inputValue(), 'Unsaved workflow', 'Forged messages cannot terminate the frame');
  await page.setViewportSize({ width: 360, height: 800 });
  await shot('developer-workspace-mobile');
  assert.ok(await developer.evaluate(el => el.getBoundingClientRect().width <= innerWidth));
  await developer.getByRole('button', { name: 'End developer session' }).click();
  await developer.waitFor({ state: 'hidden' });
  assert.equal(await page.locator('iframe[title="Cloudgate developer workspace"]').count(), 0);
  assert.equal(calls.filter(c => c.path.endsWith('/developer-workspace')).length, frameCount);
  accountLinked = false;
  await page.setViewportSize({ width: 1440, height: 1000 });
  console.log('PASS linked-account developer gate, IdP launch, trusted-frame messages, desktop/mobile dock, draft preserved on minimize, session end');
  await go('/');
  const notificationPopup = page.getByRole('dialog', { name: 'Notifications', exact: true });
  await page.getByRole('button', { name: 'Notifications, 2 unread' }).click();
  await visible(notificationPopup.getByText('Order ready', { exact: true }));
  assert.equal(new URL(page.url()).pathname, '/', 'The bell opens a popup without changing pages');
  assert.equal(await notificationPopup.getByRole('listitem').count(), 2);
  await visible(notificationPopup.locator('[data-notification-style="success"]').getByRole('img', { name: 'Success', exact: true }));
  await visible(notificationPopup.locator('[data-notification-style="info"]').getByRole('img', { name: 'Info', exact: true }));
  assert.ok(notifications.every(item => !item.isRead), 'Previewing notifications does not mark them read');
  assert.equal(await notificationPopup.getByText('New', { exact: true }).count(), 2);
  assert.equal(await notificationPopup.getByText('Read', { exact: true }).count(), 0);
  assert.equal(await notificationPopup.getByRole('link', { name: 'View all notifications' }).getAttribute('href'), '/notifications');
  await shot('notification-popup-desktop');
  await page.keyboard.press('Escape');
  await notificationPopup.waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Notifications, 2 unread');
  await page.getByRole('button', { name: 'Notifications, 2 unread' }).click();
  await visible(notificationPopup);
  await page.getByRole('heading', { name: 'Your overview starts here', exact: true }).click();
  await notificationPopup.waitFor({ state: 'detached' });
  await page.getByRole('button', { name: 'Notifications, 2 unread' }).click();
  await notificationPopup.getByRole('link', { name: 'View all notifications' }).click();
  await visible(page.getByRole('heading', { name: 'Notifications', exact: true }));
  await notificationPopup.waitFor({ state: 'detached' });
  assert.equal(new URL(page.url()).pathname, '/notifications');
  console.log('PASS bell popup previews, full inbox link, outside click, Escape and focus restoration');

  await go('/notifications');
  await visible(page.getByRole('heading', { name: 'Order ready', exact: true }));
  assert.deepEqual(await page.getByRole('table').getByRole('columnheader').allTextContents(), ['Notification', 'Style', 'Status', 'Received', 'Actions']);
  assert.equal(await page.getByRole('table').locator('tbody tr').count(), 2);
  await visible(page.getByRole('button', { name: 'Notifications, 2 unread' }));
  await visible(page.getByText('Live updates connected', { exact: true }));
  assert.equal(await page.locator('main a[href^="javascript:"]').count(), 0);
  await visible(page.getByRole('table').getByText('<b>This is plain text</b>', { exact: true }));
  await shot('notifications-desktop');
  await page.getByRole('row').filter({ hasText: 'Account update' }).getByRole('button', { name: 'Mark read', exact: true }).click();
  await visible(page.getByRole('button', { name: 'Notifications, 1 unread' }));
  await visible(page.getByRole('row').filter({ hasText: 'Account update' }).getByText('Read', { exact: true }));
  await visible(page.getByRole('row').filter({ hasText: 'Order ready' }).getByText('New', { exact: true }));
  const originalTheme = await page.evaluate(() => document.documentElement.dataset.theme);
  for (const [name, width, dark] of [['light', 1440, false], ['dark', 1440, true], ['mobile', 360, false]]) {
    await page.setViewportSize({ width, height: width === 360 ? 800 : 1000 });
    await page.evaluate(dark => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, dark);
    await page.getByRole('button', { name: 'Notifications, 1 unread' }).click();
    const newItem = notificationPopup.locator('[data-notification-read="false"]');
    const readItem = notificationPopup.locator('[data-notification-read="true"]');
    await visible(newItem.getByText('New', { exact: true }));
    await visible(readItem.getByText('Read', { exact: true }));
    const rows = await notificationPopup.getByRole('listitem').evaluateAll(items => items.map(item => ({
      background: getComputedStyle(item).backgroundColor, border: getComputedStyle(item).borderLeftWidth,
      height: item.getBoundingClientRect().height,
    })));
    assert.equal(rows.length, 2);
    assert.ok(rows.every(row => row.background === 'rgba(0, 0, 0, 0)' && row.border === '0px'), 'Notification rows have no tint or colored side border');
    assert.ok(rows.every(row => row.height < 100), 'Read labels keep rows compact');
    if (process.env.ADMIN_TEST_OUTPUT_DIR) await notificationPopup.screenshot({ path: path.join(process.env.ADMIN_TEST_OUTPUT_DIR, `notification-read-state-${name}.png`), animations: 'disabled' });
    await page.keyboard.press('Escape');
    await notificationPopup.waitFor({ state: 'detached' });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, originalTheme);
  await page.getByRole('button', { name: 'Unread', exact: true }).click();
  await page.getByRole('heading', { name: 'Account update', exact: true }).waitFor({ state: 'detached' });
  await page.getByRole('link', { name: 'View order', exact: true }).click();
  await visible(page.getByRole('heading', { name: 'Order management starts here', exact: true }));
  assert.equal(notifications[0].isRead, true);
  await go('/notifications');
  await page.getByRole('button', { name: 'Notifications, 0 unread' }).click();
  await visible(notificationPopup.getByText('Order ready', { exact: true }));
  notifications.unshift({ id: 'notification-3', title: 'Live update arrived', body: 'Delivered while this inbox was open.', style: 'danger', creationTime: '2026-09-23T11:00:00Z', isRead: false });
  await visible(page.getByText('Live updates connected', { exact: true }));
  for (const socket of notificationSockets) socket.send(JSON.stringify({ type: 'notificationsChanged', environment: 'sbx' }));
  await visible(page.getByRole('heading', { name: 'Live update arrived', exact: true }));
  await visible(notificationPopup.getByText('Live update arrived', { exact: true }));
  await visible(notificationPopup.locator('[data-notification-style="danger"]').getByRole('img', { name: 'Danger', exact: true }));
  await notificationPopup.getByRole('link', { name: 'View all notifications' }).click();
  await notificationPopup.waitFor({ state: 'detached' });
  await visible(page.getByRole('button', { name: 'Notifications, 1 unread' }));
  await page.getByRole('button', { name: 'Mark all read', exact: true }).click();
  await visible(page.getByRole('button', { name: 'Notifications, 0 unread' }));
  await page.getByRole('button', { name: 'Unread', exact: true }).click();
  await visible(page.getByRole('cell', { name: 'You’re all caught up.', exact: true }));
  notificationsUnavailable = true;
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'Cloudgate could not complete this request' }));
  await page.getByRole('button', { name: 'Notifications, 0 unread' }).click();
  await visible(notificationPopup.getByRole('alert').filter({ hasText: 'Cloudgate could not complete this request' }));
  await visible(notificationPopup.getByRole('link', { name: 'View all notifications' }));
  notificationsUnavailable = false;
  await notificationPopup.getByRole('button', { name: 'Try again' }).click();
  await visible(notificationPopup.getByText('Live update arrived', { exact: true }));
  await notificationPopup.getByRole('button', { name: 'Close notifications' }).click();
  await notificationPopup.waitFor({ state: 'detached' });
  const savedNotifications = notifications;
  notifications = [];
  await page.getByRole('button', { name: 'Notifications, 0 unread' }).click();
  await visible(notificationPopup.getByText('No notifications yet.', { exact: true }));
  await visible(notificationPopup.getByRole('link', { name: 'View all notifications' }));
  await page.keyboard.press('Escape');
  await notificationPopup.waitFor({ state: 'detached' });
  notifications = savedNotifications;
  console.log('PASS notification inbox, badge, live WebSocket refresh, read receipts, safe links and failure states');

  notifications = ['info', 'success', 'warning', 'danger'].map(style => ({ id: 'style-' + style, title: style[0].toUpperCase() + style.slice(1) + ' notification', body: 'This update uses the ' + style + ' alert style.', style, creationTime: '2026-09-23T12:00:00Z', isRead: true }));
  await go('/notifications');
  await visible(page.getByRole('heading', { name: 'Warning notification', exact: true }));
  const checkStyles = async selector => {
    // Capture one rendered frame: a WebSocket resync can replace the list with a spinner.
    const snapshot = await page.waitForFunction(selector => {
      const items = [...document.querySelectorAll(selector + ' [data-notification-style]')].filter(el => el.getClientRects().length);
      return items.length === 4 && items.map(el => ({ style: el.dataset.notificationStyle, text: el.textContent,
        icons: el.querySelector('span.inline-flex').querySelectorAll('svg').length, color: getComputedStyle(el.querySelector('span.inline-flex')).color }));
    }, selector);
    const appearances = await snapshot.jsonValue(); await snapshot.dispose();
    for (const item of appearances) {
      assert.ok(item.text.includes(item.style[0].toUpperCase() + item.style.slice(1)));
      assert.equal(item.icons, 1, 'Each alert has an icon in addition to color');
    }
    assert.equal(new Set(appearances.map(item => item.color)).size, 4, 'All four alert styles have distinct badge colors');
  };
  const previousTheme = await page.evaluate(() => document.documentElement.dataset.theme);
  for (const dark of [false, true]) {
    await page.evaluate(dark => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, dark);
    await checkStyles('main'); await shot(`notification-styles-${dark ? 'dark' : 'light'}`);
    await page.getByRole('button', { name: 'Notifications, 0 unread' }).click();
    await checkStyles('[role="dialog"]'); await shot(`notification-popup-styles-${dark ? 'dark' : 'light'}`);
    await page.keyboard.press('Escape'); await notificationPopup.waitFor({ state: 'detached' });
  }
  await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, previousTheme);
  notifications = savedNotifications;
  console.log('PASS all four alert styles, legacy info default, realtime style updates, icons and light/dark inbox and popup rendering');

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
  await visible(page.getByRole('alert').filter({ hasText: 'Cloudgate could not complete this request' }));
  usersFail = false;
  console.log('PASS user CRUD, activation, reset, confirmation, protected accounts and failure states');
  await (await import('./role-management.browser.mjs')).checkRoleManagement({ page, context, token, calls, getUsers: () => users, go, visible, shot });

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
  await (await import('./payments.browser.mjs')).checkPayments({ page, context, token, go, visible, shot });
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
  await page.getByRole('button', { name: 'Notifications, 0 unread' }).click();
  await visible(notificationPopup.getByText('Live update arrived', { exact: true }));
  const popupBounds = await notificationPopup.boundingBox();
  assert.ok(popupBounds.x >= 0 && popupBounds.x + popupBounds.width <= 360, 'Notification popup fits the mobile width');
  assert.ok(popupBounds.y >= 0 && popupBounds.y + popupBounds.height <= 800, 'Notification popup fits the mobile height');
  await shot('notification-popup-mobile');
  await notificationPopup.getByRole('link', { name: 'View all notifications' }).click();
  await notificationPopup.waitFor({ state: 'detached' });
  assert.equal(new URL(page.url()).pathname, '/notifications');
  await go('/users');
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Navigation' });
  await visible(dialog);
  await shot('compact-navigation-mobile');
  assert.ok((await dialog.getByRole('button', { name: 'Commerce', exact: true }).boundingBox()).height >= 42);
  const mobileSearch = dialog.getByRole('searchbox', { name: 'Search menu' });
  await mobileSearch.fill('theme');
  await visible(dialog.getByRole('link', { name: 'Theme styling', exact: true }));
  await mobileSearch.press('Escape');
  assert.equal(await mobileSearch.inputValue(), '');
  await visible(dialog);
  for (let i = 0; i < 18; i++) { await page.keyboard.press('Tab'); assert.ok(await dialog.evaluate(el => el.contains(document.activeElement))); }
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Open menu');
  assert.equal(await page.getByRole('button', { name: 'Open menu', exact: true }).evaluate(el => el === document.activeElement), true);
  for (const route of ['/', '/orders', '/notifications', '/app-notifications', '/users', '/registration', '/email-template', '/theme', '/appearance', '/smtp', '/media', '/payments', '/analytics', '/logs', '/about']) {
    await go(route);
    await page.waitForLoadState('networkidle');
    const width = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, viewport: innerWidth, main: document.querySelector('main').scrollWidth, mainViewport: document.querySelector('main').clientWidth }));
    assert.ok(width.doc <= width.viewport, `${route}: horizontal overflow ${JSON.stringify(width)}`);
    assert.ok(width.main <= width.mainViewport, `${route}: content overflow ${JSON.stringify(width)}`);
    if (route === '/' || route === '/orders') await shot(route === '/' ? 'dashboard-mobile' : 'orders-mobile');
    if (route === '/notifications') await shot('notifications-mobile');
    if (route === '/app-notifications') {
      await shot('app-notifications-mobile');
      await createNotification.click();
      await visible(page.getByRole('dialog', { name: 'Create notification', exact: true }));
      await shot('create-notification-mobile');
      await page.keyboard.press('Escape');
      await page.getByRole('dialog', { name: 'Create notification', exact: true }).waitFor({ state: 'detached' });
    }
    if (route === '/registration') await shot('registration-mobile');
    if (route === '/email-template') {
      await visible(templateEditor);
      await shot('email-template-mobile');
      await page.locator('iframe[title="Email preview"]').scrollIntoViewIfNeeded();
      await shot('email-template-preview-mobile');
    }
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
  await page.goto(`${origin}/app-notifications`);
  await visible(page.getByRole('heading', { name: 'Back office access required' }));
  assert.equal(calls.slice(count).filter(call => call.path.includes('/admin/notifications/')).length, 0);
  assert.equal(calls.filter(call => call.path === '/sbx/admin/settings').length, 0);
  assert.equal(calls.filter(call => call.path === '/sbx/admin/payments').length, 0);
  assert.equal(calls.filter(call => /^\/(sbx|prod)\/admin\/(dashboard|orders|users)$/.test(call.path)).length, 0, 'Placeholders and legacy sample URLs never call sample workflows');
  await page.goto(`${origin}/roles`);
  await visible(page.getByRole('heading', { name: 'Back office access required' }));
  assert.equal(calls.slice(count).filter(call => call.path.includes('/admin/roles/') || call.path.includes('/admin/users/set-role')).length, 0);
  console.log('PASS non-admin users cannot open back office or trigger admin data calls');
  assert.deepEqual(errors, []);
  console.log('PASS no browser runtime errors');
} catch (error) {
  await shot('failure');
  console.error(errors, await page.locator('body').innerText());
  throw error;
} finally {
  await context.close(); await browser.close(); await new Promise(resolve => server.httpServer.close(resolve));
}
