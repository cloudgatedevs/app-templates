import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandedLogo } from '@/components/BrandedLogo';
import { redirectWithTokens, isValidReturnUrl } from '@/utils/redirectWithTokens';

export function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken, refreshToken, expiresIn, returnUrl } = location.state || {};
  const [copied, setCopied] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      navigate('/login', { replace: true });
    }
  }, [accessToken, navigate]);

  useEffect(() => {
    if (!accessToken || !returnUrl || redirecting) return;
    if (!isValidReturnUrl(returnUrl)) return;
    setRedirecting(true);
    redirectWithTokens(returnUrl, { accessToken, refreshToken, expiresIn });
  }, [accessToken, refreshToken, expiresIn, returnUrl, redirecting]);

  if (!accessToken) return null;

  if (redirecting) {
    return (
      <div className="auth-shell">
        <div className="auth-shell-inner">
          <div className="flex flex-col items-center gap-5 text-center">
            <BrandedLogo className="mx-auto" asLink={false} />
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
            <p className="text-base font-medium text-gray-900">Redirecting…</p>
            <p className="text-sm text-gray-500">Taking you back to the application.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accessToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-shell-inner">
        <div className="w-full max-w-lg">
          <div className="auth-panel">
            <div className="mb-6 text-center">
              <BrandedLogo asLink={false} />
              <h1 className="mt-2 text-xl font-semibold text-gray-900">Sign in successful</h1>
              <p className="mt-1 text-sm text-gray-600">
                Your access token is below. Use it to call IdP-protected APIs.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label">Access token</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    type="text"
                    value={accessToken}
                    className="form-control flex-1 font-mono text-xs"
                    aria-label="Access token"
                  />
                  <button type="button" className="btn btn-outline shrink-0" onClick={handleCopy}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {refreshToken && (
                <div>
                  <label className="form-label">Refresh token</label>
                  <input
                    readOnly
                    type="text"
                    value={refreshToken}
                    className="form-control font-mono text-xs"
                    aria-label="Refresh token"
                  />
                </div>
              )}

              {expiresIn != null && (
                <p className="text-sm text-gray-600">
                  Expires in: <strong>{expiresIn}</strong> seconds
                </p>
              )}

              <Link
                to={`/login${location.search}`}
                className="text-center text-sm font-medium text-primary hover:text-primary-hover"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
