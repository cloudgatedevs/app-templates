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
  get nftCatalogRoute() {
    return (AppConsts.nftCatalogRoute ?? 'nfts').trim().replace(/^\/+/, '') || 'nfts';
  },
  get enabled() {
    return Boolean(this.gatewayUrl && this.nftCatalogRoute);
  },
  buildUrl(route?: string) {
    const r = (route ?? this.nftCatalogRoute).trim().replace(/^\/+/, '');
    return `${this.gatewayUrl}/${this.environment}/${this.projectPath}/${r}`;
  },
  get nftCatalogUrl() {
    return this.buildUrl(this.nftCatalogRoute);
  },
};
