'use client';

import React from 'react';
import { DonationButton } from './ui/DonationButton';
import { LanguageSelector } from './LanguageSelector';

export const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 glass border-b border-indigo-100/30 backdrop-blur-xl bg-white/60">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 premium-gradient rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:rotate-12 transition-transform">
                        <span className="text-white font-black text-xl tracking-tighter">U</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-zinc-900 tracking-tighter">
                            uniCal
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
