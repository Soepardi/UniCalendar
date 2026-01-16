'use client';

import React, { useState, useEffect } from 'react';
import { useEventStore, CalendarEvent } from '@/store/useEventStore';
import { useTeamStore } from '@/store/useTeamStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Calendar as CalendarIcon, Clock, AlignLeft, X, Trash2, Save, Plus, ChevronDown, Users, Globe, Lock, Share2, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
}

export const EventModal = ({ isOpen, onClose, date }: EventModalProps) => {
    const { events, addEvent, updateEvent, deleteEvent } = useEventStore();
    const { addToast, confirm } = useNotificationStore();
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayEvents = events[dateKey] || [];

    const [isEditing, setIsEditing] = useState<string | null>(null); // ID of event being edited
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [time, setTime] = useState('');
    const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('none');
    const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]); // 0=Sun
    const [teamId, setTeamId] = useState<string | null>(null);
    const [isPublic, setIsPublic] = useState(false);
    const [shareSlug, setShareSlug] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const { teams, currentTeamId } = useTeamStore();

    // Reset form when modal opens or date changes
    useEffect(() => {
        setIsEditing(null);
        setTitle('');
        setDescription('');

        // Auto-fill time if provided in date object
        const hours = date.getHours();
        const minutes = date.getMinutes();
        if (hours !== 0 || minutes !== 0) {
            setTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
        } else {
            setTime('');
        }

        setTeamId(currentTeamId);
        setIsPublic(false);
        setShareSlug(null);
        setCopied(false);
    }, [isOpen, date, currentTeamId]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title.trim()) return;

        if (isEditing) {
            await updateEvent(isEditing, { title, description, time, recurrence: recurrence as any, recurrence_days: recurrenceDays });
            addToast('Event updated', 'success');
        } else {
            await addEvent({
                title,
                description,
                date: dateKey,
                time,
                recurrence: recurrence as any,
                recurrence_days: recurrenceDays,
                team_id: teamId,
                is_public: isPublic
            });
            addToast('Event created', 'success');
        }
        setIsEditing(null);
        setTitle('');
        setDescription('');
        setTime('');
        setRecurrence('none');
        setRecurrenceDays([]);
        onClose();
    };

    const handleEdit = (evt: CalendarEvent) => {
        setIsEditing(evt.id);
        setTitle(evt.title);
        setDescription(evt.description || '');
        setTime(evt.time || '');
        setRecurrence(evt.recurrence || 'none');
        setRecurrenceDays(evt.recurrence_days || []);
        setTeamId(evt.team_id || null);
        setIsPublic(evt.is_public || false);
        setShareSlug(evt.share_slug || null);
    };

    const handleDelete = (id: string) => {
        confirm({
            title: 'Delete Event',
            message: 'Are you sure you want to delete this event? This action cannot be undone.',
            confirmText: 'Delete',
            type: 'danger',
            onConfirm: async () => {
                await deleteEvent(id, dateKey);
                addToast('Event deleted', 'success');
            }
        });
    };

    // Helper for sliders
    const handleTimeChange = (type: 'hour' | 'minute', val: number) => {
        let [h, m] = (time || '12:00').split(':').map(Number);
        if (isNaN(h)) h = 12;
        if (isNaN(m)) m = 0;

        if (type === 'hour') h = val;
        if (type === 'minute') m = val;

        setTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    };

    const getHour = () => time ? parseInt(time.split(':')[0]) : 12;
    const getMinute = () => time ? parseInt(time.split(':')[1]) : 0;



    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 max-h-[85vh] flex flex-col">
                {/* Header ... */}
                <div className="bg-[#f8f9fa] border-b border-gray-100 p-6 flex flex-shrink-0 items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <CalendarIcon size={20} className="text-[#1a73e8]" />
                            {format(date, 'MMMM d, yyyy')}
                        </h2>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
                            Your Personal Schedule
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200/50 transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {/* Event List ... */}
                    <div className="space-y-3 mb-8">
                        {dayEvents.length === 0 && !isEditing && (
                            <div className="text-center py-8 text-gray-400">
                                <Clock size={48} className="mx-auto mb-3 opacity-20" />
                                <p>No events scheduled for this day.</p>
                            </div>
                        )}

                        {dayEvents.map(evt => (
                            <div
                                key={evt.id}
                                className={`group p-4 rounded-2xl border transition-all ${isEditing === evt.id ? 'bg-[#e8f0fe] border-[#1a73e8]' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-base ${isEditing === evt.id ? 'text-[#1a73e8]' : 'text-gray-900'}`}>{evt.title}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {evt.time && (
                                                <span className="text-xs font-bold text-[#1a73e8] bg-[#e8f0fe] px-1.5 py-0.5 rounded">
                                                    {evt.time}
                                                </span>
                                            )}
                                            {evt.team_id && (
                                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <Users size={10} />
                                                    {teams.find(t => t.id === evt.team_id)?.name || 'Team'}
                                                </span>
                                            )}
                                            {evt.is_public && (
                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <Globe size={10} />
                                                    Public
                                                </span>
                                            )}
                                            {evt.description && <p className="text-sm text-gray-500 leading-relaxed max-w-[200px] truncate">{evt.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(evt)}
                                            disabled={isEditing !== null}
                                            className="p-2 text-gray-400 hover:text-[#1a73e8] hover:bg-[#1a73e8]/10 rounded-xl transition-all disabled:opacity-30"
                                        >
                                            <AlignLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(evt.id)}
                                            disabled={isEditing !== null}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add/Edit Form */}
                    <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                {isEditing ? 'Editing Event' : 'New Event'}
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Event title (e.g., Team Meeting)"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 ring-[#1a73e8]/20 focus:border-[#1a73e8] outline-none transition-all font-medium"
                                autoFocus={!!isEditing}
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                    Time
                                </label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 ring-[#1a73e8]/20 focus:border-[#1a73e8] outline-none transition-all font-bold text-gray-700 [&::-webkit-calendar-picker-indicator]:hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowTimePicker(!showTimePicker)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a73e8] p-1"
                                    >
                                        <Clock size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Time Picker Columns (Collapsible) */}
                            {showTimePicker && (
                                <div className="flex gap-4 h-48 animate-in slide-in-from-top-2 duration-200">
                                    {/* Hours Column */}
                                    <div className="flex-1 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
                                        <div className="bg-gray-50 border-b border-gray-100 py-1 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Hour
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                            {Array.from({ length: 24 }, (_, i) => i).map(h => (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    onClick={() => {
                                                        handleTimeChange('hour', h);
                                                        // Optional: keep open or auto-close? User implied "ability to show", so manual toggle is safer.
                                                    }}
                                                    className={`w-full py-2 text-sm font-medium rounded-lg transition-colors mb-1 ${getHour() === h
                                                        ? 'bg-[#1a73e8] text-white shadow-sm'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {h.toString().padStart(2, '0')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="flex items-center justify-center text-gray-300 font-bold text-xl pb-6">
                                        :
                                    </div>

                                    {/* Minutes Column */}
                                    <div className="flex-1 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
                                        <div className="bg-gray-50 border-b border-gray-100 py-1 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Minute
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                                            {Array.from({ length: 12 }, (_, i) => i * 5).map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => handleTimeChange('minute', m)}
                                                    className={`w-full py-2 text-sm font-medium rounded-lg transition-colors mb-1 ${getMinute() === m
                                                        ? 'bg-[#1a73e8] text-white shadow-sm'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {m.toString().padStart(2, '0')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recurrence Selector */}
                        <div className="space-y-3 pt-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                    Repeat
                                </label>
                                <div className="relative">
                                    <select
                                        value={recurrence}
                                        onChange={(e) => setRecurrence(e.target.value as any)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 ring-[#1a73e8]/20 focus:border-[#1a73e8] outline-none transition-all font-medium appearance-none"
                                    >
                                        <option value="none">Does not repeat</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly on {format(date, 'EEEE')}</option>
                                        <option value="monthly">Monthly on the {format(date, 'do')}</option>
                                        <option value="yearly">Yearly on {format(date, 'MMMM do')}</option>
                                        <option value="custom">Custom...</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Custom Days Selector */}
                            {recurrence === 'custom' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                        Repeat on
                                    </label>
                                    <div className="flex justify-between gap-1">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                                            const isSelected = recurrenceDays.includes(idx);
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setRecurrenceDays(recurrenceDays.filter(d => d !== idx));
                                                        } else {
                                                            setRecurrenceDays([...recurrenceDays, idx]);
                                                        }
                                                    }}
                                                    className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${isSelected
                                                        ? 'bg-[#1a73e8] text-white shadow-md scale-10-5'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Description (optional)"
                                rows={2}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 ring-[#1a73e8]/20 focus:border-[#1a73e8] outline-none transition-all resize-none font-medium text-sm"
                            />
                        </div>

                        {/* Team & Visibility Selection */}
                        <div className="flex gap-3">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Assign to</label>
                                <div className="relative">
                                    <select
                                        value={teamId || 'personal'}
                                        onChange={(e) => setTeamId(e.target.value === 'personal' ? null : e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 ring-[#1a73e8]/20 focus:border-[#1a73e8] outline-none transition-all font-medium appearance-none text-sm"
                                    >
                                        <option value="personal">Personal Schedule</option>
                                        {teams.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                </div>
                            </div>
                            <div className="w-32 space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Visibility</label>
                                <button
                                    onClick={() => setIsPublic(!isPublic)}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${isPublic ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-600'}`}
                                >
                                    {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                                    {isPublic ? 'Public' : 'Private'}
                                </button>
                            </div>
                        </div>

                        {isPublic && isEditing && shareSlug && (
                            <div className="mt-2 p-4 bg-green-50 border border-green-100 rounded-2xl animate-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-green-600 uppercase tracking-widest block mb-2">Public Share Link</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-white border border-green-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-500 truncate">
                                        {typeof window !== 'undefined' ? `${window.location.origin}/share?s=${shareSlug}` : ''}
                                    </div>
                                    <button
                                        onClick={() => {
                                            const url = `${window.location.origin}/share?s=${shareSlug}`;
                                            navigator.clipboard.writeText(url);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className={`p-2 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white border border-green-200 text-green-600 hover:bg-green-50'}`}
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={!title.trim()}
                                className="flex-1 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={16} />
                                {isEditing ? 'Update Event' : 'Add Event'}
                            </button>
                            {isEditing && (
                                <button
                                    onClick={() => {
                                        setIsEditing(null);
                                        setTitle('');
                                        setDescription('');
                                        setTime('');
                                    }}
                                    className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm transition-all"
                                >
                                    Cancel
                                </button>
                            )}



                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
