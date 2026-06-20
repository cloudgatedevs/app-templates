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
  get storeCatalogRoute() {
    return (AppConsts.storeCatalogRoute ?? 'products').trim().replace(/^\/+/, '') || 'products';
  },
  get enabled() {
    return Boolean(this.gatewayUrl && this.storeCatalogRoute);
  },
  buildUrl(route?: string) {
    const r = (route ?? this.storeCatalogRoute).trim().replace(/^\/+/, '');
    return `${this.gatewayUrl}/${this.environment}/${this.projectPath}/${r}`;
  },
  get storeCatalogUrl() {
    return this.buildUrl(this.storeCatalogRoute);
  },
};
