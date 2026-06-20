import { getTenancyNameCookie } from 'src/app/shared/core/multi-tenancy.util';

export class CookieTenantResolver {

    resolve(): string {
        return getTenancyNameCookie();
    }

}
