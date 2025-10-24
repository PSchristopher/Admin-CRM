import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title = '', message = '', duration = 4000 }) => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, type, title, message }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 360,
      }}>
        {toasts.map((t) => (
          <div key={t.id} role="status" style={{
            background: '#fff',
            padding: '12px 14px',
            borderRadius: 8,
            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${t.type === 'success' ? '#16a34a' : t.type === 'error' ? '#dc2626' : '#2563eb'}`,
            color: '#111',
          }}>
            {t.title && <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.title}</div>}
            <div style={{ fontSize: 13 }}>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  const { addToast } = ctx;
  return {
    addToast,
    success: (opts) => addToast({ type: 'success', ...opts }),
    error: (opts) => addToast({ type: 'error', ...opts }),
    info: (opts) => addToast({ type: 'info', ...opts }),
  };
};

export default ToastProvider;