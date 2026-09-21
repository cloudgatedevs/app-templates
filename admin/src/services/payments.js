import { idpAdmin } from './idpAdmin';
import { createPaymentsClient } from './paymentsClient';

export const paymentsApi = createPaymentsClient({
  request: idpAdmin,
  projectPath: import.meta.env.VITE_CLOUDGATE_API_PROJECT,
  environment: import.meta.env.VITE_CLOUDGATE_API_ENV || 'sbx',
});
