'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, ArrowRight, Users, ChevronLeft, Globe, ArrowLeft } from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
    const { addToast } = useNotificationStore();
    const { user, initialize, signIn, signUp } = useAuthStore();
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (user) {
            router.push('/profile');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signIn(email, password);
                router.push('/profile');
            } else {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                if (username.trim().length < 3) {
                    throw new Error("Username must be at least 3 characters");
                }
                if (fullName.trim().length < 2) {
                    throw new Error("Please enter your full name");
                }

                await signUp(email, password, {
                    username: username.trim(),
                    full_name: fullName.trim(),
                });

                addToast('Account created! Please check your email to confirm.', 'success');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen w-screen bg-white font-outfit overflow-hidden">
            {/* Left Brand Pane */}
            <div className="relative w-full md:w-[45%] lg:w-[40%] bg-[#1a73e8] overflow-hidden flex flex-col p-8 md:p-16 text-white h-full">
                {/* Immersive Mesh/Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-black/10 blur-[80px] rounded-full" style={{ animationDelay: '1s' }}></div>

                {/* Floating Patterns (Lines) */}
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 400">
                    <path d="M 0 400 Q 200 200 400 400" fill="none" stroke="white" strokeWidth="2" />
                    <path d="M 0 350 Q 200 150 400 350" fill="none" stroke="white" strokeWidth="2" />
                    <path d="M 0 300 Q 200 100 400 300" fill="none" stroke="white" strokeWidth="2" />
                </svg>

                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-12 md:mb-24">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                        </div>
                        <span className="text-xl font-black tracking-tighter">UniCal</span>
                    </div>

                    <div className="mt-auto space-y-6">
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left duration-700">
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Hello UniCal! 👋</h1>
                        </div>

                        <div className="space-y-4 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                            <p className="text-xl md:text-2xl font-medium text-white/90 leading-relaxed">
                                Master your time across every calendar system on Earth.
                            </p>
                            <p className="text-sm md:text-base text-white/70 leading-relaxed">
                                Join thousands of users who skip the confusion of multiple timezones and calendars. One interface, many worlds.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 md:mt-24 pt-8 border-t border-white/10 text-xs font-medium text-white/50 tracking-[0.2em] uppercase">
                        © 2026 UniCal. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Form Pane */}
            <div className="flex-1 flex flex-col bg-white h-full relative">
                <div className="absolute top-0 left-0 right-0 p-4 md:p-8 flex justify-between items-center z-10">
                    <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold">Back to Site</span>
                    </Link>

                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-bold text-[#1a73e8] hover:underline"
                    >
                        {isLogin ? 'Create a new account' : 'Already have an account?'}
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 md:p-16">
                    <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                {isLogin ? 'Welcome Back!' : 'Get Started!'}
                            </h2>
                            <p className="text-gray-500 text-sm font-medium">
                                {isLogin ? (
                                    <>
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setIsLogin(false)}
                                            className="font-bold text-[#1a73e8] hover:underline"
                                        >
                                            Create a new account now
                                        </button>
                                        , it's FREE!
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setIsLogin(true)}
                                            className="font-bold text-[#1a73e8] hover:underline"
                                        >
                                            Sign in here
                                        </button>
                                    </>
                                )}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a73e8] ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-0 top-3 text-[#1a73e8]/40" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2 border-b-2 border-gray-100 focus:border-[#1a73e8] outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-medium"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {!isLogin && (
                                    <>
                                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#1a73e8] ml-1">Full Name</label>
                                            <div className="relative">
                                                <Users className="absolute left-0 top-3 text-[#1a73e8]/40" size={18} />
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="w-full pl-8 pr-4 py-2 border-b-2 border-gray-100 focus:border-[#1a73e8] outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-medium"
                                                    placeholder="John Doe"
                                                    required={!isLogin}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#1a73e8] ml-1">Username</label>
                                            <div className="relative">
                                                <span className="absolute left-0 top-3 font-bold text-[#1a73e8]/40 text-sm">@</span>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="w-full pl-8 pr-4 py-2 border-b-2 border-gray-100 focus:border-[#1a73e8] outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-medium"
                                                    placeholder="username"
                                                    required={!isLogin}
                                                    minLength={3}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#1a73e8] ml-1">Password</label>
                                        {isLogin && (
                                            <button type="button" className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">
                                                Forgot password?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-0 top-3 text-[#1a73e8]/40" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2 border-b-2 border-gray-100 focus:border-[#1a73e8] outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-medium"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                {!isLogin && (
                                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#1a73e8] ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-0 top-3 text-[#1a73e8]/40" size={18} />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`w-full pl-8 pr-4 py-2 border-b-2 focus:border-[#1a73e8] outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-medium ${confirmPassword && confirmPassword !== password ? 'border-red-200' : 'border-gray-100'}`}
                                                placeholder="••••••••"
                                                required={!isLogin}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-[11px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                    <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#1a73e8] hover:bg-[#1557b0] active:scale-[0.98] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>
                                            {isLogin ? 'Login Now' : 'Create Account'}
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
