/** Read native Wallet readiness using the same IdP session as appearance and user management. */
export function createPaymentsClient({ request, projectPath, environment = 'sbx' }) {
  const scope = {
    projectPath: String(projectPath || '').trim().replace(/^\/+|\/+$/g, ''),
    environment: String(environment || 'sbx').trim().toLowerCase(),
  };
  return {
    scope,
    async status() {
      if (!scope.projectPath || scope.projectPath === '*' || !/^(sbx|sandbox|prod|production)$/.test(scope.environment))
        throw new Error('Payments needs an application controller path and a sandbox or production environment.');
      const value = await request('admin/payments/status', { body: { ...scope } });
      if (typeof value?.ready !== 'boolean' || typeof value.production !== 'boolean' ||
          typeof value.chargesEnabled !== 'boolean' || typeof value.payoutsEnabled !== 'boolean')
        throw new Error('Cloudgate returned an invalid Wallet status. Refresh and try again.');
      return value;
    },
  };
}
