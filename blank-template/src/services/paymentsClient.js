import { createAppIdentityResolver } from './appIdentityClient.js';

/** Wallet readiness belongs to the authenticated tenant and environment. */
export function createPaymentsClient({ request, environment = 'sbx', resolveAppIdentity = createAppIdentityResolver({ environment }) }) {
  return {
    async status() {
      const scope = await resolveAppIdentity();
      if (!/^(sbx|sandbox|prod|production)$/.test(scope.environment))
        throw new Error('Payments needs a sandbox or production environment.');
      const value = await request('admin/payments/status', { body: { environment: scope.environment } });
      if (typeof value?.ready !== 'boolean' || typeof value.production !== 'boolean' ||
          typeof value.chargesEnabled !== 'boolean' || typeof value.payoutsEnabled !== 'boolean')
        throw new Error('Cloudgate returned an invalid Wallet status. Refresh and try again.');
      return value;
    },
  };
}
