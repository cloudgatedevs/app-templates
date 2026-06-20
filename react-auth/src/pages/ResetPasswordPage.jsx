import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { idpResetPassword } from '@/api/idpApi';
import { Alert } from '@/components/Alert';
import { FormField } from '@/components/FormField';
import { getRecaptchaPayload } from '@/utils/recaptcha';
import { useReturnUrl, withReturnUrl } from '@/utils/useReturnUrl';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = useReturnUrl();

  const userId = searchParams.get('userId');
  const resetCode = searchParams.get('resetCode');
  const expireDate = searchParams.get('expireDate');
  const tenantId = searchParams.get('tenantId');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tokenValid = !!(userId && resetCode && expireDate && tenantId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!tokenValid) {
      setError('Invalid or expired reset link. Please request a new one.');
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
      await idpResetPassword({
        userId: Number(userId),
        resetCode,
        expireDate,
        tenantId: Number(tenantId),
        password,
        ...recaptcha,
      });
      navigate(withReturnUrl('/login?reset=success', returnUrl), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="flex flex-col gap-5 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Invalid or expired link</h1>
        <p className="text-sm text-gray-600">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link to={withReturnUrl('/forgot-password', returnUrl)} className="btn btn-primary">
          Request new link
        </Link>
        <Link to={withReturnUrl('/login', returnUrl)} className="text-sm font-medium text-primary hover:text-primary-hover">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900">Set new password</h1>
        <p className="mt-1 text-sm text-gray-600">Choose a new password for your account</p>
      </div>

      {error && <Alert>{error}</Alert>}

      <FormField
        label="New password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        required
      />

      <FormField
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
        required
      />

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Resetting…' : 'Reset password'}
      </button>
    </form>
  );
}
