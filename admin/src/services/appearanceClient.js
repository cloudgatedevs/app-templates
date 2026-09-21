import { normalizeSettings } from '../settings/model.js';

/** Native IdP configuration; no workflow signatures or application database are involved. */
export function createAppearanceClient({ request, projectPath, environment = 'sbx' }) {
  const scope = {
    projectPath: String(projectPath || '').trim().replace(/^\/+|\/+$/g, ''),
    environment: String(environment || 'sbx').trim().toLowerCase(),
  };
  async function run(action, body = {}) {
    if (!scope.projectPath || scope.projectPath === '*' || !/^(sbx|sandbox|prod|production)$/.test(scope.environment))
      throw new Error('Appearance needs an application controller path and a sandbox or production environment.');
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
