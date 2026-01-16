'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { DonationButton } from '../ui/DonationButton';
import { useCalendarStore } from '@/store/useCalendarStore';
import { Navbar } from '../Navbar';
import { usePathname } from 'next/navigation';

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
    const pathname = usePathname();

    // If we are on the dashboard or auth page, return children directly (no global wrapper)
    if (pathname === '/profile' || pathname === '/my-calendars' || pathname === '/auth') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden flex flex-col">
            {/* Immersive Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/5 blur-[130px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Top Navigation Bar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-6 pt-12">
                    <div className="mb-6">
                        <CalendarControls />
                    </div>
                </div>
                {children}
            </main>
        </div>
    );
};
