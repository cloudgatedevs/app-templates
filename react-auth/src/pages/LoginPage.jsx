import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { idpLogin } from '@/api/idpApi';
import { Alert } from '@/components/Alert';
import { FormField } from '@/components/FormField';
import { getRecaptchaPayload } from '@/utils/recaptcha';
import { useReturnUrl, withReturnUrl } from '@/utils/useReturnUrl';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = useReturnUrl();
  const resetSuccess = searchParams.get('reset') === 'success';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      const recaptcha = await getRecaptchaPayload();
      const result = await idpLogin({
        email: email.trim(),
        password,
        returnUrl,
        ...recaptcha,
      });
      if (!result.accessToken) {
        setError('Login succeeded but no access token was returned.');
        return;
      }
      navigate('/success', {
        replace: true,
        state: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
          returnUrl: result.returnUrl ?? returnUrl ?? null,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900">Sign in</h1>
        <p className="mt-1 text-sm text-gray-600">Enter your credentials to continue</p>
      </div>

      {resetSuccess && (
        <Alert variant="success">Your password has been reset. You can sign in now.</Alert>
      )}
      {error && <Alert>{error}</Alert>}

      <FormField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="password" className="form-label mb-0">
            Password
          </label>
          <Link
            to={withReturnUrl('/forgot-password', returnUrl)}
            className="text-xs font-medium text-primary hover:text-primary-hover"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            required
            className="form-control pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to={withReturnUrl('/signup', returnUrl)} className="font-medium text-primary hover:text-primary-hover">
          Sign up
        </Link>
      </p>
    </form>
  );
}
