import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS } from '@cloudgatedevs/cloudgate-client/platform';

export async function checkBrandingImagePicker({ page, context, token, webAppId, go, visible, shot }) {
  const makeImage = (folder, index) => ({ id: `${folder}-${index}`, name: `${folder === 'branding' ? 'Brand' : 'Library'} ${index + 1}.png`,
    url: `https://api.example.invalid/picker/full/${folder}-${index}.png`, thumbUrl: `https://api.example.invalid/picker/thumb/${folder}-${index}.png` });
  const branding = Array.from({ length: 26 }, (_, index) => makeImage('branding', index));
  const media = [makeImage('media', 0)];
  let settings = { ...DEFAULT_SETTINGS }, saves = 0, listings = 0, fail = false, empty = false;
  const appearance = route => {
    const body = route.request().postDataJSON();
    assert.equal(route.request().headers().authorization, `Bearer ${token}`);
    assert.equal(body.webAppId, webAppId);
    if (route.request().url().endsWith('/update')) { saves++; settings = { ...settings, ...body.values }; }
    return route.fulfill({ json: { values: settings, revision: '11111111-1111-1111-1111-111111111111' } });
  };
  const website = route => {
    assert.equal(route.request().headers().authorization, undefined);
    assert.equal(new URL(route.request().url()).searchParams.get('webAppId'), webAppId);
    return route.fulfill({ json: { values: settings, revision: '11111111-1111-1111-1111-111111111111', allowSelfRegistration: false } });
  };
  const list = route => {
    listings++;
    assert.equal(route.request().method(), 'GET');
    assert.equal(route.request().headers().authorization, `Bearer ${token}`);
    const query = new URL(route.request().url()).searchParams;
    assert.ok([`apps/${webAppId}/branding`, `apps/${webAppId}/media`].includes(query.get('path')));
    assert.equal(query.get('take'), '24');
    if (fail) return route.fulfill({ status: 503, json: { message: 'Media is temporarily unavailable.' } });
    const items = empty ? [] : query.get('path').endsWith('/branding') ? branding : media;
    const skip = Number(query.get('skip'));
    return route.fulfill({ json: { items: items.slice(skip, skip + 24), total: items.length } });
  };
  const image = route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90"><rect width="120" height="90" fill="#f2edff"/><rect x="32" y="17" width="56" height="56" rx="16" fill="#7c3aed"/><path d="M48 48l9 9 17-23" fill="none" stroke="white" stroke-width="5" stroke-linecap="round"/></svg>' });
  await context.route('**/api/idp/qa/admin/appearance/*', appearance);
  await context.route('**/api/idp/qa/website?*', website);
  await context.route('**/api/idp/qa/files?*', list);
  await context.route('**/picker/**', image);
  try {
    await go('/appearance');
    const logoTrigger = page.getByRole('button', { name: 'Choose existing logo', exact: true });
    const iconTrigger = page.getByRole('button', { name: 'Choose existing browser icon', exact: true });
    await visible(logoTrigger);
    assert.equal(listings, 0, 'The library only loads after opening the picker');
    await logoTrigger.click();
    const dialog = page.getByRole('dialog');
    await visible(dialog.getByRole('button', { name: 'Select Brand 1.png', exact: true }));
    assert.equal(await dialog.getByRole('button', { name: 'Use image', exact: true }).isDisabled(), true);
    assert.equal(await dialog.locator('.media-picker-tile').count(), 24);
    await dialog.getByRole('button', { name: 'Next ›', exact: true }).click();
    await visible(dialog.getByRole('button', { name: 'Select Brand 25.png', exact: true }));
    await dialog.getByRole('button', { name: 'Select Brand 25.png', exact: true }).focus();
    await page.keyboard.press('Space');
    assert.equal(await dialog.getByRole('button', { name: 'Select Brand 25.png', exact: true }).getAttribute('aria-pressed'), 'true');
    await shot('branding-image-picker-desktop');
    await dialog.getByRole('button', { name: 'Use image', exact: true }).click();
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await page.getByLabel('Logo', { exact: true }).inputValue(), branding[24].url);
    assert.equal(await page.getByAltText('Logo preview', { exact: true }).getAttribute('src'), branding[24].url);
    assert.equal(saves, 0, 'Choosing an image updates the draft without saving');
    assert.equal(await logoTrigger.evaluate(el => el === document.activeElement), true);
    await iconTrigger.click();
    await dialog.getByLabel('Folder', { exact: true }).selectOption('media');
    await dialog.getByRole('button', { name: 'Select Library 1.png', exact: true }).click();
    await dialog.getByRole('button', { name: 'Use image', exact: true }).click();
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await page.getByLabel('Browser icon', { exact: true }).inputValue(), media[0].url);
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await visible(page.getByText('Appearance saved.', { exact: true }));
    assert.equal(saves, 1);
    assert.equal(settings.app_logo_url, branding[24].url);
    assert.equal(settings.app_icon_url, media[0].url, 'Uses the full image URL rather than its thumbnail');
    await go('/appearance');
    await visible(logoTrigger);
    assert.equal(await page.getByLabel('Logo', { exact: true }).inputValue(), branding[24].url);
    await iconTrigger.click();
    await dialog.getByLabel('Folder', { exact: true }).selectOption('media');
    await visible(dialog.getByText('Current image', { exact: true }));
    await dialog.getByLabel('Folder', { exact: true }).selectOption('branding');
    await dialog.getByRole('button', { name: 'Select Brand 1.png', exact: true }).click();
    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
    await shot('branding-image-picker-dark');
    for (const width of [360, 320]) {
      await page.setViewportSize({ width, height: 740 });
      const bounds = await dialog.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width);
      assert.equal(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), true, 'No horizontal dialog overflow');
      await shot(`branding-image-picker-mobile-${width}`);
    }
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await page.getByLabel('Browser icon', { exact: true }).inputValue(), media[0].url, 'Cancel preserves the existing icon');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
    fail = true;
    await logoTrigger.click();
    await visible(dialog.getByRole('alert'));
    assert.equal(await dialog.getByRole('button', { name: 'Use image', exact: true }).isDisabled(), true);
    fail = false; empty = true;
    await dialog.getByRole('button', { name: 'Try again', exact: true }).click();
    await visible(dialog.getByText('No images in this folder', { exact: true }));
    empty = false;
    await dialog.getByRole('button', { name: 'Refresh images', exact: true }).click();
    await visible(dialog.getByRole('button', { name: 'Select Brand 1.png', exact: true }));
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await logoTrigger.evaluate(el => el === document.activeElement), true);
    assert.equal(saves, 1);
    console.log('PASS branding library: lazy loading, app scope, pagination, both image fields, preview/save, cancellation, keyboard, errors, empty state and mobile');
  } finally {
    await context.unroute('**/api/idp/qa/admin/appearance/*', appearance);
    await context.unroute('**/api/idp/qa/website?*', website);
    await context.unroute('**/api/idp/qa/files?*', list);
    await context.unroute('**/picker/**', image);
  }
}
