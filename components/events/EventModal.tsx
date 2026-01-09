'use client';

import React, { useState, useEffect } from 'react';
import { useEventStore, CalendarEvent } from '@/store/useEventStore';
import { Calendar as CalendarIcon, Clock, AlignLeft, X, Trash2, Save, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
}

export const EventModal = ({ isOpen, onClose, date }: EventModalProps) => {
    const { events, addEvent, updateEvent, deleteEvent } = useEventStore();
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayEvents = events[dateKey] || [];

    const [isEditing, setIsEditing] = useState<string | null>(null); // ID of event being edited
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Reset form when modal opens or date changes
    useEffect(() => {
        setIsEditing(null);
        setTitle('');
        setDescription('');
    }, [isOpen, date]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title.trim()) return;

        if (isEditing) {
            await updateEvent(isEditing, { title, description });
        } else {
            await addEvent({
                title,
                description,
                date: dateKey,
            });
        }
        setIsEditing(null);
        setTitle('');
        setDescription('');
    };

    const handleEdit = (evt: CalendarEvent) => {
        setIsEditing(evt.id);
        setTitle(evt.title);
        setDescription(evt.description || '');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this event?')) {
            await deleteEvent(id, dateKey);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                <div className="bg-[#f8f9fa] border-b border-gray-100 p-6 flex items-center justify-between">
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

                <div className="p-6">
                    {/* Event List */}
                    <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
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
                                        {evt.description && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{evt.description}</p>}
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
                                autoFocus={!!isEditing} // Only autofocus if editing, otherwise it might be annoying on open
                            />
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
