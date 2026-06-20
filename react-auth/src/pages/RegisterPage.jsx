import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { idpRegister } from '@/api/idpApi';
import { Alert } from '@/components/Alert';
import { FormField } from '@/components/FormField';
import { getRecaptchaPayload } from '@/utils/recaptcha';
import { useReturnUrl, withReturnUrl } from '@/utils/useReturnUrl';

export function RegisterPage() {
  const navigate = useNavigate();
  const returnUrl = useReturnUrl();

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !surname.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const recaptcha = await getRecaptchaPayload();
      const result = await idpRegister({
        email: email.trim(),
        password,
        name: name.trim(),
        surname: surname.trim(),
        returnUrl,
        ...recaptcha,
      });
      if (!result.accessToken) {
        setError('Registration succeeded but no access token was returned.');
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
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900">Create account</h1>
        <p className="mt-1 text-sm text-gray-600">Sign up to get started</p>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="First name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="given-name"
          required
        />
        <FormField
          label="Last name"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          autoComplete="family-name"
          required
        />
      </div>

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
        <label htmlFor="reg-password" className="form-label">
          Password
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
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

      <FormField
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
        required
      />

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Creating account…' : 'Sign up'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to={withReturnUrl('/login', returnUrl)} className="font-medium text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </form>
  );
}
