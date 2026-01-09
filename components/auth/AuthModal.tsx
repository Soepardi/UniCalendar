'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onClose();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
                onClose();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                {/* Decorative Header */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#1a73e8] to-[#8ab4f8] opacity-10"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors text-gray-500 z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8 pt-10 relative z-0">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#e8f0fe] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1a73e8]">
                            <Lock size={32} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            {isLogin ? 'Sign in to access your personal calendar' : 'Join UniCal to save your schedule'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#1a73e8] transition-colors" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#1a73e8]/20 focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#1a73e8] transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#1a73e8]/20 focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-[#1a73e8] hover:bg-[#1557b0] active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    {isLogin ? 'Sign In' : 'Sign Up'}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="font-bold text-[#1a73e8] hover:underline"
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
