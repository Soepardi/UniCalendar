'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { DonationButton } from '../ui/DonationButton';
import { useCalendarStore } from '@/store/useCalendarStore';

const CalendarControls = dynamic(
    () => import('../CalendarControls').then((mod) => mod.CalendarControls),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col gap-8">
                <div className="h-[88px] w-full bg-white/50 animate-pulse rounded-[2rem] border border-[#dadce0]"></div>
                <div className="h-[40px] w-3/4 bg-white/50 animate-pulse rounded-full border border-[#dadce0]"></div>
            </div>
        )
    }
);

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden flex flex-col">
            {/* Immersive Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/5 blur-[130px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Top Navigation Bar */}
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
                        <DonationButton />
                        <div className="w-10 h-10 rounded-full border border-[#dadce0] p-0.5 hover:bg-[#f8f9fa] cursor-pointer transition-all active:scale-95">
                            <div className="w-full h-full rounded-full bg-[#1a73e8]/10 flex items-center justify-center text-[#1a73e8] font-bold text-sm">
                                A
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="mb-12">
                        <CalendarControls />
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
};
