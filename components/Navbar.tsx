'use client';

import React from 'react';
import Image from 'next/image';
import { DonationButton } from './ui/DonationButton';
import { LanguageSelector } from './LanguageSelector';

import { useAuthStore } from '@/store/useAuthStore';
import { AuthModal } from './auth/AuthModal';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
    const { user, signOut, initialize } = useAuthStore();
    const [isAuthOpen, setIsAuthOpen] = React.useState(false);
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);

    React.useEffect(() => {
        initialize();
    }, [initialize]);
    return (
        <header className="sticky top-0 z-50 glass border-b border-indigo-100/30 backdrop-blur-xl bg-white/60">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
                        <img
                            src="/logo.png"
                            alt="UniCal Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-lg font-black text-zinc-900 tracking-tighter">
                            UniCal
                        </h1>
                        <p className="text-[9px] font-bold text-indigo-600/60 uppercase tracking-widest leading-none">World Calendar</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <LanguageSelector />
                    <DonationButton />
                    {/* User Account Button */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="w-10 h-10 rounded-full border border-[#dadce0] p-0.5 hover:bg-[#f8f9fa] cursor-pointer transition-all active:scale-95"
                            >
                                <div className="w-full h-full rounded-full bg-[#1a73e8]/10 flex items-center justify-center text-[#1a73e8] font-bold text-sm">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                            </button>

                            {showProfileMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 py-3 border-b border-gray-50">
                                        <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                                        <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setShowProfileMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthOpen(true)}
                            className="px-5 py-2 rounded-full bg-[#1a73e8] hover:bg-[#185abc] text-white font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2"
                        >
                            <UserIcon size={16} />
                            <span className="hidden md:inline">Sign In</span>
                        </button>
                    )}

                    <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
                </div>
            </div>
        </header>
    );
};
