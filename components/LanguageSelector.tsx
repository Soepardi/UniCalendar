'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguageStore } from '@/store/useLanguageStore';
import { Language } from '@/lib/translations/types';

const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'eng', label: 'English', flag: '🇺🇸' },
    { code: 'chn', label: '中文', flag: '🇨🇳' },
    { code: 'idn', label: 'Indonesia', flag: '🇮🇩' },
    { code: 'ara', label: 'العربية', flag: '🇸🇦' },
    { code: 'per', label: 'فارسی', flag: '🇮🇷' },
    { code: 'heb', label: 'עברית', flag: '🇮🇱' },
    { code: 'tha', label: 'ไทย', flag: '🇹🇭' },
    { code: 'jap', label: '日本語', flag: '🇯🇵' },
    { code: 'kor', label: '한국어', flag: '🇰🇷' },
];

export const LanguageSelector = () => {
    const { language, setLanguage } = useLanguageStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const currentLang = languages.find(l => l.code === language) || languages[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#dadce0] hover:bg-[#f8f9fa] transition-all text-sm font-medium text-[#5f6368] shadow-sm"
            >
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.label}</span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#dadce0] overflow-hidden z-50 py-1">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#f1f3f4] transition-colors flex items-center gap-3 ${language === lang.code ? 'bg-[#e8f0fe] text-[#1a73e8] font-medium' : 'text-[#202124]'
                                }`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
