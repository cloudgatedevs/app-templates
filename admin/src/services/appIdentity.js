import { createAppIdentityResolver } from './appIdentityClient';
import { createPublishedAnalyticsResolver } from './publishedAnalytics';

export const resolvePublishedApp = createPublishedAnalyticsResolver();
export const resolveAppIdentity = createAppIdentityResolver({
  webAppId: import.meta.env.VITE_CLOUDGATE_WEB_APP_ID,
  environment: import.meta.env.VITE_CLOUDGATE_API_ENV,
  resolvePublishedApp,
});
