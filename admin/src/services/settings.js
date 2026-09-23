import { idpAdmin } from './idpAdmin';
import { createAppearanceClient } from './appearanceClient';
import { resolveAppIdentity } from './appIdentity';

export const settingsApi = createAppearanceClient({
  request: idpAdmin,
  resolveAppIdentity,
});
