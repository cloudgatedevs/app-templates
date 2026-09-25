import assert from 'node:assert/strict';

export async function checkNotificationActivation({ page, context, token, go, visible, shot }) {
  const items = [
    { id: 'click-1', title: 'No link', actionUrl: null },
    { id: 'click-2', title: 'Keyboard update', actionUrl: '' },
    { id: 'click-3', title: 'Unsafe link', actionUrl: 'javascript:alert(1)' },
    { id: 'click-4', title: 'Open orders', actionUrl: '/orders' },
  ].map(item => ({ ...item, body: 'An update for your account.', creationTime: '2026-09-25T10:00:00Z', isRead: false }));
  let attempts = 0, fail = false, releaseRead;
  const pattern = 'https://api.example.invalid/api/idp/qa/notifications/**';
  const handler = async route => {
    const request = route.request(), body = request.postDataJSON(), action = new URL(request.url()).pathname.split('/').pop();
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    assert.equal(body.environment, 'sbx');
    if (action === 'unread-count') return route.fulfill({ json: { unreadCount: items.filter(item => !item.isRead).length } });
    if (action === 'list') return route.fulfill({ json: { items, totalCount: items.length } });
    assert.equal(action, 'read');
    attempts++;
    if (fail) return route.fulfill({ status: 503, json: { message: 'Please try again.' } });
    if (body.id === 'click-1') await new Promise(resolve => { releaseRead = resolve; });
    items.find(item => item.id === body.id).isRead = true;
    return route.fulfill({ json: { read: true } });
  };
  await context.route(pattern, handler);
  try {
    await go('/');
    const popup = page.getByRole('dialog', { name: 'Notifications', exact: true });
    const row = title => popup.getByRole('listitem').filter({ has: page.getByText(title, { exact: true }) });
    await page.getByRole('button', { name: 'Notifications, 4 unread' }).click();
    await visible(row('No link'));
    assert.equal(attempts, 0, 'Opening the popup does not mark notifications read');
    await row('No link').getByRole('button').dblclick();
    assert.equal(attempts, 1, 'Only one read request is made while pending');
    assert.equal(items[0].isRead, false);
    releaseRead(); releaseRead = null;
    await visible(row('No link').getByText('Read', { exact: true }));
    await visible(page.getByRole('button', { name: 'Notifications, 3 unread' }));
    assert.equal(new URL(page.url()).pathname, '/backoffice', 'Without a link the popup stays on the current page');
    await row('No link').getByRole('button').click();
    assert.equal(attempts, 1, 'Already-read notifications need no extra write');
    await row('Keyboard update').getByRole('button').focus();
    await page.keyboard.press('Enter');
    await visible(row('Keyboard update').getByText('Read', { exact: true }));
    assert.ok(await row('Keyboard update').getByRole('button').evaluate(el => el === document.activeElement), 'Refresh preserves keyboard focus');
    await page.getByRole('button', { name: 'Notifications, 2 unread' }).waitFor();
    fail = true;
    await row('Unsafe link').getByRole('button').focus();
    await page.keyboard.press('Space');
    await visible(popup.getByRole('alert'));
    await visible(row('Unsafe link').getByText('New', { exact: true }));
    assert.equal(items[2].isRead, false, 'Failed requests do not mark the notification read');
    fail = false;
    await row('Unsafe link').getByRole('button').click();
    await visible(row('Unsafe link').getByText('Read', { exact: true }));
    assert.equal(await popup.getByRole('alert').count(), 0);
    assert.equal(new URL(page.url()).pathname, '/backoffice', 'Unsafe links are not followed');
    await page.getByRole('button', { name: 'Notifications, 1 unread' }).waitFor();
    await shot('notification-click-read');
    await row('Open orders').getByRole('button').click();
    await visible(page.getByRole('heading', { name: 'Order management starts here', exact: true }));
    assert.equal(items[3].isRead, true, 'Mark read before following a valid link');
    await popup.waitFor({ state: 'detached' });
    await page.reload();
    await page.getByRole('button', { name: 'Notifications, 0 unread' }).click();
    await visible(row('No link').getByText('Read', { exact: true }));
    assert.equal(await popup.getByText('New', { exact: true }).count(), 0, 'Read status survives reload');
    await popup.getByRole('button', { name: 'Close notifications' }).click();
    console.log('PASS notification click/keyboard read, badge refresh, duplicate protection, retry, safe navigation and persistence');
  } finally {
    releaseRead?.();
    await context.unroute(pattern, handler);
  }
}
