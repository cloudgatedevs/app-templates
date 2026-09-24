import { auth } from './auth';
import { createIdpAdminClient } from './idpAdminClient';

export const idpAdmin = createIdpAdminClient({
  auth,
  apiUrl: import.meta.env.VITE_IDP_API_URL || import.meta.env.VITE_IDP_BASE_URL,
});
export const adminUsersRequest = (action, body = {}) => idpAdmin(`admin/users/${action}`, { body });
