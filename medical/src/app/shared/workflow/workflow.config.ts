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
  get medicalCatalogRoute() {
    return (AppConsts.medicalCatalogRoute ?? 'doctors').trim().replace(/^\/+/, '') || 'doctors';
  },
  get enabled() {
    return Boolean(this.gatewayUrl && this.medicalCatalogRoute);
  },
  buildUrl(route?: string) {
    const r = (route ?? this.medicalCatalogRoute).trim().replace(/^\/+/, '');
    return `${this.gatewayUrl}/${this.environment}/${this.projectPath}/${r}`;
  },
  get medicalCatalogUrl() {
    return this.buildUrl(this.medicalCatalogRoute);
  },
};
