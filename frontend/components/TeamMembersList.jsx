'use client'

import React from 'react';
import { useGetTeamMembersQuery } from '@/services/queries';
import { useUpdateMemberRoleMutation } from '@/services/mutations';
import { Loader2, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TeamMembersList = ({ teamName, currentUserEmail }) => {
  const { toast } = useToast();
  const { data, isLoading, error } = useGetTeamMembersQuery(teamName);
  const updateRoleMutation = useUpdateMemberRoleMutation();

  const members = data?.members || [];

  const isUserOnline = (lastActiveStr) => {
    if (!lastActiveStr) return false;
    try {
      const utcStr = lastActiveStr.replace(' ', 'T') + 'Z';
      const lastActive = new Date(utcStr);
      const diff = new Date().getTime() - lastActive.getTime();
      return diff < 40000;
    } catch (e) {
      return false;
    }
  };

  // Find if current user is admin of the team
  const currentUserMembership = members.find(m => m.gmail === currentUserEmail);
  const isCurrentUserAdmin = currentUserMembership?.role === 'admin';

  const handleRoleToggle = async (member) => {
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    if (!confirm(`Are you sure you want to change ${member.name}'s role to ${newRole}?`)) return;

    try {
      await updateRoleMutation.mutateAsync({
        teamName,
        targetGmail: member.gmail,
        role: newRole,
        userGmail: currentUserEmail,
      });
      toast({
        title: "Role Updated",
        description: `Successfully updated ${member.name} to ${newRole}.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.msg || "Failed to update member role.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500 mb-2" />
        <p className="text-xs">Loading group members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10 text-red-400 text-center">
        <p className="text-xs">Failed to load group members.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b] overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-zinc-900 bg-zinc-950/20 flex justify-between items-center">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Group Members</h3>
        <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full font-medium">
          {members.filter(m => isUserOnline(m.last_active_at)).length} / {members.length} Online
        </span>
      </div>

      {/* Members List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {members.map((member) => {
          const isOnline = isUserOnline(member.last_active_at);
          const isSelf = member.gmail === currentUserEmail;

          return (
            <div 
              key={member.user_id} 
              className="bg-zinc-900/30 border border-zinc-850/60 hover:border-zinc-800/80 p-3 rounded-xl transition-all duration-200 shadow-sm flex items-center justify-between group"
            >
              {/* Profile Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img 
                    className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900 object-cover" 
                    src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${member.user_id}`} 
                    alt={member.name} 
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#09090b] ${
                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
                  }`} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-zinc-200 truncate">
                    {member.name} {isSelf && <span className="text-zinc-500 font-normal ml-0.5">(You)</span>}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate">{member.gmail}</span>
                </div>
              </div>

              {/* Roles & Admin Actions */}
              <div className="flex items-center gap-2">
                {/* Role Badge */}
                {member.role === 'admin' ? (
                  <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 font-semibold select-none">
                    <Shield className="w-2.5 h-2.5 text-purple-400" />
                    Admin
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium select-none">
                    <User className="w-2.5 h-2.5 text-zinc-500" />
                    Member
                  </span>
                )}

                {/* Make/Revoke Admin Action Button */}
                {isCurrentUserAdmin && !isSelf && (
                  <button
                    type="button"
                    onClick={() => handleRoleToggle(member)}
                    disabled={updateRoleMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[10px] px-2 py-1 rounded bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 hover:bg-purple-950/20 text-zinc-400 hover:text-purple-300 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {member.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamMembersList;
