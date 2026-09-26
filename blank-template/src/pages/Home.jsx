import { ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext, useCloudgate, useSettings, EmailVerificationPrompt } from '@cloudgatedevs/cloudgate-client/react';
import { canAccessBackoffice } from '@cloudgatedevs/cloudgate-client/platform';

export function Home() {
  const { client, backofficePath } = useCloudgate();
  const { settings, allowSelfRegistration } = useSettings();
  const { auth, currentUser, loading, logout, error } = useAuthContext();
  const signedIn = !!auth?.accessToken;
  const admin = signedIn && canAccessBackoffice(currentUser?.user);
  const returnUrl = new URL('/', window.location.origin).href;
  const login = () => client.login(returnUrl);
  return <div className="public-site">
    <a className="skip-link" href="#public-main">Skip to content</a>
    <header className="public-header">
      <Link to="/" className="public-brand">
        {settings.app_logo_url ? <img src={settings.app_logo_url} alt="" /> : <span className="public-brand-mark" aria-hidden="true">{settings.app_name.slice(0, 1)}</span>}
        <span>{settings.app_name}</span>
      </Link>
      <nav aria-label="Account" className="public-account">
        {loading ? <span className="text-xs text-mist-muted" role="status">Checking session…</span> : signedIn ? <>
          {admin && <Link className="btn-primary" to={backofficePath('/')}><LayoutDashboard size={16} />Back office</Link>}
          <button className="btn-ghost" onClick={() => logout(false)}><LogOut size={16} />Log out</button>
        </> : <>
          <button className="btn-ghost" onClick={login}>Log in</button>
          {allowSelfRegistration && <a className="btn-primary" href={client.signupUrl(returnUrl)}>Sign up<ArrowRight size={15} /></a>}
        </>}
      </nav>
    </header>
    <main id="public-main" tabIndex={-1}>
      {signedIn && <div className="public-notice"><EmailVerificationPrompt /></div>}
      <section className="public-hero">
        <div className="public-hero-orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="public-hero-content">
          <p className="public-eyebrow">Welcome to {settings.app_name}</p>
          <h1>Your next chapter<br /><span>starts here.</span></h1>
          <p className="public-intro">{settings.app_description || 'A place to connect, discover, and get things done. Welcome to our online home.'}</p>
          {!loading && !signedIn && <div className="public-hero-actions">
            {allowSelfRegistration ? <a className="btn-primary" href={client.signupUrl(returnUrl)}>Create your account<ArrowRight size={17} /></a> : <button className="btn-primary" onClick={login}>Log in to your account<ArrowRight size={17} /></button>}
          </div>}
          {!loading && signedIn && <p className="public-welcome">Welcome back{currentUser?.user?.name ? `, ${currentUser.user.name}` : ''}.</p>}
          {error && <p className="mt-4 text-sm text-mist-muted">Your account details are temporarily unavailable. You can still browse this website.</p>}
        </div>
      </section>
    </main>
    <footer className="public-footer"><span>© {new Date().getFullYear()} {settings.app_name}</span><span>{settings.footer_note || 'Thanks for stopping by.'}</span></footer>
  </div>;
}
