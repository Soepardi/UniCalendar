'use client';

import React, { useState, useEffect } from 'react';
import { useTeamStore } from '@/store/useTeamStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { supabase } from '@/lib/supabase';
import { Users, UserPlus, X, Shield, ShieldAlert, Trash2, Loader2, Search } from 'lucide-react';

interface TeamManagementProps {
    teamId: string;
    onClose: () => void;
}

export const TeamManagement = ({ teamId, onClose }: TeamManagementProps) => {
    const {
        teams, members, fetchMembers, addMember, removeMember,
        updateTeam, deleteTeam
    } = useTeamStore();
    const { addToast, confirm } = useNotificationStore();
    const [inviteUsername, setInviteUsername] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    const team = teams.find(t => t.id === teamId);
    const teamMembers = members[teamId] || [];

    // We'll use a better check for owner
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
        fetchMembers(teamId);
        if (team) setNewName(team.name);
    }, [teamId, fetchMembers, team]);

    const handleRename = async () => {
        if (!newName.trim() || newName === team?.name) {
            setIsEditingName(false);
            return;
        }
        try {
            await updateTeam(teamId, newName.trim());
            addToast(`Team renamed to "${newName.trim()}"`, 'success');
            setIsEditingName(false);
        } catch (err) {
            addToast('Failed to rename team', 'error');
        }
    };

    const handleDelete = () => {
        confirm({
            title: 'Delete Team',
            message: `Are you sure you want to delete "${team?.name}"? This action cannot be undone and will remove all associated events and memberships.`,
            confirmText: 'Delete Team',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await deleteTeam(teamId);
                    addToast(`Team "${team?.name}" deleted`, 'success');
                    onClose();
                } catch (err) {
                    addToast('Failed to delete team', 'error');
                }
            }
        });
    };

    const handleInvite = async () => {
        if (!inviteUsername.trim()) return;
        setIsSearching(true);
        setSearchError('');

        try {
            // Find user by username in profiles
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', inviteUsername.trim())
                .single();

            if (error || !profile) {
                setSearchError('User not found');
                return;
            }

            // Check if already a member
            if (teamMembers.find(m => m.user_id === profile.id)) {
                setSearchError('User is already a member');
                return;
            }

            await addMember(teamId, profile.id);
            addToast(`Invited ${inviteUsername} to the team`, 'success');
            setInviteUsername('');
            setSearchError('');
        } catch (err) {
            setSearchError('Error inviting user');
            addToast('Failed to invite user', 'error');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex-1">
                        {isEditingName ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="text-lg font-bold text-gray-900 bg-white border border-indigo-200 rounded-lg px-2 py-1 outline-none ring-2 ring-indigo-500/20 w-full"
                                    autoFocus
                                    onBlur={handleRename}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => team?.owner_id === currentUserId && setIsEditingName(true)}>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                    <Users size={20} className="text-indigo-600" />
                                    {team?.name || 'Team'}
                                </h2>
                                {team?.owner_id === currentUserId && (
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold">Edit</span>
                                )}
                            </div>
                        )}
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
                            Team Collaboration
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200/50 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    {/* Invite Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Invite Member</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={inviteUsername}
                                    onChange={(e) => setInviteUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                />
                            </div>
                            <button
                                onClick={handleInvite}
                                disabled={isSearching || !inviteUsername.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                Invite
                            </button>
                        </div>
                        {searchError && <p className="text-xs font-medium text-red-500 ml-1">{searchError}</p>}
                    </div>

                    {/* Member List */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Members ({teamMembers.length})</label>
                        <div className="space-y-2">
                            {teamMembers.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                                            {member.profile?.avatar_url ? (
                                                <img src={member.profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                (member.profile?.username?.[0] || '?').toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{member.profile?.full_name || member.profile?.username}</p>
                                            <p className="text-[10px] font-semibold text-[#1a73e8] flex items-center gap-1">
                                                {member.role === 'admin' ? <Shield size={10} /> : <Users size={10} />}
                                                {member.role.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    {member.user_id !== team?.owner_id && (
                                        <button
                                            onClick={() => {
                                                confirm({
                                                    title: 'Remove Member',
                                                    message: `Are you sure you want to remove ${member.profile?.full_name || member.profile?.username} from the team?`,
                                                    confirmText: 'Remove',
                                                    type: 'danger',
                                                    onConfirm: async () => {
                                                        try {
                                                            await removeMember(teamId, member.user_id);
                                                            addToast(`Removed ${member.profile?.username} from team`, 'success');
                                                        } catch (err) {
                                                            addToast('Failed to remove member', 'error');
                                                        }
                                                    }
                                                });
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    {team?.owner_id === currentUserId && (
                        <div className="pt-4 border-t border-gray-100">
                            <label className="text-xs font-bold text-red-500 uppercase tracking-wider ml-1">Danger Zone</label>
                            <div className="mt-2 p-4 bg-red-50 rounded-2xl border border-red-100">
                                <p className="text-[10px] text-red-600 font-medium mb-3">Deleting this team will remove all associated events and memberships.</p>
                                <button
                                    onClick={handleDelete}
                                    className="w-full py-2 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={14} />
                                    Delete "{team?.name}"
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
