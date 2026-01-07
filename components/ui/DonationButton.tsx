'use client';

import { useLanguageStore } from '@/store/useLanguageStore';

export const DonationButton = () => {
    const { translations } = useLanguageStore();
    return (
        <a
            href="https://ko-fi.com/supardiakhiyat" // Placeholder
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold py-2 px-4 rounded-lg shadow-sm transition-transform hover:scale-105"
        >
            <span className="text-xl">☕</span>
            <span className="hidden md:inline">{translations.common.buy_me_coffee}</span>
        </a>
    );
};
