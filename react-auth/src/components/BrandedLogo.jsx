import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBrandingLogoUrl } from '@/api/idpApi';
import { idpConfig } from '@/config/idpConfig';

/** @param {{ className?: string; asLink?: boolean }} props */
export function BrandedLogo({ className = 'mx-auto mb-4', asLink = true }) {
  const location = useLocation();
  const logoUrl = getBrandingLogoUrl();
  const [failed, setFailed] = useState(false);
  const loginPath = `/login${location.search}`;

  const content = failed || !logoUrl ? (
    <span className="text-xl font-semibold text-gray-900">{idpConfig.appName}</span>
  ) : (
    <img
      src={logoUrl}
      alt=""
      decoding="async"
      fetchPriority="high"
      onError={() => setFailed(true)}
      className="max-h-full max-w-full object-contain object-center"
    />
  );

  const slotClass = `inline-flex h-20 w-40 shrink-0 items-center justify-center md:h-28 md:w-56 ${className}`;

  if (!asLink) return <span className={slotClass}>{content}</span>;

  return (
    <Link to={loginPath} className={slotClass}>
      {content}
    </Link>
  );
}
