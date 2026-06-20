// Toast notifications.
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info') => {
      const id = ++idCounter;
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-card-hover ${
              t.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : t.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <span className="grow break-words">{t.message}</span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="shrink-0 text-current opacity-50 transition-opacity hover:opacity-100"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback no-op so pages don't crash if provider is missing.
    return { success() {}, error() {}, info() {} };
  }
  return ctx;
}
