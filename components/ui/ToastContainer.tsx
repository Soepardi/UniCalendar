'use client';

import React from 'react';
import { useNotificationStore, ToastType } from '@/store/useNotificationStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const icons: Record<ToastType, any> = {
    success: <CheckCircle2 size={18} className="text-green-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-blue-500" />
};

const styles: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100'
};

export const ToastContainer = () => {
    const { toasts, removeToast } = useNotificationStore();

    return (
        <div className="fixed top-6 right-6 z-[10000] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl shadow-gray-200/50 
                        animate-in slide-in-from-right-full duration-300 ${styles[toast.type]}
                    `}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {icons[toast.type]}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                            {toast.message}
                        </p>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};
