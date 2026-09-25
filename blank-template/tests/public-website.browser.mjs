// Exercise the shipped template with intercepted APIs; no tenant settings are changed.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';
import { build, preview } from 'vite';
import viteConfig from '../vite.config.js';
import { DEFAULT_SETTINGS } from '@cloudgatedevs/cloudgate-client/platform';

const appId = '12345678-1234-1234-1234-123456789abc', origin = 'http://127.0.0.1:3198';
const env = { VITE_IDP_BASE_URL: 'https://hub.example.invalid', VITE_IDP_API_URL: 'https://api.example.invalid',
  VITE_IDP_TENANCY_NAME: 'qa', VITE_IDP_RETURN_URL: `${origin}/`, VITE_CLOUDGATE_WEB_APP_ID: appId,
  VITE_CLOUDGATE_API_URL: 'https://api.example.invalid', VITE_CLOUDGATE_API_ENV: 'sbx',
  VITE_CLOUDGATE_API_PROJECT: '', VITE_CLOUDGATE_MEDIA_FOLDER: '', VITE_API_KEY: '', VITE_API_SECRET: '' };
await build({ ...viteConfig({ mode: 'production' }), configFile: false, logLevel: 'warn',
  esbuild: { tsconfigRaw: { compilerOptions: {} } },
  define: Object.fromEntries(Object.entries(env).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)])) });
const server = await preview({ configFile: false, preview: { host: '127.0.0.1', port: 3198, strictPort: true } });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
let settings = { ...DEFAULT_SETTINGS, app_name: 'Admin Stuff', app_description: 'A home for your community, ideas, and everyday work.' };
let revision = randomUUID(), allowSelfRegistration = true, unavailable = false, saveFailure = 0;
const errors = [], calls = [], contexts = [];
const token = `e30.${Buffer.from(JSON.stringify({ sub: '1', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test`;
async function open(role, url = '/', viewport = { width: 1440, height: 1000 }) {
  const context = await browser.newContext({ viewport, ...(role ? { storageState: { cookies: [], origins: [{ origin, localStorage: [{ name: 'idp_access_token', value: token }] }] } } : {}) });
  contexts.push(context);
  await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ body: '', contentType: 'text/css' }));
  await context.route('https://hub.example.invalid/idp/qa/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Hosted authentication</h1>' }));
  await context.route('**/cg-analytics.json', route => route.fulfill({ json: { webAppId: appId, isProduction: false } }));
  await context.routeWebSocket('wss://api.example.invalid/**', socket => socket.send(JSON.stringify({ type: 'ready', environment: 'sbx' })));
  await context.route('https://api.example.invalid/**', async route => {
    const request = route.request(), url = new URL(request.url());
    const body = request.postData() ? request.postDataJSON() : null;
    calls.push({ path: url.pathname, role, body });
    const reply = (json, status = 200) => route.fulfill({ json, status });
    if (url.pathname.endsWith('/website')) {
      assert.equal(request.headers().authorization, undefined);
      assert.equal(url.searchParams.get('webAppId'), appId); assert.equal(url.searchParams.get('environment'), 'sbx');
      return unavailable ? reply({ message: 'Temporarily unavailable' }, 503) : reply({ values: settings, revision, allowSelfRegistration });
    }
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    if (url.pathname.endsWith('/profile')) return reply({ id: 1, name: 'Alex', surname: 'Member', email: 'alex@example.invalid', role: role || 'Admin', isEmailConfirmed: true });
    if (url.pathname.includes('/notifications/')) return reply(url.pathname.endsWith('/unread-count') ? { unreadCount: 0 } : { items: [], totalCount: 0 });
    if (url.pathname.endsWith('/admin/appearance/update')) {
      assert.equal(role, 'Admin'); assert.equal(body.webAppId, appId); assert.equal(body.environment, 'sbx');
      assert.deepEqual(Object.keys(body.values), ['enable_public_website']);
      assert.equal(body.revision, revision);
      if (saveFailure) return reply({ message: 'Settings could not be saved.' }, saveFailure);
      settings = { ...settings, ...body.values }; revision = randomUUID();
      return reply({ values: settings, revision });
    }
    if (url.pathname.endsWith('/admin/registration')) {
      if (request.method() === 'PUT') allowSelfRegistration = body.allowSelfRegistration;
      return reply({ allowSelfRegistration, promptForEmailVerification: false, scope: 'tenant' });
    }
    errors.push(`Unexpected request ${url.pathname}`);
    return reply({}, 500);
  });
  const page = await context.newPage(); page.setDefaultTimeout(10000);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}${url}`);
  return page;
}
const visible = locator => locator.waitFor({ state: 'visible' });
async function shot(page, name) {
  if (!process.env.ADMIN_TEST_OUTPUT_DIR) return;
  await fs.mkdir(process.env.ADMIN_TEST_OUTPUT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(process.env.ADMIN_TEST_OUTPUT_DIR, `${name}.png`), fullPage: true, animations: 'disabled' });
}
try {
  const guest = await open();
  await visible(guest.getByRole('button', { name: 'Log in', exact: true }));
  const signup = new URL(await guest.getByRole('link', { name: 'Sign up', exact: true }).getAttribute('href'));
  assert.equal(signup.pathname, '/idp/qa/signup'); assert.equal(signup.searchParams.get('returnUrl'), `${origin}/`);
  assert.equal(calls.some(call => call.path !== '/api/idp/qa/website'), false, 'Guests load no profile or back-office APIs');
  assert.equal(Math.round((await guest.locator('.public-header').boundingBox()).width), 1440);
  await shot(guest, 'public-home-desktop');
  await guest.setViewportSize({ width: 360, height: 800 });
  assert.equal(await guest.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await shot(guest, 'public-home-mobile');
  allowSelfRegistration = false; await guest.reload(); await visible(guest.getByRole('button', { name: 'Log in', exact: true }));
  assert.equal(await guest.getByRole('link', { name: 'Sign up', exact: true }).count(), 0);
  await guest.getByRole('button', { name: 'Log in', exact: true }).click();
  await guest.waitForURL('https://hub.example.invalid/idp/qa/login**');
  assert.equal(new URL(guest.url()).searchParams.get('returnUrl'), `${origin}/`);
  console.log('PASS anonymous home, registration policy, tenant login and responsive header');

  const member = await open('User');
  await visible(member.getByRole('button', { name: 'Log out', exact: true }));
  assert.equal(await member.getByRole('link', { name: 'Back office', exact: true }).count(), 0);
  const before = calls.length;
  await member.goto(`${origin}/backoffice/users`);
  await visible(member.getByRole('heading', { name: 'Back office access required' }));
  assert.equal(calls.slice(before).some(call => call.path.includes('/admin/')), false);

  const admin = await open('Admin');
  await admin.getByRole('link', { name: 'Back office', exact: true }).click();
  await visible(admin.getByRole('heading', { name: 'Dashboard', exact: true }));
  assert.equal(new URL(admin.url()).pathname, '/backoffice');
  const sidebar = admin.getByRole('complementary', { name: 'Sidebar' });
  await sidebar.getByRole('button', { name: 'Administration', exact: true }).click();
  await sidebar.getByRole('link', { name: 'Settings', exact: true }).click();
  await visible(admin.getByRole('checkbox', { name: 'Enable public website' }));
  assert.equal(new URL(admin.url()).pathname, '/backoffice/settings');
  await shot(admin, 'website-settings');
  const toggle = admin.getByRole('checkbox', { name: 'Enable public website' }), save = admin.getByRole('button', { name: 'Save changes' });
  await toggle.uncheck(); await save.click(); await visible(admin.getByText('Website settings saved.'));
  assert.equal(settings.enable_public_website, 'false'); assert.equal(new URL(admin.url()).pathname, '/backoffice/settings');
  assert.equal(await admin.getByRole('link', { name: 'View website' }).count(), 0);
  await admin.reload(); await visible(toggle); assert.equal(await toggle.isChecked(), false);
  await admin.goto(`${origin}/`); await visible(admin.getByRole('heading', { name: 'Dashboard', exact: true }));
  assert.equal(new URL(admin.url()).pathname, '/backoffice');

  const redirected = await open();
  await redirected.waitForURL('https://hub.example.invalid/idp/qa/login**');
  assert.equal(new URL(redirected.url()).searchParams.get('returnUrl'), `${origin}/backoffice`);
  await redirected.goto(`${origin}/backoffice/orders?status=open#latest`);
  await redirected.waitForURL('https://hub.example.invalid/idp/qa/login**');
  assert.equal(new URL(redirected.url()).searchParams.get('returnUrl'), `${origin}/backoffice/orders?status=open#latest`);
  // The hosted login callback preserves the requested back-office page.
  await redirected.goto(`${origin}/backoffice/orders?status=open&access_token=${token}#latest`);
  await visible(redirected.getByRole('heading', { name: 'Orders', exact: true }));
  assert.equal(new URL(redirected.url()).searchParams.get('access_token'), null);
  assert.equal(new URL(redirected.url()).searchParams.get('status'), 'open');
  console.log('PASS Admin gate, saved website switch, forced login and deep-link callback');

  await admin.goto(`${origin}/backoffice/settings`); await visible(toggle);
  await toggle.check(); saveFailure = 403; await save.click();
  await visible(admin.getByRole('alert')); assert.equal(settings.enable_public_website, 'false');
  saveFailure = 0; await save.click(); await visible(admin.getByText('Website settings saved.'));
  await admin.getByRole('link', { name: 'View website' }).click();
  await visible(admin.getByRole('link', { name: 'Back office', exact: true }));
  await admin.goto(`${origin}/orders?status=open#latest`);
  await admin.waitForURL(`${origin}/backoffice/orders?status=open#latest`);
  await visible(admin.getByRole('heading', { name: 'Orders', exact: true }));
  await admin.goto(`${origin}/backoffice/registration`);
  await admin.getByRole('switch', { name: 'Allow self-registration' }).check();
  await admin.getByRole('button', { name: 'Save changes' }).click();
  await visible(admin.getByText('Self-registration enabled for this tenant.'));
  await admin.getByRole('link', { name: 'View website' }).click();
  await admin.getByRole('button', { name: 'Log out', exact: true }).click();
  await visible(admin.getByRole('link', { name: 'Sign up', exact: true }));
  assert.equal(new URL(admin.url()).pathname, '/');
  // Logging out inside the protected shell must also stay on the public home.
  const logoutAdmin = await open('Admin', '/backoffice');
  await logoutAdmin.getByRole('button', { name: /^My account:/ }).click();
  await logoutAdmin.getByRole('menuitem', { name: 'Log out' }).click();
  await visible(logoutAdmin.getByRole('button', { name: 'Log in', exact: true }));
  assert.equal(new URL(logoutAdmin.url()).pathname, '/');
  assert.equal(await logoutAdmin.evaluate(() => localStorage.getItem('idp_access_token')), null);

  unavailable = true;
  const unavailablePage = await open();
  await visible(unavailablePage.getByRole('heading', { name: 'Website temporarily unavailable' }));
  assert.equal(new URL(unavailablePage.url()).origin, origin);
  unavailable = false; await unavailablePage.getByRole('button', { name: 'Try again' }).click();
  await visible(unavailablePage.getByRole('button', { name: 'Log in', exact: true }));
  console.log('PASS failed save, legacy links, immediate registration update, logout and bootstrap recovery');
  assert.deepEqual(errors, []);
} finally {
  await Promise.all(contexts.map(context => context.close()));
  await browser.close(); await new Promise(resolve => server.httpServer.close(resolve));
}
