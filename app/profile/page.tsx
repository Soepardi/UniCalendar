'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    User, Lock, Loader2, Save, Calendar as CalendarIcon, Trash2, Edit2, Plus,
    Search, Inbox, CalendarDays, Grip, MoreHorizontal, Hash, HelpCircle,
    Bell, Layout, CheckCircle2, Circle, Menu, X, Settings,
    ChevronLeft, ChevronRight, Calendar as CalendarIconLucide,
    Download, Globe, Monitor, Moon, Sun, ChevronDown, LogOut, RefreshCw,
    Users, UserPlus, Share2, ListTodo, Library, Check
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useEventStore } from '@/store/useEventStore';
import { useRouter } from 'next/navigation';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, addMonths, isSameDay, startOfWeek, endOfWeek, addDays, subDays, parseISO, isAfter, startOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import dynamic from 'next/dynamic';

// Components
import { EventModal } from '@/components/events/EventModal';
import { SettingsView } from '@/components/profile/SettingsView';
import { DayView } from '@/components/DayView';
import { MyCalendarsView } from '@/components/profile/MyCalendarsView';
const DownloadButton = dynamic(
    () => import('@/components/DownloadButton').then((mod) => mod.DownloadButton),
    { ssr: false }
);
import { TeamManagement } from '@/components/teams/TeamManagement';
import { CreateTeamModal } from '@/components/teams/CreateTeamModal';

// Stores & Utils
import { useCalendarStore } from '@/store/useCalendarStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTeamStore } from '@/store/useTeamStore';
import { CalendarType, convertDate, toNativeNumerals, CALENDAR_META } from '@/lib/calendars';

// Dynamic Imports


const CalendarGrid = dynamic(() => import('@/components/CalendarGrid').then(mod => mod.CalendarGrid), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-50 rounded-2xl animate-pulse"></div>
});

export default function DashboardPage() {
    const { user, profile, initialize: initAuth } = useAuthStore();
    const {
        events, fetchEvents,
        deleteEvent: deleteEventAction,
        archiveEvent: archiveEventAction,
        initialized: eventsInitialized
    } = useEventStore();
    const {
        teams, fetchTeams, currentTeamId, setCurrentTeamId,
        initialized: teamsInitialized
    } = useTeamStore();
    const { getLocale } = useLanguageStore();
    const router = useRouter();

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('Today');
    const [isCalendarsExpanded, setIsCalendarsExpanded] = useState(true);
    const [isTeamsExpanded, setIsTeamsExpanded] = useState(true);

    // Calendar Store Integration
    const {
        currentDate, setDate, selectedCalendars, toggleCalendar,
        showNativeScript, toggleNativeScript, viewMode, setViewMode
    } = useCalendarStore();
    const { translations } = useLanguageStore();

    // Event Editing
    const [editingEventDate, setEditingEventDate] = useState<Date | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [recurrenceModal, setRecurrenceModal] = useState<{
        isOpen: boolean;
        type: 'archive' | 'delete';
        eventId: string;
        date: string;
    } | null>(null);
    const [upcomingFilter, setUpcomingFilter] = useState<'today' | 'month'>('month');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State for Tasks View
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [upcomingPage, setUpcomingPage] = useState(1);
    const [finishedPage, setFinishedPage] = useState(1);
    const [managingTeamId, setManagingTeamId] = useState<string | null>(null);
    const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);

    // Sync activeTab with global viewMode
    useEffect(() => {
        if (viewMode === 'day') setActiveTab('Today');
        if (viewMode === 'month') setActiveTab('Month');
    }, [viewMode]);

    // Calendar Type Dropdown State
    const [isCalendarDropdownOpen, setIsCalendarDropdownOpen] = useState(false);
    // Profile Dropdown State
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    // Responsive Sidebar init
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        // Set initial state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Initialize Auth
    useEffect(() => {
        initAuth();
        fetchTeams();
    }, [initAuth, fetchTeams]);

    // Handle Hydration Mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch Events (Restored)
    useEffect(() => {
        if (user && !eventsInitialized) {
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            const end = new Date();
            end.setMonth(end.getMonth() + 3); // Load only 4 months initially
            fetchEvents(start, end);
        }
    }, [user, eventsInitialized, fetchEvents]);

    // Filter Events based on Active Tab & Selected Team
    const today = new Date();
    const allEvents = React.useMemo(() => {
        return Object.entries(events)
            .flatMap(([key, dayEvents]) => dayEvents.map((event: any) => {
                const dateStr = event.time ? `${key}T${event.time}:00` : (event.dateStr || key);
                return { ...event, dateStr };
            }))
            .filter((event: any) => {
                if (currentTeamId) {
                    return event.team_id === currentTeamId;
                } else {
                    return !event.team_id;
                }
            })
            .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime()); // Fixed sort b.dateStr
    }, [events, currentTeamId]);

    // Wrap store actions to handle recurrence choice
    const handleArchive = (id: string, date: string) => {
        const event = allEvents.find(e => e.id === id);
        if (event?.recurrence && event.recurrence !== 'none') {
            setRecurrenceModal({ isOpen: true, type: 'archive', eventId: id, date });
        } else {
            archiveEventAction(id, date, 'all');
        }
    };

    const handleDelete = (id: string, date: string) => {
        const event = allEvents.find(e => e.id === id);
        if (event?.recurrence && event.recurrence !== 'none') {
            setRecurrenceModal({ isOpen: true, type: 'delete', eventId: id, date });
        } else {
            deleteEventAction(id, date, 'all');
        }
    };

    const todayEventsCount = React.useMemo(() =>
        allEvents.filter(e => isSameDay(parseISO(e.dateStr), new Date())).length,
        [allEvents]);

    const currentMonthEventsCount = React.useMemo(() =>
        allEvents.filter(e => {
            const d = parseISO(e.dateStr);
            return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
        }).length,
        [allEvents]);

    const filteredEvents = React.useMemo(() => {
        const today = new Date();
        return allEvents.filter(event => {
            const eventDate = parseISO(event.dateStr);
            if (activeTab === 'Today') {
                return isSameDay(eventDate, today);
            }
            return true; // Inbox/All/Tasks
        });
    }, [allEvents, activeTab]);

    const overdueEvents = React.useMemo(() => {
        const today = new Date();
        return allEvents.filter(event => {
            const eventDate = parseISO(event.dateStr);
            return isAfter(today, eventDate) && !isSameDay(eventDate, today);
        });
    }, [allEvents]);



    return (
        <div className="flex h-screen bg-white overflow-hidden relative">
            {/* Modals */}
            {managingTeamId && (
                <TeamManagement
                    teamId={managingTeamId}
                    onClose={() => setManagingTeamId(null)}
                />
            )}
            {isCreateTeamModalOpen && (
                <CreateTeamModal
                    isOpen={isCreateTeamModalOpen}
                    onClose={() => setIsCreateTeamModalOpen(false)}
                />
            )}
            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                date={editingEventDate || new Date()}
            />

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed md:relative inset-y-0 left-0 z-50
                    ${isSidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0 md:w-0'} 
                    bg-[#fafafa] flex-shrink-0 transition-all duration-300 ease-in-out border-r border-transparent overflow-hidden shadow-xl md:shadow-none
                `}
            >
                <div className="w-[280px] flex flex-col h-full pt-6 pl-6 pr-4 overflow-y-auto custom-scrollbar pb-6">
                    {/* Logo & Close Button for Mobile */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8">
                                <img
                                    src="/logo.png"
                                    alt="UniCal Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-base font-black text-zinc-900 tracking-tighter leading-none">
                                    UniCal
                                </h1>
                                <p className="text-[8px] font-bold text-indigo-600/60 uppercase tracking-widest leading-none mt-0.5">World Calendar</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-1 hover:bg-gray-200 rounded-md md:hidden text-gray-500"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <button
                            onClick={() => { setEditingEventDate(new Date()); setIsEventModalOpen(true); }}
                            className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-gray-700 hover:bg-[#eee] rounded-md mb-4 text-sm font-medium group"
                        >
                            <div className="w-6 h-6 rounded-full bg-[#1a73e8] flex items-center justify-center text-white shadow-sm transition-colors group-hover:bg-[#1557b0]">
                                <Plus size={16} strokeWidth={2.5} />
                            </div>
                            <span className="text-[#1a73e8] font-bold group-hover:text-[#1557b0]">Add task</span>
                        </button>

                        <SidebarItem
                            icon={Search}
                            label="Search"
                            onClick={() => { setActiveTab('Search'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                            active={activeTab === 'Search'}
                        />
                        <SidebarItem icon={CalendarDays} label="Today" count={todayEventsCount} onClick={() => { setActiveTab('Today'); setViewMode('day'); if (window.innerWidth < 768) setIsSidebarOpen(false); }} active={activeTab === 'Today'} />
                        <SidebarItem icon={CalendarDays} label="Month" count={currentMonthEventsCount} onClick={() => { setActiveTab('Month'); setViewMode('month'); if (window.innerWidth < 768) setIsSidebarOpen(false); }} active={activeTab === 'Month'} />
                        <SidebarItem icon={ListTodo} label="Tasks" onClick={() => { setActiveTab('Tasks'); if (window.innerWidth < 768) setIsSidebarOpen(false); }} active={activeTab === 'Tasks'} />
                        <SidebarItem icon={Library} label="My Calendars" onClick={() => { setActiveTab('MyCalendars'); if (window.innerWidth < 768) setIsSidebarOpen(false); }} active={activeTab === 'MyCalendars'} />
                    </div>

                    {/* Teams Section */}
                    <div className="mt-8">
                        <button
                            onClick={() => setIsTeamsExpanded(!isTeamsExpanded)}
                            className="flex items-center justify-between w-full px-2 py-1 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-gray-900 transition-colors group"
                        >
                            <span className="flex items-center gap-2">
                                <Users size={12} />
                                Teams
                            </span>
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isTeamsExpanded ? '' : '-rotate-90'}`} />
                        </button>

                        {isTeamsExpanded && (
                            <div className="mt-2 space-y-0.5">
                                <button
                                    onClick={() => setCurrentTeamId(null)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${!currentTeamId ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${!currentTeamId ? 'bg-[#1a73e8]' : 'bg-gray-300'}`} />
                                    Personal
                                </button>

                                {teams.map(team => (
                                    <div
                                        key={team.id}
                                        onClick={() => setCurrentTeamId(team.id)}
                                        className={`group relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${currentTeamId === team.id ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <div className="flex items-center gap-3 truncate">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${currentTeamId === team.id ? 'bg-[#1a73e8]' : 'bg-gray-400 opacity-50'}`} />
                                            <span className="truncate">{team.name}</span>
                                        </div>
                                        {(team.owner_id === user?.id) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setManagingTeamId(team.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/50 rounded transition-all text-gray-400 hover:text-gray-600"
                                            >
                                                <Settings size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <button
                                    onClick={() => setIsCreateTeamModalOpen(true)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all dashed border border-dashed border-gray-200 mt-2"
                                >
                                    <Plus size={14} />
                                    <span>Create Team</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Calendars Section in Sidebar (Collapsible) */}


                    <div className="mt-auto pt-8 relative">
                        <button
                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                            className="flex items-center justify-between w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl transition-colors group"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 group-hover:bg-[#e8f0fe] group-hover:text-[#1a73e8] transition-colors">
                                    <User size={16} />
                                </div>
                                <div className="text-left truncate max-w-[140px]">
                                    <span className="block font-semibold leading-none truncate">
                                        {profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Profile'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 truncate block">
                                        {user?.email}
                                    </span>
                                </div>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProfileDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsProfileDropdownOpen(false)}></div>
                                <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                    <button
                                        onClick={() => {
                                            setActiveTab('Settings');
                                            setIsProfileDropdownOpen(false);
                                            if (window.innerWidth < 768) setIsSidebarOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50"
                                    >
                                        <Settings size={16} className="text-gray-500" />
                                        Settings
                                    </button>
                                    <button
                                        onClick={async () => {
                                            await useAuthStore.getState().signOut();
                                            router.push('/');
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Log Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 md:px-6 py-2 bg-white selection:bg-[#d2e3fc] selection:text-[#185abc] w-full">
                <div className="w-full mx-auto">
                    {/* New Dashboard Calendar Header */}
                    {/* Compact Header Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pt-2 relative z-30 gap-4 md:gap-0">
                        <div className="flex items-center gap-2 md:gap-4 justify-between md:justify-start w-full md:w-auto">
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="flex items-center gap-4">
                                    <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors">
                                        {isSidebarOpen ? <Layout size={20} /> : <Menu size={20} />}
                                    </button>

                                    <h1 className="text-xl md:text-2xl font-bold text-[#202124] leading-none truncate">
                                        {activeTab === 'MyCalendars' ? 'My Calendars' : activeTab}
                                    </h1>
                                </div>

                                <div className="hidden md:block h-6 w-px bg-gray-200 mx-2"></div>

                                {/* Date Navigation - Hide for My Calendars, Settings, and Tasks */}
                                {activeTab !== 'MyCalendars' && activeTab !== 'Settings' && activeTab !== 'Tasks' && (
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex items-center bg-transparent hover:bg-gray-100 rounded-xl px-2 py-1 transition-colors cursor-pointer gap-2 text-gray-700">
                                            {/* Native Date Picker Overlay */}
                                            <input
                                                type="date"
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                                style={{ opacity: 0 }}
                                                value={format(currentDate, 'yyyy-MM-dd')}
                                                onClick={(e) => {
                                                    try {
                                                        e.currentTarget.showPicker();
                                                    } catch (err) {
                                                        // Fallback
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        const newDate = parseISO(e.target.value);
                                                        setDate(newDate);
                                                    }
                                                }}
                                            />
                                            <span className="text-sm font-semibold pointer-events-none">{format(currentDate, 'MMMM yyyy')}</span>
                                            <ChevronDown size={14} className="text-gray-400 pointer-events-none" />
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500 bg-gray-50 rounded-xl p-0.5 border border-gray-100">
                                            <button className="p-1 hover:bg-white hover:shadow-sm rounded-xl transition-all" onClick={() => setDate(activeTab === 'Month' ? addMonths(currentDate, -1) : addDays(currentDate, -1))}>
                                                <ChevronLeft size={16} />
                                            </button>
                                            <button
                                                className="text-xs font-semibold px-2 py-1 hover:bg-white hover:shadow-sm rounded-xl transition-all text-gray-600"
                                                onClick={() => setDate(new Date())}
                                            >
                                                Today
                                            </button>
                                            <button className="p-1 hover:bg-white hover:shadow-sm rounded-xl transition-all" onClick={() => setDate(activeTab === 'Month' ? addMonths(currentDate, 1) : addDays(currentDate, 1))}>
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Tasks View Filters */}
                            {activeTab === 'Tasks' && (
                                <>
                                    <div className="flex bg-gray-100 p-0.5 rounded-xl mr-2">
                                        <button
                                            onClick={() => setUpcomingFilter('today')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${upcomingFilter === 'today' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Today
                                        </button>
                                        <button
                                            onClick={() => setUpcomingFilter('month')}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${upcomingFilter === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            This Month
                                        </button>
                                    </div>
                                    <div className="h-4 w-px bg-gray-200"></div>

                                    {/* Rows Per Page Selector */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Show:</span>
                                        <select
                                            value={rowsPerPage}
                                            onChange={(e) => {
                                                setRowsPerPage(Number(e.target.value));
                                                setUpcomingPage(1);
                                                setFinishedPage(1);
                                            }}
                                            className="bg-gray-100 border-none rounded-xl py-1 pl-2 pr-6 text-xs font-semibold focus:ring-1 focus:ring-gray-300 cursor-pointer"
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                    <div className="h-4 w-px bg-gray-200"></div>
                                </>
                            )}

                            {/* Calendar Type Selector & Native Script - Hide for My Calendars */}
                            {activeTab === 'Month' && (
                                <div className="flex items-center gap-3">
                                    {/* Calendar Type Selector (Always Visible except MyCalendars) */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsCalendarDropdownOpen(!isCalendarDropdownOpen)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                        >
                                            <CalendarIcon size={14} className="text-gray-500" />
                                            <span className="hidden md:inline">Calendars</span>
                                            <ChevronDown size={12} className="text-gray-400" />
                                        </button>

                                        {isCalendarDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setIsCalendarDropdownOpen(false)}></div>
                                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 p-2 animate-in fade-in slide-in-from-top-2">
                                                    <div className="px-2 py-1.5 mb-1 border-b border-gray-100">
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Calendars</span>
                                                    </div>
                                                    <div className="max-h-[300px] overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-gray-200">
                                                        {Object.entries(CALENDAR_META).map(([calId, meta]) => (
                                                            <button
                                                                key={calId}
                                                                onClick={() => {
                                                                    toggleCalendar(calId as CalendarType);
                                                                }}
                                                                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm transition-all group ${selectedCalendars.includes(calId as CalendarType) ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'text-gray-600 hover:bg-[#f8f9fa]'}`}
                                                            >
                                                                <div className="flex flex-col text-left">
                                                                    <div className="font-bold leading-tight">
                                                                        {translations?.calendar_names[calId as CalendarType] || meta.name}
                                                                    </div>
                                                                    <div className="text-[10px] opacity-70 font-medium">
                                                                        {meta.description}
                                                                    </div>
                                                                </div>
                                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${selectedCalendars.includes(calId as CalendarType) ? 'border-[#1a73e8] bg-[#1a73e8]' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                                                                    {selectedCalendars.includes(calId as CalendarType) && <Check size={10} strokeWidth={4} className="text-white" />}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-gray-100 px-2 flex justify-end">
                                                        <button
                                                            onClick={() => setIsCalendarDropdownOpen(false)}
                                                            className="text-xs font-bold text-[#1a73e8] hover:underline px-2 py-1"
                                                        >
                                                            Done
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="h-4 w-px bg-gray-200"></div>

                                    <button
                                        onClick={toggleNativeScript}
                                        title="Toggle Native Script"
                                        className={`p-2 rounded-xl transition-all border ${showNativeScript ? 'bg-[#1a73e8]/10 border-[#1a73e8] text-[#1a73e8]' : 'bg-white border-transparent hover:bg-gray-50 text-gray-500'}`}
                                    >
                                        <Globe size={18} />
                                    </button>

                                    <div className="h-4 w-px bg-gray-200"></div>
                                    <DownloadButton />
                                </div>
                            )}
                        </div>
                    </div>





                    {/* Main Content Area: List vs Grid */}
                    {activeTab === 'Settings' ? (
                        <div className="mt-4">
                            <SettingsView />
                        </div>
                    ) : activeTab === 'MyCalendars' ? (
                        <div className="-mx-6 -my-2">
                            <MyCalendarsView />
                        </div>
                    ) : activeTab === 'Month' ? (
                        <div className="mt-4">
                            {/* Dynamic Native Header */}
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 px-4 uppercase">
                                {(() => {
                                    const primaryCalendarId = selectedCalendars.length > 0 ? selectedCalendars[0] : 'gregorian';
                                    const primaryCurrentData = convertDate(currentDate, primaryCalendarId as CalendarType, { locale: getLocale() });

                                    if (showNativeScript && primaryCurrentData.monthNative) {
                                        return (
                                            <>
                                                {primaryCurrentData.monthNative} {primaryCurrentData.yearNative || toNativeNumerals(parseInt(primaryCurrentData.year.toString()), primaryCalendarId as CalendarType)}
                                                <span className="ml-3 text-lg text-gray-400 font-medium normal-case">
                                                    {primaryCurrentData.month} {primaryCurrentData.year}
                                                </span>
                                            </>
                                        );
                                    }
                                    return `${primaryCurrentData.month} ${primaryCurrentData.year}`;
                                })()}
                            </h2>
                            <CalendarGrid headless={true} />
                        </div>
                    ) : activeTab === 'Today' ? (
                        <div className="mt-0 h-[calc(100vh-140px)] flex flex-col">
                            {/* 7-Day Context Strip */}
                            <div className="flex border-b border-gray-100 bg-gray-50/50 mb-0 overflow-x-auto hide-scrollbar">
                                {(() => {
                                    // Generate 7-day window centered on selected date (or -3 days start)
                                    // Let's keep the same logic: start = date - 3 days
                                    const start = addDays(currentDate, -3);
                                    const daysWindow = Array.from({ length: 7 }, (_, i) => addDays(start, i));

                                    // Render Header Strip
                                    return (
                                        <>
                                            <div className="w-16 flex-shrink-0 bg-white/50 border-r border-gray-100"></div>
                                            {daysWindow.map((day, i) => {
                                                const isSelected = isSameDay(day, currentDate);
                                                const isToday = isSameDay(day, new Date());
                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => setDate(day)}
                                                        className={`flex-1 min-w-[100px] flex flex-col items-center justify-center py-3 border-b-2 cursor-pointer transition-colors ${isSelected ? 'border-violet-500 bg-violet-50' : 'border-transparent hover:bg-gray-100'}`}
                                                    >
                                                        <span className={`text-xs font-medium mb-0.5 ${isSelected ? 'text-violet-600' : 'text-gray-500'}`}>{format(day, 'EEE')}</span>
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${isSelected && !isToday
                                                            ? 'bg-transparent border-2 border-violet-500 text-violet-600'
                                                            : isToday
                                                                ? 'bg-[#1a73e8] text-white'
                                                                : 'text-gray-900 group-hover:bg-gray-200'
                                                            }`}>
                                                            {format(day, 'd')}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <DayView
                                    date={currentDate} // Keep for legacy/highlight logic
                                    days={Array.from({ length: 7 }, (_, i) => addDays(addDays(currentDate, -3), i))}
                                    events={allEvents}
                                    onEventClick={(event) => {
                                        // Fix: ensure date object is valid before setting
                                        const d = parseISO(event.dateStr);
                                        if (!isNaN(d.getTime())) {
                                            setEditingEventDate(d);
                                            setIsEventModalOpen(true);
                                        }
                                    }}
                                    onTimeSlotClick={(date) => { setEditingEventDate(date); setIsEventModalOpen(true); }}
                                />
                            </div>
                        </div>
                    ) : activeTab === 'Search' ? (
                        <div className="max-w-2xl mx-auto mt-4">
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-4">
                                {searchQuery ? (
                                    allEvents
                                        .filter(event =>
                                            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            event.description?.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map(event => (
                                            <TaskItem
                                                key={`${event.id}-${event.dateStr}`}
                                                event={event}
                                                onEdit={() => { setEditingEventDate(parseISO(event.dateStr)); setIsEventModalOpen(true); }}
                                                onDelete={() => handleDelete(event.id, event.dateStr)}
                                                onArchive={() => handleArchive(event.id, event.dateStr)}
                                            />
                                        ))
                                ) : (
                                    <div className="text-center text-gray-400 py-12">
                                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>Type to search your events</p>
                                    </div>
                                )}
                                {searchQuery && allEvents.filter(event => event.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                    <div className="text-center text-gray-400 py-8">
                                        <p>No events found matching "{searchQuery}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : activeTab === 'Tasks' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 mx-1 h-[calc(100vh-140px)]">
                            {/* Upcoming Tasks Table */}
                            <div className="flex flex-col h-full">
                                <h3 className="text-lg font-bold text-gray-800 mb-3 px-1 sticky top-0 bg-white z-10 py-2">
                                    Upcoming Tasks
                                    <span className="text-xs font-normal text-gray-400 ml-2">
                                        ({upcomingFilter === 'today' ? 'Today' : 'This Month'})
                                    </span>
                                </h3>
                                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                                    {(() => {
                                        const filteredUpcoming = allEvents.filter(e => {
                                            const d = parseISO(e.dateStr);
                                            const now = new Date();
                                            const isPending = e.status !== 'archived' && e.status !== 'completed';
                                            if (!isPending) return false;
                                            if (upcomingFilter === 'today') return isSameDay(d, now);
                                            return isSameMonth(d, now) && d.getFullYear() === now.getFullYear() && (isAfter(d, now) || isSameDay(d, now));
                                        });

                                        const totalPages = Math.ceil(filteredUpcoming.length / rowsPerPage);
                                        const paginatedEvents = filteredUpcoming
                                            .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime())
                                            .slice((upcomingPage - 1) * rowsPerPage, upcomingPage * rowsPerPage);

                                        return (
                                            <>
                                                <div className="flex-1 overflow-y-auto">
                                                    {paginatedEvents.length > 0 ? (
                                                        <div className="divide-y divide-gray-100">
                                                            {paginatedEvents.map(event => (
                                                                <div key={`${event.id}-${event.dateStr}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleArchive(event.id, event.dateStr); }}
                                                                        className="text-gray-300 hover:text-green-500 transition-colors"
                                                                    >
                                                                        <Circle size={20} />
                                                                    </button>
                                                                    <div className="flex-1 cursor-pointer" onClick={() => { setEditingEventDate(parseISO(event.dateStr)); setIsEventModalOpen(true); }}>
                                                                        <div className="font-medium text-gray-900">{event.title}</div>
                                                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                                            <span className="flex items-center gap-1">
                                                                                <CalendarIconLucide size={12} />
                                                                                {format(parseISO(event.dateStr), 'MMM d, yyyy')}
                                                                            </span>
                                                                            {event.time && <span>• {event.time}</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-md whitespace-nowrap">
                                                                        Pending
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-8 text-center text-gray-400 text-sm">
                                                            No pending tasks for {upcomingFilter}.
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Pagination Controls */}
                                                {filteredUpcoming.length > 0 && (
                                                    <div className="p-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
                                                        <span>
                                                            Showing {(upcomingPage - 1) * rowsPerPage + 1}-
                                                            {Math.min(upcomingPage * rowsPerPage, filteredUpcoming.length)} of {filteredUpcoming.length}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => setUpcomingPage(p => Math.max(1, p - 1))}
                                                                disabled={upcomingPage === 1}
                                                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                                                            >
                                                                <ChevronLeft size={16} />
                                                            </button>
                                                            <span className="min-w-[3rem] text-center">Page {upcomingPage}</span>
                                                            <button
                                                                onClick={() => setUpcomingPage(p => Math.min(totalPages, p + 1))}
                                                                disabled={upcomingPage === totalPages}
                                                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                                                            >
                                                                <ChevronRight size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Finished Tasks Table */}
                            <div className="flex flex-col h-full">
                                <h3 className="text-lg font-bold text-gray-800 mb-3 px-1 sticky top-0 bg-white z-10 py-2">
                                    Finished Tasks
                                    <span className="text-xs font-normal text-gray-400 ml-2">
                                        ({upcomingFilter === 'today' ? 'Today' : 'This Month'})
                                    </span>
                                </h3>
                                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                                    {(() => {
                                        const filteredFinished = allEvents.filter(e => {
                                            const d = parseISO(e.dateStr);
                                            const now = new Date();
                                            const isFinished = e.status === 'archived' || e.status === 'completed';
                                            if (!isFinished) return false;
                                            if (upcomingFilter === 'today') return isSameDay(d, now);
                                            return isSameMonth(d, now) && d.getFullYear() === now.getFullYear();
                                        });

                                        const totalPages = Math.ceil(filteredFinished.length / rowsPerPage);
                                        const paginatedEvents = filteredFinished
                                            .sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime())
                                            .slice((finishedPage - 1) * rowsPerPage, finishedPage * rowsPerPage);

                                        return (
                                            <>
                                                <div className="flex-1 overflow-y-auto">
                                                    {paginatedEvents.length > 0 ? (
                                                        <div className="divide-y divide-gray-100 bg-gray-50/50">
                                                            {paginatedEvents.map(event => (
                                                                <div key={`${event.id}-${event.dateStr}`} className="flex items-center gap-4 p-4 hover:bg-gray-100 transition-colors opacity-75 hover:opacity-100">
                                                                    <div className="text-green-500">
                                                                        <CheckCircle2 size={20} />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-gray-500 line-through decoration-gray-300">{event.title}</div>
                                                                        <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                                                            <span className="flex items-center gap-1">
                                                                                <CalendarIconLucide size={12} />
                                                                                {format(parseISO(event.dateStr), 'MMM d, yyyy')}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDelete(event.id, event.dateStr)}
                                                                        className="text-gray-300 hover:text-red-500 px-2"
                                                                        title="Delete permanently"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-8 text-center text-gray-400 text-sm">
                                                            No finished tasks for {upcomingFilter}.
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Pagination Controls */}
                                                {filteredFinished.length > 0 && (
                                                    <div className="p-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
                                                        <span>
                                                            Showing {(finishedPage - 1) * rowsPerPage + 1}-
                                                            {Math.min(finishedPage * rowsPerPage, filteredFinished.length)} of {filteredFinished.length}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => setFinishedPage(p => Math.max(1, p - 1))}
                                                                disabled={finishedPage === 1}
                                                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                                                            >
                                                                <ChevronLeft size={16} />
                                                            </button>
                                                            <span className="min-w-[3rem] text-center">Page {finishedPage}</span>
                                                            <button
                                                                onClick={() => setFinishedPage(p => Math.min(totalPages, p + 1))}
                                                                disabled={finishedPage === totalPages}
                                                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                                                            >
                                                                <ChevronRight size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Overdue Section (only if Today) */}
                            {activeTab === 'Today' && overdueEvents.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-[#d93025] mb-2 border-b border-[#f0f0f0] pb-1 flex justify-between items-center">
                                        <span>Overdue</span>
                                        <span className="text-xs font-normal cursor-pointer hover:underline">Reschedule</span>
                                    </h3>
                                    <div className="space-y-0">
                                        {overdueEvents.map(event => (
                                            <TaskItem
                                                key={`${event.id}-${event.dateStr}`}
                                                event={event}
                                                onEdit={() => { setEditingEventDate(parseISO(event.dateStr)); setIsEventModalOpen(true); }}
                                                onDelete={() => handleDelete(event.id, event.dateStr)}
                                                onArchive={() => handleArchive(event.id, event.dateStr)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Task List container */}
                            <div className="space-y-0">
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map(event => (
                                        <TaskItem
                                            key={`${event.id}-${event.dateStr}`}
                                            event={event}
                                            onEdit={() => { setEditingEventDate(parseISO(event.dateStr)); setIsEventModalOpen(true); }}
                                            onDelete={() => handleDelete(event.id, event.dateStr)}
                                            onArchive={() => handleArchive(event.id, event.dateStr)}
                                        />
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-gray-400">
                                        <div className="mb-4">
                                            <img
                                                src="/emptybox-1.png"
                                                alt="No tasks"
                                                className="w-48 mx-auto opacity-80"
                                                onError={(e) => {
                                                    // Fallback if image missing
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <p>No tasks for {activeTab}. Enjoy your day!</p>
                                    </div>
                                )}

                                {/* Quick Add Placeholder */}
                                <button
                                    onClick={() => { setEditingEventDate(new Date()); setIsEventModalOpen(true); }}
                                    className="group flex items-center gap-2 text-gray-500 hover:text-[#1a73e8] mt-4 px-0 py-2 w-full text-left transition-colors"
                                >
                                    <div className="w-5 h-5 rounded-full border border-transparent group-hover:bg-[#1a73e8] group-hover:text-white flex items-center justify-center transition-all">
                                        <Plus size={14} />
                                    </div>
                                    <span className="text-sm">Add task</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </main >

            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                date={editingEventDate || new Date()}
            />

            {/* Recurrence Choice Modal */}
            {recurrenceModal?.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {recurrenceModal.type === 'delete' ? 'Delete recurring task?' : 'Complete recurring task?'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 font-medium">
                                Do you want to {recurrenceModal.type === 'delete' ? 'delete' : 'complete'} only this occurrence or the entire series?
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        if (recurrenceModal.type === 'archive') {
                                            archiveEventAction(recurrenceModal.eventId, recurrenceModal.date, 'specific');
                                        } else {
                                            deleteEventAction(recurrenceModal.eventId, recurrenceModal.date, 'specific');
                                        }
                                        setRecurrenceModal(null);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        <CalendarIconLucide size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">Only this occurrence</div>
                                        <div className="text-[10px] text-gray-500">Affects only {format(parseISO(recurrenceModal.date), 'MMMM d')}</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        if (recurrenceModal.type === 'archive') {
                                            archiveEventAction(recurrenceModal.eventId, recurrenceModal.date, 'all');
                                        } else {
                                            deleteEventAction(recurrenceModal.eventId, recurrenceModal.date, 'all');
                                        }
                                        setRecurrenceModal(null);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                        <RefreshCw size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-900">All occurrences</div>
                                        <div className="text-[10px] text-gray-500">Affects the entire recurring series</div>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={() => setRecurrenceModal(null)}
                                className="mt-6 w-full py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}

// Sub-components
function SidebarItem({ icon: Icon, label, count, active, onClick, iconColor = "text-gray-500" }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md text-sm transition-colors group ${active ? 'bg-[#e8f0fe] text-[#1a73e8] font-medium' : 'text-gray-700 hover:bg-[#f1f3f4]'}`}
        >
            <div className="flex items-center gap-3">
                <Icon size={18} className={`${active ? 'text-[#1a73e8]' : iconColor}`} />
                <span>{label}</span>
            </div>
            {count > 0 && (
                <span className={`text-xs ${active ? 'text-[#1a73e8]' : 'text-gray-400'}`}>{count}</span>
            )}
        </button>
    );
}

function TaskItem({ event, onEdit, onDelete, onArchive }: any) {
    return (
        <div className="group flex items-start gap-3 py-3 border-b border-[#f0f0f0] hover:bg-gray-50 -mx-4 px-4 transition-colors cursor-pointer">
            <button
                onClick={(e) => { e.stopPropagation(); onArchive && onArchive(); }}
                className="mt-1 flex-shrink-0 text-gray-400 hover:text-green-600 transition-colors"
                title="Archive (Mark as Done)"
            >
                <Circle size={18} strokeWidth={1.5} className="group-hover:hidden" />
                <CheckCircle2 size={18} className="hidden group-hover:block" />
            </button>
            <div className="flex-1 min-w-0" onClick={onEdit}>
                <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-[#202124] leading-snug break-words">
                        {event.title}
                    </p>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete Task"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                    <span className={`flex items-center gap-1 text-[11px] ${isBeforeToday(event.dateStr) ? 'text-[#d93025]' : 'text-[#1a73e8]'}`}>
                        <CalendarIcon size={10} />
                        {format(parseISO(event.dateStr), 'd MMM')}
                    </span>
                    {event.description && (
                        <p className="text-[11px] text-gray-400 line-clamp-1 truncate max-w-[200px]">
                            {event.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function isBeforeToday(dateStr: string) {
    return isAfter(new Date(), parseISO(dateStr)) && !isSameDay(new Date(), parseISO(dateStr));
}
