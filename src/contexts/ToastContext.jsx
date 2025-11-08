import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, Check, AlertCircle, Info, Heart } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  const wishlist = useCallback((message, duration) => {
    addToast(message, 'wishlist', duration);
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    wishlist
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 right-4 z-[9999] space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const { id, message, type } = toast;

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    wishlist: <Heart className="w-5 h-5 fill-current" />
  };

  const styles = {
    success: 'bg-green-50 border-green-500 text-green-900',
    error: 'bg-red-50 border-red-500 text-red-900',
    warning: 'bg-amber-50 border-amber-500 text-amber-900',
    info: 'bg-blue-50 border-blue-500 text-blue-900',
    wishlist: 'bg-pink-50 border-pink-500 text-pink-900'
  };

  return (
    <div 
      className={`
        ${styles[type]}
        min-w-[300px] max-w-md
        flex items-center gap-3
        px-4 py-3
        border-l-4
        shadow-xl
        pointer-events-auto
        animate-slide-in-right
        backdrop-blur-sm bg-opacity-95
      `}
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      
      <p className="flex-1 text-sm font-medium tracking-wide">
        {message}
      </p>
      
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 hover:bg-black/10 rounded-full p-1 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
