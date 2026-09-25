import assert from 'node:assert/strict';

export async function checkEmailVerification({ page, context, token, go, visible, shot }) {
  let enabled = false, confirmed = false, sendFails = false, throttled = false, available = true, sends = 0;
  let email = 'admin@example.invalid';
  const urls = ['/profile', '/profile/resend-verification', '/admin/registration'].map(path => `https://api.example.invalid/api/idp/qa${path}`);
  const handler = async route => {
    const request = route.request(), url = request.url();
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    if (url.endsWith('/admin/registration')) {
      if (request.method() === 'PUT') {
        const body = request.postDataJSON();
        assert.deepEqual(Object.keys(body).sort(), ['allowSelfRegistration', 'promptForEmailVerification']);
        assert.equal(body.allowSelfRegistration, false);
        enabled = body.promptForEmailVerification;
      }
      return route.fulfill({ json: { allowSelfRegistration: false, scope: 'tenant', ...(available ? { promptForEmailVerification: enabled } : {}) } });
    }
    if (url.endsWith('/resend-verification')) {
      assert.equal(request.method(), 'POST'); assert.deepEqual(request.postDataJSON(), {}); sends++;
      if (sendFails) return route.fulfill({ status: 503, json: { message: 'Email delivery failed. Please try again.' } });
      if (throttled) return route.fulfill({ status: 429, json: { message: 'Wait a minute before resending.', retryAfterSeconds: 60 } });
      return route.fulfill({ json: { sent: !confirmed, isEmailConfirmed: confirmed, retryAfterSeconds: confirmed ? 0 : 60 } });
    }
    return route.fulfill({ json: { id: 1, name: 'Alex', surname: 'Admin', email, role: 'Admin', isEmailConfirmed: confirmed, promptForEmailVerification: enabled } });
  };
  for (const url of urls) await context.route(url, handler);
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go('/registration');
    const banner = page.getByRole('region', { name: 'Email verification reminder', exact: true });
    const toggle = page.getByRole('switch', { name: 'Prompt for email verification', exact: true });
    await visible(toggle); assert.equal(await toggle.isChecked(), false); assert.equal(await banner.count(), 0);
    await toggle.check(); await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await visible(banner); assert.equal(enabled, true);
    await shot('email-verification-settings');
    await page.reload(); await visible(toggle); assert.equal(await toggle.isChecked(), true); await visible(banner);
    for (const route of ['/orders', '/profile', '/notifications', '/about']) {
      await go(route); await visible(banner); await visible(banner.getByText(/admin@example.invalid/));
      assert.ok((await banner.boundingBox()).y < (await page.locator('main .page-transition').boundingBox()).y, 'Reminder sits above page content');
    }
    const resend = banner.getByRole('button', { name: 'Resend verification email', exact: true });
    sendFails = true; await resend.click(); await visible(banner.getByRole('alert')); assert.equal(await resend.isEnabled(), true);
    sendFails = false; await resend.dblclick();
    await visible(banner.getByRole('status').filter({ hasText: 'Verification email sent' }));
    assert.equal(sends, 2, 'Failed attempt and one successful retry, with duplicate clicks suppressed');
    assert.equal(await banner.getByRole('button', { name: /Resend in/ }).isDisabled(), true);
    await shot('email-verification-banner-desktop');
    await page.setViewportSize({ width: 360, height: 800 });
    await shot('email-verification-banner-mobile');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
    await shot('email-verification-banner-dark');
    await page.evaluate(() => document.documentElement.dataset.theme = 'light');
    confirmed = true; await banner.getByRole('button', { name: 'I’ve verified my email', exact: true }).click();
    await banner.waitFor({ state: 'detached' });
    await go('/'); assert.equal(await banner.count(), 0, 'Verified users do not see the reminder');
    confirmed = false; await page.evaluate(() => window.dispatchEvent(new Event('focus'))); await visible(banner);
    confirmed = true; await page.evaluate(() => window.dispatchEvent(new Event('focus'))); await banner.waitFor({ state: 'detached' });
    confirmed = false; await go('/'); await visible(banner);
    throttled = true; await resend.click(); await visible(banner.getByRole('alert'));
    assert.equal(await banner.getByRole('button', { name: /Resend in/ }).isDisabled(), true);
    throttled = false;
    email = 'changed@example.invalid'; await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await visible(banner.getByText(/changed@example.invalid/)); await visible(resend);
    await go('/registration'); await toggle.uncheck(); await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await banner.waitFor({ state: 'detached' }); assert.equal(enabled, false);
    available = false; await page.getByRole('button', { name: 'Reload setting', exact: true }).click();
    await visible(page.getByText('Update your Cloudgate server to enable email verification reminders.', { exact: true }));
    assert.equal(await toggle.isDisabled(), true);
    console.log('PASS verification setting persistence, all-page reminder, resend/retry/cooldown, confirmed/disabled states, email changes, focus refresh and mobile/dark layouts');
  } finally {
    for (const url of urls) await context.unroute(url, handler);
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
}
