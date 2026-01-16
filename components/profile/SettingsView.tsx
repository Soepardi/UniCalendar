'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Lock, Loader2, Save, LogOut, Shield, Mail, Settings, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useRouter } from 'next/navigation';

type Tab = 'general' | 'security';

export const SettingsView = () => {
    const { user, profile, refreshProfile, signOut } = useAuthStore();
    const { addToast } = useNotificationStore();
    const router = useRouter();

    // UI State
    const [activeTab, setActiveTab] = useState<Tab>('general');
    const [loading, setLoading] = useState(false);

    // Form State
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Initialize from auth store
    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setFullName(profile.full_name || ''); // Note: adding full_name to profiles might be good too
        } else if (user) {
            setUsername(user.user_metadata?.username || '');
            setFullName(user.user_metadata?.full_name || '');
        }
    }, [user, profile]);

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) {
                throw new Error("You must be logged in to update settings");
            }

            const profileUpdate: any = {
                id: user.id,
                username: username.trim(),
                full_name: fullName.trim(),
                updated_at: new Date().toISOString()
            };

            const promises: Promise<any>[] = [];

            // Only update Auth metadata if on general tab (to keep in sync) 
            // but we can skip it if it's too slow. Let's keep it but separate it 
            // from the critical path if we want, or just accept it's slower.
            // ACTUALLY: Let's skip Auth metadata sync for general info if it's the bottleneck.
            // For now, let's only do Auth update IF there is a password change.

            if (activeTab === 'security' && newPassword) {
                if (newPassword !== confirmPassword) {
                    throw new Error("New passwords do not match");
                }
                if (newPassword.length < 6) {
                    throw new Error("Password must be at least 6 characters");
                }
                // When changing password, we must use auth.updateUser
                promises.push(supabase.auth.updateUser({
                    password: newPassword,
                    data: {
                        username: username.trim(),
                        full_name: fullName.trim()
                    }
                }));
            }

            // Always update Profiles table
            promises.push(
                supabase.from('profiles')
                    .upsert(profileUpdate)
                    .select()
                    .single() as any
            );

            const results = await Promise.all(promises);

            // Find results
            const profileResult = results.find(r => r.data && r.data.id === user.id);
            const authResult = results.find(r => r.data && r.data.user);

            if (authResult?.error) throw authResult.error;
            if (profileResult?.error) throw profileResult.error;

            // Immediate store update
            if (profileResult.data) {
                useAuthStore.getState().setProfile(profileResult.data);
            }

            addToast('Settings saved successfully!', 'success');

            if (activeTab === 'security') {
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            addToast(err.message || 'Failed to save settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row gap-8 py-6">

            {/* Sidebar / Tabs */}
            <div className="w-full md:w-64 flex-shrink-0">
                <nav className="space-y-1">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'general'
                            ? 'bg-[#e8f0fe] text-[#1a73e8]'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        <User size={18} />
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'security'
                            ? 'bg-[#e8f0fe] text-[#1a73e8]'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        <Shield size={18} />
                        Security
                    </button>
                </nav>

                <div className="mt-8 pt-8 border-t border-gray-100 px-4">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 max-w-4xl">
                <div className="mb-8 pb-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                        {activeTab === 'general' ? 'Personal Information' : 'Security Settings'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                        {activeTab === 'general' ? 'Manage your basic account details.' : 'Update your password and secure your account.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Email Field (Read Only) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed text-sm"
                                    />
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-2.5 text-gray-400">
                                        <Users size={18} strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/10 rounded-xl outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400 text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Username */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-2.5 text-gray-400 font-bold text-xs">@</div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/10 rounded-xl outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400 text-sm"
                                        placeholder="username"
                                        minLength={3}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
                                To change your password, enter it below.
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-[#1a73e8] transition-colors" size={18} />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/10 rounded-xl outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400 text-sm"
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                {newPassword && (
                                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-[#1a73e8] transition-colors" size={18} />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`w-full pl-10 pr-4 py-2 bg-white border ${confirmPassword && confirmPassword !== newPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#1a73e8]'} focus:ring-2 rounded-xl outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400 text-sm`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    <div className="pt-2 flex justify-start">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] active:scale-[0.98] text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 text-sm"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : (
                                <>
                                    <Save size={16} />
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
