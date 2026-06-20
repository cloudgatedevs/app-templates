import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { idpAuthConfig } from './idpAuthConfig';
import { useAuthContext } from './useAuthContext';
import { ScreenLoader } from '@/components/ScreenLoader';

const RequireAuth = () => {
  const { auth, loading } = useAuthContext();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!auth?.accessToken && idpAuthConfig.enabled && idpAuthConfig.loginUrl) {
      setRedirecting(true);
      window.location.href = idpAuthConfig.buildLoginUrl();
    }
  }, [loading, auth?.accessToken]);

  if (loading || redirecting) {
    return <ScreenLoader />;
  }

  if (!auth?.accessToken) {
    return (
      <div className="flex min-h-[60vh] grow flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-medium text-gray-900">Sign-in not configured</p>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Set <code className="rounded bg-gray-100 px-1">VITE_IDP_BASE_URL</code> and{' '}
          <code className="rounded bg-gray-100 px-1">VITE_IDP_TENANCY_NAME</code> in your{' '}
          <code className="rounded bg-gray-100 px-1">.env</code> to enable the IdP login flow.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export { RequireAuth };
