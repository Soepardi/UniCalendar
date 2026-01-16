'use client';

import React from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { AlertTriangle, Info, X } from 'lucide-react';

export const ConfirmationModal = () => {
    const { confirmation, clearConfirmation } = useNotificationStore();

    if (!confirmation) return null;

    const {
        title,
        message,
        onConfirm,
        onCancel,
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        type = 'danger'
    } = confirmation;

    const handleConfirm = () => {
        onConfirm();
        clearConfirmation();
    };

    const handleCancel = () => {
        onCancel?.();
        clearConfirmation();
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
            >
                <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${type === 'danger' ? 'bg-red-50/50' : 'bg-blue-50/50'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            {type === 'danger' ? <AlertTriangle size={20} /> : <Info size={20} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">
                                Action Required
                            </p>
                        </div>
                    </div>
                    <button onClick={handleCancel} className="p-2 hover:bg-gray-200/50 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm font-medium text-gray-600 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-2 mt-8">
                        <button
                            onClick={handleCancel}
                            className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={`flex-[2] py-3 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 ${type === 'danger'
                                    ? 'bg-red-600 shadow-red-500/20 hover:bg-red-700'
                                    : 'bg-indigo-600 shadow-indigo-500/20 hover:bg-indigo-700'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
