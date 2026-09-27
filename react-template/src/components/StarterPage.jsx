import { ArrowDownLeft, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PlaceholderPage, useCloudgate, usePermissions } from '@cloudgatedevs/cloudgate-client-react/react';
import { BACKOFFICE_PERMISSIONS } from '@cloudgatedevs/cloudgate-client-react/platform';

export function StarterPage(props) {
  const { backofficePath } = useCloudgate();
  const { can } = usePermissions();
  const canBuild = can(BACKOFFICE_PERMISSIONS.DeveloperAccess);
  const inBuildPreview = import.meta.env.VITE_CLOUDGATE_BUILD_PREVIEW === 'true';

  return <div className="starter-page">
    <PlaceholderPage {...props} />
    <aside className="starter-build-guide" aria-label="Build tools guidance">
      <span className="starter-build-icon" aria-hidden="true"><Terminal size={22} /></span>
      <div>
        <h3>{canBuild ? 'Start building your app' : 'Ready for your app'}</h3>
        {canBuild ? <>
          <p>{inBuildPreview
            ? 'Use the build tools in your Cloudgate workspace to edit this page and preview your changes.'
            : <>Open <strong>Developers</strong> in the bar at the bottom to build pages, connect data and create workflows.</>}</p>
          {!inBuildPreview && <p className="starter-build-note">If prompted, link your Cloudgate account in <Link to={backofficePath('/profile')}>Profile</Link>.</p>}
        </> : <p>This is a placeholder page. Ask your administrator for developer access to start building.</p>}
      </div>
      {canBuild && !inBuildPreview && <ArrowDownLeft className="starter-build-arrow" size={24} aria-hidden="true" />}
    </aside>
  </div>;
}
