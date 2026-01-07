'use client';

import React from 'react';
import Image from 'next/image';
import { DonationButton } from './ui/DonationButton';
import { LanguageSelector } from './LanguageSelector';

export const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 glass border-b border-indigo-100/30 backdrop-blur-xl bg-white/60">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
                        <img
                            src="/UniCalendar/logo.png"
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
                    <div className="w-10 h-10 rounded-full border border-[#dadce0] p-0.5 hover:bg-[#f8f9fa] cursor-pointer transition-all active:scale-95">
                        <div className="w-full h-full rounded-full bg-[#1a73e8]/10 flex items-center justify-center text-[#1a73e8] font-bold text-sm">
                            A
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
