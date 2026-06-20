import { useState } from 'react';
import { Link } from 'react-router-dom';
import { idpRequestPasswordReset } from '@/api/idpApi';
import { Alert } from '@/components/Alert';
import { FormField } from '@/components/FormField';
import { getRecaptchaPayload } from '@/utils/recaptcha';
import { useReturnUrl, withReturnUrl } from '@/utils/useReturnUrl';

export function ForgotPasswordPage() {
  const returnUrl = useReturnUrl();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    setLoading(true);
    try {
      const recaptcha = await getRecaptchaPayload();
      await idpRequestPasswordReset({ email: email.trim(), ...recaptcha });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Check your email</h1>
        <Alert variant="success">
          If an account exists for <strong>{email}</strong>, we sent a password reset link.
        </Alert>
        <Link to={withReturnUrl('/login', returnUrl)} className="btn btn-primary">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900">Reset password</h1>
        <p className="mt-1 text-sm text-gray-600">Enter your email to receive a reset link</p>
      </div>

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

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link to={withReturnUrl('/login', returnUrl)} className="font-medium text-primary hover:text-primary-hover">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
