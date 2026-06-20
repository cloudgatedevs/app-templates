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
  get hotelCatalogRoute() {
    return (AppConsts.hotelCatalogRoute ?? 'hotels').trim().replace(/^\/+/, '') || 'hotels';
  },
  get enabled() {
    return Boolean(this.gatewayUrl && this.hotelCatalogRoute);
  },
  buildUrl(route?: string) {
    const r = (route ?? this.hotelCatalogRoute).trim().replace(/^\/+/, '');
    return `${this.gatewayUrl}/${this.environment}/${this.projectPath}/${r}`;
  },
  get hotelCatalogUrl() {
    return this.buildUrl(this.hotelCatalogRoute);
  },
};
