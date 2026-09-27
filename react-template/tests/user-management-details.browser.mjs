import assert from 'node:assert/strict';

export async function checkUserManagementDetails({ page, context, token, go, visible, shot }) {
  const currentPhotoUrl = 'https://api.example.invalid/api/idp/qa/profile/pictures/current-user';
  let currentPhoto = currentPhotoUrl;
  const profile = route => route.fulfill({ json: { id: 1, name: 'Alex', surname: 'Admin', email: 'admin@example.invalid', role: 'Admin', photoUrl: currentPhoto } });
  const image = route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#dbeafe"/><circle cx="40" cy="27" r="14" fill="#375c92"/><path d="M14 80v-13a26 26 0 0 1 52 0v13" fill="#375c92"/></svg>' });
  const people = [
    { id: 1, name: 'Alex', surname: 'Admin', email: 'admin@example.invalid', role: 'Admin', isActive: true, isEmailConfirmed: true, creationTime: '2026-01-04T09:00:00', lastLoginTimeUtc: '2026-09-25T08:00:00' },
    { id: 2, name: 'Ava', surname: 'Nkosi', email: 'ava@example.invalid', role: 'User', isActive: true, isEmailConfirmed: false,
      phoneNumber: '+27 82 123 4567', identityNumber: 'TEST-42', address: '42 Long Street, Cape Town', metadata: '{"plan":"team","note":"<script>test</script>"}',
      photoUrl: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#e4e1fd"/><circle cx="40" cy="27" r="14" fill="#6f53a6"/><path d="M14 80v-13a26 26 0 0 1 52 0v13" fill="#6f53a6"/></svg>'),
      creationTime: '2026-09-20T10:30:00', lastLoginTimeUtc: null },
    { id: 3, name: 'Noah', surname: 'Williams', email: 'noah@example.invalid', role: 'User', isActive: false, photoUrl: 'https://api.example.invalid/broken-user-photo', creationTime: 'bad-date' },
    { id: 4, name: 'Other', surname: 'Admin', email: 'other-admin@example.invalid', role: 'Admin', isActive: true },
  ];
  const list = async route => {
    assert.equal(route.request().headers().authorization, `Bearer ${token}`);
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ items: people, totalCount: people.length }) });
  };
  const broken = route => route.fulfill({ status: 404 });
  await context.route('**/api/idp/qa/admin/users/list', list);
  await context.route('**/broken-user-photo', broken);
  await context.route('**/api/idp/qa/profile', profile);
  await context.route(currentPhotoUrl, image);
  try {
    await go('/users');
    const self = page.getByRole('row').filter({ has: page.getByText('admin@example.invalid', { exact: true }) });
    await visible(self.locator('img'));
    assert.equal(await self.locator('img').getAttribute('src'), currentPhotoUrl, 'Own photo uses the current profile even when the list omits it');
    await page.waitForFunction(() => [...document.querySelectorAll('.user-list-avatar img')].some(img => img.src.endsWith('/current-user') && img.complete && img.naturalWidth > 0));
    const row = page.getByRole('row').filter({ hasText: 'ava@example.invalid' });
    await visible(row.getByText('Unverified', { exact: true }));
    await visible(row.getByText('+27 82 123 4567', { exact: true }));
    await visible(row.getByText('TEST-42', { exact: true }));
    await visible(row.getByText('42 Long Street, Cape Town', { exact: true }));
    await visible(row.getByText('Never', { exact: true }));
    assert.equal(await row.locator('time').getAttribute('datetime'), '2026-09-20T10:30:00.000Z');
    await row.locator('img').evaluate(img => img.decode());
    assert.equal(await row.locator('img').evaluate(img => img.complete && img.naturalWidth > 0), true);
    const noah = page.getByRole('row').filter({ hasText: 'noah@example.invalid' });
    await visible(noah.locator('.user-list-avatar').getByText('NW', { exact: true }));
    await visible(noah.getByText('Verification unknown', { exact: true }));
    assert.equal(await page.getByRole('button', { name: 'Actions for admin@example.invalid', exact: true }).count(), 0);
    const trigger = row.getByRole('button', { name: 'Actions for ava@example.invalid', exact: true });
    await trigger.focus(); await page.keyboard.press('ArrowDown');
    const menu = page.getByRole('menu', { name: 'Actions for ava@example.invalid', exact: true });
    await visible(menu);
    assert.equal(await menu.getByRole('menuitem', { name: 'Change role', exact: true }).evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('End');
    assert.equal(await menu.getByRole('menuitem', { name: 'Delete user', exact: true }).evaluate(el => el === document.activeElement), true);
    await shot('users-actions-desktop');
    await page.keyboard.press('Escape');
    assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
    await trigger.click(); await menu.getByRole('menuitem', { name: 'Delete user', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'Delete user?', exact: true });
    await visible(confirmation);
    await confirmation.getByRole('button', { name: 'Cancel', exact: true }).click();
    await confirmation.waitFor({ state: 'detached' });
    assert.equal(await trigger.evaluate(el => el === document.activeElement), true, 'Closing the dialog restores the row action trigger');
    await noah.getByRole('button', { name: 'Actions for noah@example.invalid' }).click();
    assert.equal(await page.getByRole('menuitem', { name: 'Send app invite' }).isDisabled(), true);
    assert.equal(await page.getByRole('menuitem', { name: 'Send password reset' }).isDisabled(), true);
    await page.keyboard.press('ArrowDown');
    assert.equal(await page.getByRole('menuitem', { name: 'Enable user' }).evaluate(el => el === document.activeElement), true, 'Keyboard skips disabled actions');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Actions for other-admin@example.invalid', exact: true }).last().click();
    assert.equal(await page.getByRole('menuitem').count(), 1, 'Other administrators can only have their role changed');
    await page.getByRole('heading', { name: 'Users', exact: true }).click();
    assert.equal(await page.getByRole('menu').count(), 0);
    await row.getByRole('button', { name: 'View metadata for ava@example.invalid' }).click();
    const metadata = page.getByRole('dialog', { name: 'User metadata' });
    await visible(metadata);
    assert.ok((await metadata.locator('pre').textContent()).includes('<script>test</script>'));
    assert.equal(await metadata.locator('script').count(), 0);
    await shot('user-metadata'); await page.keyboard.press('Escape'); await metadata.waitFor({ state: 'detached' });
    const theme = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
    await trigger.click(); await shot('users-actions-dark'); await page.keyboard.press('Escape');
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    for (const width of [360, 320]) {
      await page.setViewportSize({ width, height: 800 });
      const mobileTrigger = page.getByRole('button', { name: 'Actions for ava@example.invalid', exact: true }).first();
      await mobileTrigger.click();
      const bounds = await page.getByRole('menu').boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y >= 0 && bounds.y + bounds.height <= 800, 'Menu stays in the viewport');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No page overflow');
      await shot(`users-mobile-${width}`); await page.keyboard.press('Escape');
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    currentPhoto = null;
    people[0].photoUrl = currentPhotoUrl;
    await go('/users');
    await visible(self.locator('.user-list-avatar').getByText('AA', { exact: true }));
    assert.equal(await self.locator('img').count(), 0, 'Removing the profile photo overrides a stale list photo');
    console.log('PASS richer user details, photo fallback, safe metadata, action permissions, keyboard/focus, light/dark and mobile');
  } finally {
    await context.unroute('**/api/idp/qa/admin/users/list', list);
    await context.unroute('**/broken-user-photo', broken);
    await context.unroute('**/api/idp/qa/profile', profile);
    await context.unroute(currentPhotoUrl, image);
  }
}
