import { idpAdmin } from './idpAdmin';

const project = String(import.meta.env.VITE_CLOUDGATE_API_PROJECT || 'admin')
  .trim()
  .replace(/^\/+|\/+$/g, '');
export const MEDIA_FOLDERS = [`${project}/media`, `${project}/branding`];
const checkFolder = (path) => {
  if (!MEDIA_FOLDERS.includes(path)) throw new Error('Choose one of this app’s media folders.');
  return path;
};
export const listImages = ({ path = MEDIA_FOLDERS[0], skip = 0, take = 24 } = {}) =>
  idpAdmin(`files?${new URLSearchParams({ path: checkFolder(path), skip, take })}`, { method: 'GET' });
export async function uploadImage(file, path = MEDIA_FOLDERS[0]) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Images must be 10 MB or smaller.');
  const body = new FormData();
  body.append('file', file, file.name);
  return idpAdmin(`files/upload?path=${encodeURIComponent(checkFolder(path))}`, { body });
}
export const deleteImage = (id) => idpAdmin(`files/${encodeURIComponent(id)}`, { method: 'DELETE' });
