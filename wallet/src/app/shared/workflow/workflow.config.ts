import { AppConsts } from '../AppConsts';

export const workflowConfig = {
  get gatewayUrl() {
    return (AppConsts.workflowGatewayUrl ?? '').trim().replace(/\/$/, '');
  },
  get environment() {
    return (AppConsts.workflowEnvironment ?? 'sbx').trim() || 'sbx';
  },
  get projectPath() {
    return (AppConsts.workflowProjectPath ?? 'api').trim().replace(/^\/+|\/+$/g, '') || 'api';
  },
  get walletCatalogRoute() {
    return (AppConsts.walletCatalogRoute ?? 'transactions').trim().replace(/^\/+/, '') || 'transactions';
  },
  get enabled() {
    return Boolean(this.gatewayUrl && this.walletCatalogRoute);
  },
  buildUrl(route?: string) {
    const r = (route ?? this.walletCatalogRoute).trim().replace(/^\/+/, '');
    return `${this.gatewayUrl}/${this.environment}/${this.projectPath}/${r}`;
  },
  get walletCatalogUrl() {
    return this.buildUrl(this.walletCatalogRoute);
  },
};
