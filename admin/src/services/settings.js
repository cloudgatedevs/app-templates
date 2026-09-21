import { idpAdmin } from './idpAdmin';
import { createAppearanceClient } from './appearanceClient';

export const settingsApi = createAppearanceClient({
  request: idpAdmin,
  projectPath: import.meta.env.VITE_CLOUDGATE_API_PROJECT,
  environment: import.meta.env.VITE_CLOUDGATE_API_ENV || 'sbx',
});
