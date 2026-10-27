import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext, useCloudgate, useSettings, EmailVerificationPrompt, UserMenu } from '@cloudgatedevs/cloudgate-client-react/react';
import { canAccessBackoffice } from '@cloudgatedevs/cloudgate-client-react/platform';

export function Home() {
  const { client, backofficePath } = useCloudgate();
  const { settings, allowSelfRegistration } = useSettings();
  const { auth, currentUser, loading, error, logout } = useAuthContext();
  const hasSession = !!auth?.accessToken;
  const signedIn = hasSession && !!currentUser?.user?.id;
  const needsRecovery = !loading && hasSession && !signedIn;
  const admin = signedIn && canAccessBackoffice(currentUser?.user);
  const returnUrl = new URL('/', window.location.origin).href;
  const login = () => {
    if (needsRecovery) logout(false);
    client.login(returnUrl);
  };
  return <div className="public-site">
    <a className="skip-link" href="#public-main">Skip to content</a>
    <header className="public-header">
      <Link to="/" className="public-brand">
        {settings.app_logo_url ? <img src={settings.app_logo_url} alt="" /> : <span className="public-brand-mark" aria-hidden="true">{settings.app_name.slice(0, 1)}</span>}
        <span>{settings.app_name}</span>
      </Link>
      <nav aria-label="Account" className="public-account">
        {loading || signedIn ? <UserMenu /> : <>
          <button className="btn-ghost" onClick={login}>{needsRecovery ? 'Log in again' : 'Log in'}</button>
          {needsRecovery ? <button className="btn-ghost" onClick={() => logout(false)}>Sign out</button>
            : allowSelfRegistration && <a className="btn-primary" href={client.signupUrl(returnUrl)}>Sign up<ArrowRight size={15} /></a>}
        </>}
      </nav>
    </header>
    <main id="public-main" tabIndex={-1}>
      {signedIn && <div className="public-notice"><EmailVerificationPrompt /></div>}
      <section className="public-hero">
        <div className="public-hero-orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="public-hero-content">
          <p className="public-eyebrow">Public page placeholder</p>
          <h1>Your public page<br /><span>starts here.</span></h1>
          <p className="public-intro">A blank page for your app's public website. Add your own content and make it yours.</p>
          {!loading && admin && <p className="public-welcome"><Link className="btn-primary" to={backofficePath('/')}>Start building<ArrowRight size={17} /></Link></p>}
          {!loading && !hasSession && <div className="public-hero-actions">
            {allowSelfRegistration ? <a className="btn-primary" href={client.signupUrl(returnUrl)}>Create your account<ArrowRight size={17} /></a> : <button className="btn-primary" onClick={login}>Log in to your account<ArrowRight size={17} /></button>}
          </div>}
          {!loading && signedIn && <p className="public-welcome">Welcome back{currentUser?.user?.name ? `, ${currentUser.user.name}` : ''}.</p>}
          {(error || needsRecovery) && <p role="status" className="mt-4 text-sm text-mist-muted">Your account details are temporarily unavailable. {needsRecovery && 'Log in again, or sign out to clear this session. '}You can still browse this website.</p>}
        </div>
      </section>
    </main>
    <footer className="public-footer"><span>© {new Date().getFullYear()} {settings.app_name}</span><span>{settings.footer_note || 'Thanks for stopping by.'}</span></footer>
  </div>;
}
