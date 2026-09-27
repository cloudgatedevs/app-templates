import assert from 'node:assert/strict';

export async function checkPayments({ page, context, token, go, visible, shot }) {
  let failCheckout = true, denied = false;
  const checkoutCalls = [];
  await context.route(/https:\/\/api\.example\.invalid\/api\/idp\/qa\/admin\/payments\/(history|test-checkout)$/, async route => {
    const request = route.request(), body = request.postDataJSON();
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    if (denied) return route.fulfill({ status: 403, json: { message: 'IdP Admin role required.' } });
    if (request.url().endsWith('/history')) {
      assert.ok(['sbx', 'prod'].includes(body.environment));
      let items = Array.from({ length: 26 }, (_, index) => ({ id: index + 1, isProduction: body.environment === 'prod', reference: `${body.environment}-order-${index + 1}`, description: 'Test order', grossAmount: 1234, currency: 'usd', status: index === 0 ? 2 : 1, refundedAmount: 0, creationTime: '2026-09-24T10:00:00Z' }));
      if (body.status != null) items = items.filter(item => item.status === body.status);
      return route.fulfill({ json: { totalCount: items.length, items: items.slice(body.skip, body.skip + body.take) } });
    }
    checkoutCalls.push(body);
    assert.equal(body.environment, 'sbx');
    assert.equal(body.isProduction, undefined);
    assert.equal(body.amount, 29);
    if (failCheckout) return route.fulfill({ status: 503, json: {} });
    return route.fulfill({ json: { id: 99, isProduction: false, grossAmount: body.amount, currency: body.currency, description: body.description, status: 0, paymentUrl: 'https://checkout.stripe.com/c/pay/test_fixture' } });
  });
  await go('/payments/list');
  await visible(page.getByText('sbx-order-1', { exact: true }).locator('visible=true'));
  await visible(page.getByText('1–25 of 26 payments', { exact: true }));
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await visible(page.getByText('sbx-order-26', { exact: true }).locator('visible=true'));
  await page.getByLabel('Environment', { exact: true }).selectOption('prod');
  await visible(page.getByText('prod-order-1', { exact: true }).locator('visible=true'));
  await page.getByLabel('Status', { exact: true }).selectOption('2');
  await visible(page.getByText('1–1 of 1 payments', { exact: true }));
  await shot('payment-list-desktop');
  await go('/payments/test');
  await visible(page.getByRole('button', { name: 'Create test checkout' }));
  await page.getByLabel('Amount', { exact: true }).fill('0.29');
  await page.getByLabel('Reference (optional)').fill('MY-TEST');
  await page.getByRole('button', { name: 'Create test checkout' }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'Cloudgate could not complete this request' }));
  assert.equal(await page.getByLabel('Amount', { exact: true }).inputValue(), '0.29');
  failCheckout = false;
  await page.locator('form').evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
  await visible(page.getByRole('heading', { name: 'Test checkout created' }));
  assert.equal(checkoutCalls.length, 2, 'One failed call and one retry, without duplicate submissions');
  assert.equal(checkoutCalls[0].idempotencyKey, checkoutCalls[1].idempotencyKey);
  assert.equal(await page.getByRole('link', { name: 'Open sandbox checkout' }).getAttribute('href'), 'https://checkout.stripe.com/c/pay/test_fixture');
  await page.getByRole('button', { name: 'Create another test' }).click();
  await shot('test-payment-desktop');
  await page.setViewportSize({ width: 360, height: 800 });
  await shot('test-payment-mobile');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await go('/payments/list'); await visible(page.getByText('sbx-order-1', { exact: true }).locator('visible=true'));
  await shot('payment-list-mobile');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.setViewportSize({ width: 1440, height: 1000 });
  denied = true;
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await visible(page.getByRole('alert').filter({ hasText: 'IdP Admin role required' }));
  assert.equal(await page.getByText('sbx-order-1', { exact: true }).count(), 0);
  denied = false;
  console.log('PASS payment history, paging, environment/status filters, IdP authorization, sandbox checkout, retained retry key, duplicate clicks and mobile layouts');
}
