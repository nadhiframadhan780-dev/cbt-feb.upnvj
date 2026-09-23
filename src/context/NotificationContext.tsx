import React, { createContext, useContext, useState, useCallback } from 'react';
import { StyledNotification } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface ModalAlert {
  isOpen: boolean;
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  badgeText?: string;
  confirmText?: string;
  onConfirm?: () => void;
}

interface NotificationContextType {
  showToast: (type: StyledNotification['type'], title: string, message: string, duration?: number) => void;
  showModalAlert: (type: ModalAlert['type'], title: string, message: string, badgeText?: string, confirmText?: string, onConfirm?: () => void) => void;
  closeModalAlert: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<StyledNotification[]>([]);
  const [modalAlert, setModalAlert] = useState<ModalAlert>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((
    type: StyledNotification['type'], 
    title: string, 
    message: string, 
    duration: number = 4500
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newToast: StyledNotification = { id, type, title, message, duration };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Max 5 toasts

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const showModalAlert = useCallback((
    type: ModalAlert['type'],
    title: string,
    message: string,
    badgeText?: string,
    confirmText?: string,
    onConfirm?: () => void
  ) => {
    setModalAlert({
      isOpen: true,
      type,
      title,
      message,
      badgeText,
      confirmText: confirmText || 'Saya Mengerti',
      onConfirm
    });
  }, []);

  const closeModalAlert = useCallback(() => {
    if (modalAlert.onConfirm) {
      modalAlert.onConfirm();
    }
    setModalAlert((prev) => ({ ...prev, isOpen: false }));
  }, [modalAlert]);

  return (
    <NotificationContext.Provider value={{ showToast, showModalAlert, closeModalAlert }}>
      {children}

      {/* Styled Toast Container (Top-Right) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-full px-4 sm:px-0">
        {toasts.map((toast) => {
          let borderTheme = 'border-teal-500 bg-white shadow-teal-900/10 text-slate-800';
          let icon = <Info className="w-5 h-5 text-teal-600 flex-shrink-0" />;
          let badgeColor = 'bg-teal-50 text-teal-700 border-teal-200';

          if (toast.type === 'success') {
            borderTheme = 'border-emerald-500 bg-white shadow-emerald-900/10 text-slate-800';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
            badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          } else if (toast.type === 'warning') {
            borderTheme = 'border-amber-500 bg-amber-50/95 shadow-amber-900/10 text-amber-950';
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
            badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
          } else if (toast.type === 'error') {
            borderTheme = 'border-rose-500 bg-rose-50/95 shadow-rose-900/10 text-rose-950';
            icon = <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
            badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border-2 shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in slide-in-from-top-4 fade-in ${borderTheme}`}
            >
              <div className="pt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider">{toast.title}</h4>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border uppercase ${badgeColor}`}>
                    {toast.type}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Styled Modal Alert Dialog */}
      {modalAlert.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl overflow-hidden">
            
            {/* Top Accent Strip */}
            <div className={`absolute top-0 left-0 right-0 h-2 ${
              modalAlert.type === 'warning' ? 'bg-amber-500' :
              modalAlert.type === 'error' ? 'bg-rose-600' :
              modalAlert.type === 'success' ? 'bg-emerald-500' : 'bg-teal-600'
            }`} />

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                modalAlert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                modalAlert.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                modalAlert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                'bg-teal-50 border-teal-200 text-teal-600'
              }`}>
                {modalAlert.type === 'warning' && <AlertTriangle className="w-6 h-6" />}
                {modalAlert.type === 'error' && <ShieldAlert className="w-6 h-6" />}
                {modalAlert.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
                {modalAlert.type === 'info' && <Sparkles className="w-6 h-6" />}
              </div>

              <div className="flex-1">
                {modalAlert.badgeText && (
                  <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border mb-1.5 ${
                    modalAlert.type === 'warning' ? 'bg-amber-100 border-amber-300 text-amber-900' :
                    modalAlert.type === 'error' ? 'bg-rose-100 border-rose-300 text-rose-900' :
                    'bg-slate-100 border-slate-300 text-slate-800'
                  }`}>
                    {modalAlert.badgeText}
                  </span>
                )}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {modalAlert.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {modalAlert.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModalAlert}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all cursor-pointer ${
                  modalAlert.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' :
                  modalAlert.type === 'error' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' :
                  'bg-teal-700 hover:bg-teal-800 shadow-teal-700/20'
                }`}
              >
                {modalAlert.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
