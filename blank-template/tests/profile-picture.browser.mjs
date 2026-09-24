import assert from 'node:assert/strict';

export async function checkProfilePicture({ page, context, token, go, visible, shot }) {
  let photoUrl = null, uploaded = null, failUpload = false, failRemoval = false, uploads = 0, removals = 0;
  const pictureUrl = 'https://api.example.invalid/api/idp/qa/profile/pictures/photo-fixture';
  const profileHandler = route => route.fulfill({ json: { id: 1, name: 'Alex', surname: 'Admin', email: 'admin@example.invalid', role: 'Admin', photoUrl } });
  const imageHandler = route => route.fulfill({ contentType: 'image/jpeg', body: uploaded });
  const uploadHandler = async route => {
    const request = route.request();
    assert.equal(request.headers().authorization, `Bearer ${token}`);
    assert.equal(request.headers()['x-authentication-signature'], undefined);
    if (request.method() === 'DELETE') {
      removals++;
      if (failRemoval) return route.fulfill({ status: 503, json: {} });
      photoUrl = null;
      return route.fulfill({ json: { photoUrl: null, profilePictureId: null } });
    }
    uploads++;
    assert.equal(request.method(), 'PUT');
    assert.match(request.headers()['content-type'], /^multipart\/form-data; boundary=/);
    const data = request.postDataBuffer();
    const start = data.indexOf(Buffer.from('\r\n\r\n')) + 4;
    const end = data.lastIndexOf(Buffer.from('\r\n--'));
    assert.match(data.subarray(0, start).toString(), /name="file"; filename="profile.jpg"/);
    assert.match(data.subarray(0, start).toString(), /Content-Type: image\/jpeg/i);
    assert.equal(data.subarray(start, start + 2).toString('hex'), 'ffd8');
    if (failUpload) return route.fulfill({ status: 503, json: {} });
    uploaded = data.subarray(start, end);
    photoUrl = pictureUrl;
    return route.fulfill({ json: { photoUrl, profilePictureId: 'photo-fixture' } });
  };
  await context.route('https://api.example.invalid/api/idp/qa/profile', profileHandler);
  await context.route(pictureUrl, imageHandler);
  await context.route('https://api.example.invalid/api/idp/qa/profile/picture', uploadHandler);
  try {
    await go('/profile');
    const image = Buffer.from(await page.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 600;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#28b890'; ctx.fillRect(0, 0, 400, 600);
      ctx.fillStyle = '#6871ed'; ctx.fillRect(400, 0, 400, 600);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 180px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('QA', 400, 360);
      return canvas.toDataURL('image/png').split(',')[1];
    }), 'base64');
    const file = { name: 'portrait.png', mimeType: 'image/png', buffer: image };
    const trigger = page.locator('.workspace-bar .account-trigger');
    await trigger.click();
    await page.getByRole('menuitem', { name: 'Change profile picture', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await visible(dialog.locator('.uppy-Dashboard'));
    await shot('profile-photo-picker');
    await dialog.locator('input[type=file]').first().setInputFiles({ name: 'invalid.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
    await visible(dialog.getByRole('alert'));
    assert.equal(uploads, 0);
    await dialog.locator('input[type=file]').first().setInputFiles(file);
    await visible(dialog.getByRole('heading', { name: 'Adjust profile photo' }));
    await dialog.getByRole('button', { name: 'Save photo', exact: true }).waitFor({ state: 'visible' });
    await page.waitForFunction(() => !document.querySelector('[role=dialog] [aria-busy]')?.disabled);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(uploads, 0, 'Selection and cancellation do not upload');
    await page.waitForFunction(() => document.activeElement?.matches('.workspace-bar .account-trigger'));

    await page.getByRole('button', { name: 'Change profile picture', exact: true }).click();
    await dialog.locator('input[type=file]').first().setInputFiles(file);
    await visible(dialog.getByLabel('Zoom', { exact: true }));
    await dialog.getByLabel('Zoom', { exact: true }).fill('1.5');
    await visible(dialog.getByText('150%', { exact: true }));
    await shot('profile-photo-crop-desktop');
    failUpload = true;
    await dialog.getByRole('button', { name: 'Save photo', exact: true }).click();
    await visible(dialog.getByRole('alert'));
    assert.equal(photoUrl, null);
    assert.equal(await dialog.getByLabel('Zoom', { exact: true }).inputValue(), '1.5');
    failUpload = false;
    await dialog.getByRole('button', { name: 'Save photo', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(uploads, 2);
    const profilePhoto = page.locator('.profile-picture-preview img');
    await visible(profilePhoto);
    await profilePhoto.evaluate(image => image.decode());
    assert.deepEqual(await profilePhoto.evaluate(image => [image.naturalWidth, image.naturalHeight]), [512, 512]);
    assert.equal(await trigger.locator('img').getAttribute('src'), pictureUrl);
    await trigger.click();
    assert.equal(await page.getByRole('menu', { name: 'My account' }).locator('img').getAttribute('src'), pictureUrl);
    await shot('profile-photo-updated-menu');
    await page.keyboard.press('Escape');
    await page.reload(); await visible(profilePhoto);
    assert.equal(await profilePhoto.getAttribute('src'), pictureUrl, 'Photo persists across reloads');

    await page.setViewportSize({ width: 360, height: 800 });
    await page.getByRole('button', { name: 'Change profile picture', exact: true }).click();
    await dialog.locator('input[type=file]').first().setInputFiles(file);
    await visible(dialog.getByLabel('Zoom', { exact: true }));
    await shot('profile-photo-crop-mobile');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await dialog.getByRole('button', { name: 'Choose another photo' }).click();
    await visible(dialog.locator('.uppy-Dashboard'));
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await shot('profile-photo-picker-dark-mobile');
    await dialog.getByRole('button', { name: 'Remove photo', exact: true }).click();
    await visible(dialog.getByRole('heading', { name: 'Remove profile picture?' }));
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    assert.equal(removals, 0);
    await dialog.getByRole('button', { name: 'Remove photo', exact: true }).click();
    failRemoval = true;
    await dialog.getByRole('button', { name: 'Remove photo', exact: true }).click();
    await visible(dialog.getByRole('alert')); assert.equal(photoUrl, pictureUrl);
    failRemoval = false;
    await dialog.getByRole('button', { name: 'Remove photo', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(photoUrl, null);
    assert.equal(await page.locator('.profile-picture-preview img').count(), 0);
    assert.equal(await page.locator('.app-bar .account-trigger img').count(), 0);
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.setViewportSize({ width: 1440, height: 1000 });
    console.log('PASS Uppy selection, validation, crop/zoom, cancel without upload, IdP multipart upload, failures/retry, saved avatars, removal and mobile/dark layouts');
  } finally {
    await context.unroute('https://api.example.invalid/api/idp/qa/profile', profileHandler);
    await context.unroute(pictureUrl, imageHandler);
    await context.unroute('https://api.example.invalid/api/idp/qa/profile/picture', uploadHandler);
  }
}
