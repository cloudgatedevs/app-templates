import { idpAdmin } from './idpAdmin';
import { createPaymentsClient } from './paymentsClient';
import { resolveAppIdentity } from './appIdentity';

export const paymentsApi = createPaymentsClient({
  request: idpAdmin,
  resolveAppIdentity,
});
