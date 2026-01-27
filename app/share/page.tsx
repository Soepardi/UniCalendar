'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Globe, Loader2, AlertCircle } from 'lucide-react';

function SharedEventContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('s');

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSharedEvent() {
            if (!slug) {
                setError('No event specified.');
                setLoading(false);
                return;
            }

            setLoading(true);

            // Use Secure RPC to fetch shared event (Direct Select is blocked by RLS for non-team members)
            const { data, error } = await supabase
                .rpc('get_shared_event', { slug_param: slug });

            if (error || !data || (Array.isArray(data) && data.length === 0)) {
                setError('Event not found or is no longer public.');
            } else {
                // RPC returns an array, take the first item
                setEvent(Array.isArray(data) ? data[0] : data);
            }
            setLoading(false);
        }

        fetchSharedEvent();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading shared event...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Unavailable</h1>
                    <p className="text-gray-500 mb-8">{error}</p>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                    >
                        Go to Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-6">
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-500/5 overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Globe size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                <Globe size={12} />
                                Publicly Shared Event
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight mb-2">
                                {event.title}
                            </h1>
                            <div className="flex items-center gap-3 text-white/80 font-medium text-sm">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={16} />
                                    {format(parseISO(event.date), 'EEEE, MMMM do, yyyy')}
                                </span>
                                {event.time && (
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={16} />
                                        {event.time}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {event.description && (
                            <div className="mb-8">
                                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Description</h2>
                                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                                    {event.description}
                                </p>
                            </div>
                        )}

                        <div className="h-px bg-gray-100 w-full mb-8"></div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-indigo-600 font-bold border border-gray-200">
                                    {(event.user_profile?.username?.[0] || '?').toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Organized by</p>
                                    <p className="text-sm font-bold text-gray-900">{event.user_profile?.full_name || event.user_profile?.username || 'Aggregator User'}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform</p>
                                <p className="text-sm font-black text-indigo-600">UniCal</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 border-t border-gray-100 p-6 text-center">
                        <p className="text-xs text-gray-400 font-bold">
                            Plan your own events at <span className="text-indigo-600">unical.app</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PublicSharePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        }>
            <SharedEventContent />
        </Suspense>
    );
}
