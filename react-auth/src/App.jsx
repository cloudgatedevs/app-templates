import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthLayout } from '@/components/AuthLayout';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { SuccessPage } from '@/pages/SuccessPage';

function RedirectToLogin() {
  const location = useLocation();
  return <Navigate to={`/login${location.search}`} replace />;
}

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/success" element={<SuccessPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route path="/" element={<RedirectToLogin />} />
      <Route path="*" element={<RedirectToLogin />} />
    </Routes>
  </BrowserRouter>
);

export { App };
