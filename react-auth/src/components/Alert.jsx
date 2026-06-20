/** @param {{ variant?: 'error' | 'success' | 'info'; children: import('react').ReactNode; className?: string }} props */
export function Alert({ variant = 'error', children, className = '' }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-green-200 bg-green-50 text-green-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };
  return (
    <div className={`rounded-lg border px-3 py-2.5 text-sm ${styles[variant]} ${className}`} role="alert">
      {children}
    </div>
  );
}
