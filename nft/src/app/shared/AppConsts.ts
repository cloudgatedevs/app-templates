export class AppConsts {
  static readonly tenancyNamePlaceHolderInUrl = '{TENANCY_NAME}';

  /** @deprecated Removed — app data uses Cloudgate workflows; auth uses IdP `/api/idp/*` only. */
  static remoteServiceBaseUrl: string = '';
  /** @deprecated Removed with remoteServiceBaseUrl. */
  static remoteServiceBaseUrlFormat: string;
  static appBaseUrl: string = '';
  static appBaseHref: string; // returns angular's base-href parameter value if used during the publish
  static appBaseUrlFormat: string;
  static recaptchaSiteKey: string;
  static subscriptionExpireNootifyDayCount: number;
  static pageName: string = 'Home';
  static pageAction: string = 'Menu';

  static localeMappings: any = [];

  static readonly userManagement = {
    defaultAdminUserName: 'admin',
  };

  static readonly localization = {
    defaultLocalizationSourceName: 'Zero',
  };

  static readonly authorization = {
    encrptedAuthTokenName: 'enc_auth_token',
  };

  static readonly grid = {
    defaultPageSize: 10,
  };

  static readonly MinimumUpgradePaymentAmount = 1;

  /// <summary>
  /// Gets current version of the application.
  /// It's also shown in the web page.
  /// </summary>
  static readonly WebAppGuiVersion = '12.3.0';

  /// <summary>
  /// Redirects users to host URL when using subdomain as tenancy name for not existing tenants
  /// </summary>
  static readonly PreventNotExistingTenantSubdomains = false;

  /** IdP user login flow (Cloudweb Apps compatible). Loaded from appconfig.json. */
  static idpBaseUrl = '';
  static idpApiUrl = '';
  static idpTenancyName = '';
  static idpReturnUrl = '';

  /** Cloudgate workflow gateway. Loaded from appconfig.json. */
  static workflowGatewayUrl = '';
  static workflowEnvironment = 'sbx';
  static workflowProjectPath = 'api';
  static nftCatalogRoute = 'nfts';
}


