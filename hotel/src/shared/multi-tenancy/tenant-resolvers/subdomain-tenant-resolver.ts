import { SubdomainTenancyNameFinder } from 'src/shared/helpers/SubdomainTenancyNameFinder';

export class SubdomainTenantResolver {
  resolve(appBaseUrl: any): string | null {
    const subdomainTenancyNameFinder = new SubdomainTenancyNameFinder();
    return subdomainTenancyNameFinder.getCurrentTenancyNameOrNull(appBaseUrl);
  }
}
