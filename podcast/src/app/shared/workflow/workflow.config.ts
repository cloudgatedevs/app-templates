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
  get podcastCatalogRoute() {
    return (AppConsts.podcastCatalogRoute ?? 'podcasts').trim().replace(/^\/+/, '') || 'podcasts';
  },
  get enabled() {
    return Boolean(this.gatewayUrl && this.podcastCatalogRoute);
  },
  buildUrl(route?: string) {
    const r = (route ?? this.podcastCatalogRoute).trim().replace(/^\/+/, '');
    return `${this.gatewayUrl}/${this.environment}/${this.projectPath}/${r}`;
  },
  get podcastCatalogUrl() {
    return this.buildUrl(this.podcastCatalogRoute);
  },
};
