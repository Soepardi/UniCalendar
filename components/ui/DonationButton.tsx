'use client';

import React from 'react';

export const DonationButton = () => {
    return (
        <a
            href="https://www.buymeacoffee.com/yourhandle" // Placeholder
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold py-2 px-4 rounded-lg shadow-sm transition-transform hover:scale-105"
        >
            <span className="text-xl">☕</span>
            <span>Buy me a coffee</span>
        </a>
    );
};
