import { createCloudgatePlatform } from '@cloudgatedevs/cloudgate-client';

// App configuration belongs here; reusable platform behavior lives in the npm package.
export const cloudgate = createCloudgatePlatform({
  idpBaseUrl: import.meta.env.VITE_IDP_BASE_URL,
  apiUrl: import.meta.env.VITE_IDP_API_URL,
  tenancyName: import.meta.env.VITE_IDP_TENANCY_NAME,
  returnUrl: import.meta.env.VITE_IDP_RETURN_URL,
  webAppId: import.meta.env.VITE_CLOUDGATE_WEB_APP_ID,
  environment: import.meta.env.VITE_CLOUDGATE_API_ENV,
  mediaFolder: import.meta.env.VITE_CLOUDGATE_MEDIA_FOLDER,
  projectPath: import.meta.env.VITE_CLOUDGATE_API_PROJECT,
  gatewayUrl: import.meta.env.VITE_CLOUDGATE_API_URL,
});
