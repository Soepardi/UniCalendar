'use client';

import React, { useState } from 'react';
import { useTeamStore } from '@/store/useTeamStore';
import { Users, Plus, X, Loader2 } from 'lucide-react';

interface CreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateTeamModal = ({ isOpen, onClose }: CreateTeamModalProps) => {
    const { createTeam } = useTeamStore();
    const [teamName, setTeamName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await createTeam(teamName.trim());
            setTeamName('');
            onClose();
        } catch (err) {
            setError('Failed to create team. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Plus size={20} className="text-indigo-600" />
                            Create New Team
                        </h2>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
                            Team Collaboration
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200/50 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Team Name</label>
                        <div className="relative group">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-indigo-500" size={16} />
                            <input
                                type="text"
                                name="teamName"
                                id="teamName"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="e.g., Marketing Team"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                                autoFocus
                                required
                            />
                        </div>
                        {error && <p className="text-xs font-medium text-red-500 ml-1">{error}</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !teamName.trim()}
                            className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Plus size={16} />
                            )}
                            Create Team
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
