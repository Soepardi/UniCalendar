'use client';

import React, { useState, useEffect } from 'react';
import { useEventStore } from '@/store/useEventStore';
import { Calendar as CalendarIcon, X, Save, Briefcase, User } from 'lucide-react';
import { format } from 'date-fns';

interface AgendaModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
}

export const AgendaModal = ({ isOpen, onClose, date }: AgendaModalProps) => {
    const { addEvent } = useEventStore();
    const dateKey = format(date, 'yyyy-MM-dd');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'work' | 'personal'>('personal');

    // Reset form when modal opens or date changes
    useEffect(() => {
        setTitle('');
        setDescription('');
        setType('personal');
    }, [isOpen, date]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title.trim()) return;

        await addEvent({
            title,
            description,
            date: dateKey,
            type, // 'work' or 'personal'
            color: type === 'work' ? 'red' : 'yellow' // Fallback color support
        });

        onClose();
        setTitle('');
        setDescription('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                <div className="bg-[#f8f9fa] border-b border-gray-100 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <CalendarIcon size={20} className="text-[#1a73e8]" />
                            {format(date, 'MMMM d, yyyy')}
                        </h2>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
                            Create New Agenda
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200/50 transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                            Agenda Name
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., Project Deadline"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 ring-[#1a73e8]/20 focus:border-[#1a73e8] outline-none transition-all font-medium"
                            autoFocus
                        />
                    </div>

                    {/* Type Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                            Type
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setType('work')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${type === 'work' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Briefcase size={18} />
                                Work
                            </button>
                            <button
                                onClick={() => setType('personal')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${type === 'personal' ? 'bg-yellow-50 border-yellow-500 text-yellow-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <User size={18} />
                                Personal
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Add details..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 ring-[#1a73e8]/20 focus:border-[#1a73e8] outline-none transition-all resize-none font-medium text-sm"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2">
                        <button
                            onClick={handleSave}
                            disabled={!title.trim()}
                            className={`w-full py-3 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${type === 'work' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20'}`}
                        >
                            <Save size={18} />
                            Save Agenda
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
