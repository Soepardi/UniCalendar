'use client';
import dynamic from "next/dynamic";
import { useLanguageStore } from '@/store/useLanguageStore';
import { LanguageSelector } from "@/components/LanguageSelector";

const CalendarGrid = dynamic(
  () => import("@/components/CalendarGrid").then((mod) => mod.CalendarGrid),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[600px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/50 rounded-3xl p-8 border border-[#dadce0] animate-pulse h-[400px]"></div>
        ))}
      </div>
    )
  }
);

export default function Home() {
  const { translations } = useLanguageStore();

  return (
    <div className="space-y-24 pt-8">
      {/* Header / Language Selector */}
      <div className="flex justify-end px-4 md:px-0">
        <LanguageSelector />
      </div>

      {/* Main Grid Section */}
      <div className="relative">
        <div className="absolute -inset-10 bg-indigo-500/5 blur-[100px] rounded-full -z-10 animate-pulse"></div>
        <CalendarGrid />
      </div>

      {/* Premium Scalability: Shared Protocol / Ad Slot */}
      <section className="bg-[#f8f9fa] rounded-[2.5rem] p-8 border border-[#dadce0] flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer hover:bg-white transition-all duration-500">
        <div className="flex items-center gap-6 text-left">
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#dadce0] flex items-center justify-center text-[#1a73e8] shadow-sm group-hover:scale-110 transition-transform duration-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#1a73e8] uppercase tracking-widest mb-1 block">{translations.home.partner}</span>
            <h4 className="text-xl font-medium text-[#202124]">{translations.home.protocol}</h4>
            <p className="text-xs text-[#5f6368] font-medium leading-relaxed">{translations.home.protocol_desc}</p>
          </div>
        </div>
        <button className="px-6 py-2.5 rounded-full bg-[#202124] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a73e8] transition-colors shadow-lg shadow-black/5">{translations.home.connect}</button>
      </section>

      {/* API Infrastructure Section (Bento Layout) */}
      <section className="space-y-12 relative overflow-hidden py-12">
        {/* Background Atmosphere */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full animate-float"></div>
        <div className="absolute bottom-1/4 -left-20 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full animate-float" style={{ animationDelay: '-3s' }}></div>

        <div className="space-y-3 relative z-10 text-center md:text-left rtl:text-right">
          <h3 className="text-2xl font-medium text-[#202124] tracking-tight">{translations.home.infrastructure}</h3>
          <p className="text-[#5f6368] font-medium text-sm">{translations.home.infrastructure_desc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="md:col-span-2 gradient-mesh rounded-[2.5rem] p-10 border border-[#dadce0] shadow-sm relative overflow-hidden group hover-card">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
              <svg className="w-48 h-48 text-[#1a73e8]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
            </div>

            <div className="flex flex-col h-full relative z-10 text-left rtl:text-right">
              <div className="w-12 h-12 rounded-2xl bg-[#1a73e8]/5 flex items-center justify-center text-[#1a73e8] mb-8 border border-[#1a73e8]/10 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <h4 className="text-2xl font-medium text-[#202124] mb-3">{translations.home.api_engine}</h4>
              <p className="text-[#5f6368] text-sm font-medium mb-10 max-w-sm leading-relaxed">{translations.home.api_engine_desc}</p>

              <div className="mt-auto group/terminal ltr">
                <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl border border-white/5 transition-all duration-500 group-hover/terminal:shadow-blue-500/10 group-hover/terminal:scale-[1.02]">
                  {/* macOS Title Bar */}
                  <div className="bg-[#2d2d2d] px-4 py-3 flex items-center justify-between border-b border-white/5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest font-mono">zsh — unical-api</div>
                    <div className="w-12"></div> {/* Spacer */}
                  </div>

                  {/* Terminal Content - Keep English/Code as is */}
                  <div className="p-6 font-mono text-[11px] leading-relaxed text-left">
                    <div className="space-y-2">
                      <div className="flex gap-3">
                        <span className="text-white/40">1</span>
                        <p><span className="text-[#c586c0]">curl</span> <span className="text-[#ce9178]">-X</span> POST <span className="text-[#9cdcfe]">"https://api.unical.pro/v1/sync"</span> \</p>
                      </div>
                      <div className="flex gap-3 text-white/80">
                        <span className="text-white/40">2</span>
                        <p className="pl-4"><span className="text-[#ce9178]">-d</span> <span className="text-[#dcdcaa]">'{'</span> <span className="text-[#9cdcfe]">"origin"</span>: <span className="text-[#ce9178]">"gregorian"</span>, <span className="text-[#9cdcfe]">"target"</span>: <span className="text-[#ce9178]">"hijri"</span> <span className="text-[#dcdcaa]">'}'</span></p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <span className="text-white/40">3</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#4ec9b0]">→</span>
                          <span className="text-green-400 font-bold opacity-80 animate-pulse">200 OK</span>
                          <span className="text-white/20 ml-2">[Public Access Enabled]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-[#dadce0] flex flex-col justify-center items-center text-center space-y-6 shadow-sm hover-card group">
            <div className="relative">
              <div className="absolute -inset-4 bg-[#1a73e8]/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="text-5xl font-medium text-[#1a73e8] tracking-tighter relative z-10">99.99%</div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5f6368]">{translations.home.calendar_accuracy}</p>
            <div className="w-12 h-0.5 bg-[#f1f3f4] rounded-full group-hover:w-20 transition-all duration-500 group-hover:bg-[#1a73e8]/30"></div>
            <p className="text-[#5f6368] text-xs font-medium leading-relaxed max-w-[200px]">{translations.home.infrastructure_desc}</p>
            <button className="px-8 py-3 rounded-full border border-[#dadce0] text-[10px] font-bold uppercase tracking-widest text-[#5f6368] hover:bg-[#1a73e8] hover:text-white hover:border-[#1a73e8] transition-all duration-300 transform active:scale-95 shadow-sm">{translations.home.apply_api}</button>
          </div>
        </div>
      </section>

      {/* Signature Footer */}
      <footer className="relative mt-24">
        <div className="absolute inset-0 vibrant-mesh -z-10 rounded-[3rem]"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 p-12 md:p-16 pt-24 border-t border-[#f1f3f4]/50">
          <div className="space-y-8 text-left rtl:text-right">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a73e8]/5 border border-[#1a73e8]/10 group cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a73e8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1a73e8]"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a73e8]">Resonance: v2.0 Pro</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-medium text-[#202124] tracking-tighter leading-none">
                UniCal <span className="text-[#9aa0a6]">Calendar</span>
              </h2>
              <p className="text-sm font-medium text-[#5f6368] max-w-md leading-relaxed">
                {translations.home.footer_text}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
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
