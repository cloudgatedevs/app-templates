import assert from 'node:assert/strict';

export async function checkUserInvitations({ page, context, token, webAppId, go, visible, shot }) {
  let unavailable = false, createFails = false, mailFails = false, local = false, creates = 0, resends = 0;
  const app = { webAppId, name: 'Example app', url: 'https://this-app.example.invalid/' };
  const handler = async route => {
    const request = route.request(), action = new URL(request.url()).pathname.split('/').pop(), body = request.postDataJSON();
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    assert.equal(body.webAppId, webAppId); assert.equal(body.password, undefined); assert.equal(body.returnUrl, undefined);
    assert.equal(body.developmentAppUrl, 'http://127.0.0.1:3199');
    if (unavailable) return route.fulfill({ status: 404, json: {} });
    if (action === 'invitation-app') return route.fulfill({ json: local ? { ...app, url: 'http://127.0.0.1:3199/', isDevelopment: true } : app });
    if (action === 'invite') {
      creates++;
      if (createFails) return route.fulfill({ status: 409, json: { message: 'This email already has an account. Use Send app invite on the existing user.' } });
    } else { assert.equal(body.id, 3); resends++; }
    return route.fulfill({ json: { user: { id: 3, email: 'new@example.invalid' }, created: action === 'invite', invitation: { sent: !mailFails, appName: app.name, appUrl: app.url } } });
  };
  const urls = ['invitation-app', 'invite', 'resend-invite'].map(action => `https://api.example.invalid/api/idp/qa/admin/users/${action}`);
  for (const url of urls) await context.route(url, handler);
  try {
    await go('/users');
    const open = async () => { await page.getByRole('button', { name: 'Add user', exact: true }).click(); await visible(page.getByRole('dialog', { name: 'Create user', exact: true })); };
    await open();
    const modal = page.getByRole('dialog', { name: 'Create user', exact: true });
    const submit = modal.getByRole('button', { name: 'Create & send invite', exact: true });
    await visible(modal.getByText(app.url, { exact: true }));
    assert.equal(await modal.locator('input[type=password]').count(), 0);
    await modal.getByLabel('Email address', { exact: true }).fill('new@example.invalid');
    await modal.getByLabel('First name', { exact: true }).fill('New');
    await modal.getByLabel('Surname', { exact: true }).fill('Person');
    await shot('create-user-invitation-desktop');
    const first = await modal.getByLabel('First name', { exact: true }).boundingBox();
    const last = await modal.getByLabel('Surname', { exact: true }).boundingBox();
    assert.ok(Math.abs(first.y - last.y) < 2 && last.x > first.x, 'Names share a row on desktop');
    createFails = true; await submit.click(); await visible(modal.getByRole('alert'));
    assert.equal(await modal.getByLabel('Email address', { exact: true }).inputValue(), 'new@example.invalid');
    createFails = false; mailFails = true; await submit.click();
    await visible(modal.getByRole('button', { name: 'Retry invitation', exact: true }));
    assert.equal(creates, 2);
    await shot('create-user-invitation-email-failure');
    await modal.getByRole('button', { name: 'Retry invitation', exact: true }).click();
    await visible(modal.getByText('The invitation email could not be sent. Check your email settings and try again.', { exact: true }));
    assert.equal(creates, 2); assert.equal(resends, 1);
    mailFails = false;
    await modal.getByRole('button', { name: 'Retry invitation', exact: true }).click();
    await modal.waitFor({ state: 'hidden' });
    await visible(page.getByText('Invitation sent to new@example.invalid for Example app.', { exact: true }));
    assert.equal(creates, 2); assert.equal(resends, 2);
    unavailable = true; await open(); await visible(modal.getByRole('alert'));
    assert.equal(await submit.isDisabled(), true);
    unavailable = false; await modal.getByRole('button', { name: 'Try again', exact: true }).click();
    await visible(modal.getByText(app.url, { exact: true }));
    await page.setViewportSize({ width: 390, height: 844 });
    await shot('create-user-invitation-mobile');
    assert.ok((await modal.boundingBox()).width <= 390);
    assert.equal(await modal.evaluate(el => el.scrollWidth <= el.clientWidth), true);
    await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
    await shot('create-user-invitation-dark');
    await modal.getByRole('button', { name: 'Cancel', exact: true }).click();
    await modal.waitFor({ state: 'hidden' });
    await page.evaluate(() => document.documentElement.dataset.theme = 'light');
    await page.setViewportSize({ width: 1440, height: 1000 });
    local = true; await open();
    await visible(modal.getByText('http://127.0.0.1:3199/', { exact: true }));
    await visible(modal.getByText('Local development invitation. Open it on the computer running this app.', { exact: true }));
    await modal.getByLabel('Email address', { exact: true }).fill('new@example.invalid');
    assert.equal(await submit.isEnabled(), true);
    await shot('create-user-local-invitation');
    await submit.click(); await modal.waitFor({ state: 'hidden' });
    assert.equal(creates, 3);
    console.log('PASS user invitation modal, local/public destinations, app scope, IdP bearer, no initial password, validation, delivery failure/resend, unavailable backend, desktop/mobile/dark');
  } finally {
    for (const url of urls) await context.unroute(url, handler);
    await page.evaluate(() => document.documentElement.dataset.theme = 'light');
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
}
