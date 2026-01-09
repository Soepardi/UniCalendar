'use client';

import React from 'react';
import { AuthModal } from './AuthModal';
import { useAuthStore } from '@/store/useAuthStore';

export const AuthModalWrapper = () => {
    const { isAuthModalOpen, closeAuthModal } = useAuthStore();
    return <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />;
};
