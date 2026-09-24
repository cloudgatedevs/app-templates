import { normalizeSettings } from '../settings/model.js';
import { createAppIdentityResolver, isWebAppId } from './appIdentityClient.js';

/** Native IdP configuration; no workflow signatures or application database are involved. */
export function createAppearanceClient({ request, webAppId, environment = 'sbx', resolveAppIdentity = createAppIdentityResolver({ webAppId, environment }) }) {
  async function run(action, body = {}) {
    const scope = await resolveAppIdentity();
    if (!isWebAppId(scope.webAppId) || !/^(sbx|sandbox|prod|production)$/.test(scope.environment))
      throw new Error('Appearance needs a Cloudgate web app. Open the published app, or set VITE_CLOUDGATE_WEB_APP_ID for local development.');
    const response = await request(`admin/appearance/${action}`, { body: { ...body, ...scope } });
    if (!response?.values || typeof response.values !== 'object' || Array.isArray(response.values) ||
        typeof response.revision !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(response.revision))
      throw new Error('Cloudgate returned an invalid appearance response. Refresh and try again.');
    return { values: normalizeSettings(response.values), revision: response.revision };
  }
  function write(action, values, revision) {
    if (!revision) return Promise.reject(new Error('Load the saved appearance before making changes.'));
    return run(action, { ...(values ? { values } : {}), revision });
  }
  return {
    get: () => run('details'),
    save: (values, revision) => write('update', values, revision),
    reset: (revision) => write('reset', null, revision),
  };
}
