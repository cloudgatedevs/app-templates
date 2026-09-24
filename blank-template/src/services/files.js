import { idpAdmin } from './idpAdmin';
import { resolveAppIdentity } from './appIdentity';
import { isWebAppId } from './appIdentityClient';

export const MEDIA_FOLDERS = ['media', 'branding'];
const checkFolder = async (path) => {
  if (!MEDIA_FOLDERS.includes(path)) throw new Error('Choose one of this app’s media folders.');
  // Explicit prefixes preserve existing libraries when upgrading an older app.
  const prefix = String(import.meta.env.VITE_CLOUDGATE_MEDIA_FOLDER || import.meta.env.VITE_CLOUDGATE_API_PROJECT || '').trim().replace(/^\/+|\/+$/g, '');
  if (prefix) return `${prefix}/${path}`;
  const scope = await resolveAppIdentity();
  if (!isWebAppId(scope.webAppId)) throw new Error('Open the published app or set VITE_CLOUDGATE_WEB_APP_ID to use its media library.');
  return `apps/${scope.webAppId}/${path}`;
};
export const listImages = async ({ path = MEDIA_FOLDERS[0], skip = 0, take = 24 } = {}) =>
  idpAdmin(`files?${new URLSearchParams({ path: await checkFolder(path), skip, take })}`, { method: 'GET' });
export async function uploadImage(file, path = MEDIA_FOLDERS[0]) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Images must be 10 MB or smaller.');
  const body = new FormData();
  body.append('file', file, file.name);
  return idpAdmin(`files/upload?path=${encodeURIComponent(await checkFolder(path))}`, { body });
}
export const deleteImage = (id) => idpAdmin(`files/${encodeURIComponent(id)}`, { method: 'DELETE' });
