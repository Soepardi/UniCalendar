'use client';
import dynamic from "next/dynamic";
import Link from "next/link";
import { User as UserIcon, ChevronRight, CalendarDays, Globe, Twitter, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import { useLanguageStore } from '@/store/useLanguageStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const CalendarGrid = dynamic(
  () => import("@/components/CalendarGrid").then((mod) => mod.CalendarGrid),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[600px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/50 rounded-2xl p-4 md:p-8 border border-[#dadce0] animate-pulse h-[400px]"></div>
        ))}
      </div>
    )
  }
);

export default function Home() {
  const { translations, _hasHydrated } = useLanguageStore();
  const { user, sessionProcessed, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (sessionProcessed && user) {
      router.push('/profile');
    }
  }, [user, sessionProcessed, router]);

  if (!_hasHydrated || (sessionProcessed && user)) {
    return null; // Or a loading spinner
  }

  return (
    <div className="space-y-12 md:space-y-24">
      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative">
          <div className="absolute -inset-10 bg-indigo-500/5 blur-[100px] rounded-full -z-10 animate-pulse"></div>
          <CalendarGrid />
        </div>
      </div>

      {/* CTA Section */}
      <section className="relative px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#4f46e5] p-8 md:p-12 text-center text-white shadow-[0_32px_64px_-16px_rgba(37,99,235,0.3)] border border-white/10 group">
            {/* Immersive background effects */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute -top-1/2 -left-1/4 w-[100%] h-[200%] bg-gradient-to-br from-white/20 to-transparent blur-3xl rotate-12 pointer-events-none"></div>

            <div className="relative z-10 max-w-4xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">Join 10k+ Global Users</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">
                Organize your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-indigo-100 italic">world</span>, beautifully.
              </h2>

              <p className="text-base md:text-xl text-blue-50/80 font-medium leading-relaxed max-w-xl mx-auto tracking-tight">
                UniCal unifies the world's diverse calendars into one stunning interface.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
                <Link
                  href="/auth"
                  className="group/btn relative px-10 py-4 bg-white text-[#1a73e8] rounded-2xl font-black text-lg hover:bg-white transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.4)] active:scale-95 flex items-center gap-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1a73e8]/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative">Get Started Free</span>
                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Floating UI Elements (Decorative) - Scaled down */}
            <div className="absolute top-10 right-10 hidden xl:block animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl rotate-12 shadow-2xl">
                <CalendarDays className="text-white w-6 h-6 opacity-40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Footer - FULL WIDTH */}
      <footer className="relative w-full border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="space-y-6 md:space-y-8 text-left rtl:text-right w-full md:w-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 md:w-12 md:h-12">
                  <img
                    src="/logo.png"
                    alt="UniCal Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-3xl md:text-5xl font-medium text-[#202124] tracking-tighter leading-none">
                  UniCal <span className="text-[#9aa0a6]">Calendar</span>
                </h2>
              </div>
              <p className="text-xs md:text-sm font-medium text-[#5f6368] max-w-md leading-relaxed">
                {translations.home.footer_text}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-10 w-full md:w-auto">
            {/* Social Icons Row */}
            <div className="space-y-4 w-full md:w-auto">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9aa0a6] text-left md:text-right mb-3">Follow Us</div>
              <div className="flex items-center gap-3">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white border border-gray-200/50 text-[#5f6368] hover:text-[#1a73e8] hover:border-[#1a73e8]/20 hover:shadow-md transition-all active:scale-95">
                  <Twitter size={18} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white border border-gray-200/50 text-[#5f6368] hover:text-[#e4405f] hover:border-[#e4405f]/20 hover:shadow-md transition-all active:scale-95">
                  <Instagram size={18} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white border border-gray-200/50 text-[#5f6368] hover:text-[#0a66c2] hover:border-[#0a66c2]/20 hover:shadow-md transition-all active:scale-95">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 pt-6 border-t border-gray-100 w-full md:w-auto">
              <div className="flex gap-4">
                {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-[#dadce0]"></div>)}
              </div>
              <div className="text-[10px] font-black text-[#202124] uppercase tracking-[0.4em] opacity-40">
                Soe © 2025
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
