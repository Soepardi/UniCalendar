'use client';
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLanguageStore } from '@/store/useLanguageStore';

const CalendarGrid = dynamic(
  () => import("@/components/CalendarGrid").then((mod) => mod.CalendarGrid),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[600px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/50 rounded-3xl p-4 md:p-8 border border-[#dadce0] animate-pulse h-[400px]"></div>
        ))}
      </div>
    )
  }
);

export default function Home() {
  const { translations, _hasHydrated } = useLanguageStore();

  if (!_hasHydrated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="space-y-12 md:space-y-24 pt-8">


      {/* Main Grid Section */}
      <div className="relative">
        <div className="absolute -inset-10 bg-indigo-500/5 blur-[100px] rounded-full -z-10 animate-pulse"></div>
        <CalendarGrid />
      </div>      {/* CTA Section */}
      <section className="relative px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[3rem] bg-[#1a73e8] p-8 md:p-16 text-center text-white shadow-2xl shadow-blue-500/20">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-black/10 rounded-full blur-3xl animate-pulse"></div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-6xl font-bold tracking-tight leading-tight">
                Ready to organize your <span className="text-white/80">global life?</span>
              </h2>
              <p className="text-lg md:text-xl text-blue-50 font-medium leading-relaxed max-w-2xl mx-auto">
                Join thousands of users who trust UniCal to manage their multiple calendars in one seamless interface. Save your events, set recurrences, and never miss a beat.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => {
                    const authBtn = document.querySelector('button[onClick*="openAuthModal"]') as HTMLButtonElement;
                    if (authBtn) authBtn.click();
                  }}
                  className="px-10 py-4 bg-white text-[#1a73e8] rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-[#ffffff]/20 active:scale-95 flex items-center gap-3"
                >
                  Start for free
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Footer */}
      <footer className="relative mt-12 md:mt-24">
        <div className="absolute inset-0 vibrant-mesh -z-10 rounded-[3rem]"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 p-6 md:p-16 pt-12 md:pt-24 border-t border-[#f1f3f4]/50">
          <div className="space-y-6 md:space-y-8 text-left rtl:text-right w-full md:w-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a73e8]/5 border border-[#1a73e8]/10 group cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a73e8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1a73e8]"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a73e8]">UniCal: v2.0 Pro</span>
            </div>

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

          <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
            <div className="flex gap-4 mb-4">
              {/* Decorative dots to add 'life' */}
              {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#dadce0]"></div>)}
            </div>
            <div className="text-[10px] font-bold text-[#9aa0a6] uppercase tracking-[0.3em]">
              Soe © 2025
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
