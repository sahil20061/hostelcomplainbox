import { useState, useEffect, useCallback } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return { toasts, success, error, info, removeToast };
}

export function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${colors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in pointer-events-auto`}
          style={{
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <span className="text-lg font-bold flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20">
            {icons[toast.type]}
          </span>
          <p className="text-sm flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/80 hover:text-white flex-shrink-0 text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
