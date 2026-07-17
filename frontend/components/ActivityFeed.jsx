'use client'

import React from 'react';
import { useGetTeamActivityQuery } from '@/services/queries';
import { Loader2, PlusCircle, CheckCircle2, MessageSquare, ListTodo, ClipboardCheck, Activity } from 'lucide-react';

const ActivityFeed = ({ teamName }) => {
  const { data, isLoading, error } = useGetTeamActivityQuery(teamName);
  const logs = data?.logs || [];

  const formatRelativeTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      const utcStr = timeStr.replace(' ', 'T') + 'Z';
      const date = new Date(utcStr);
      const diffMs = new Date().getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (e) {
      return "";
    }
  };

  const getActionStyles = (action, description) => {
    switch (action) {
      case 'task_created':
        return {
          icon: <PlusCircle className="w-3 h-3 text-emerald-400" />,
          color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
        };
      case 'task_status_updated':
        if (description.includes('completed')) {
          return {
            icon: <CheckCircle2 className="w-3 h-3 text-purple-400" />,
            color: 'bg-purple-500/10 border-purple-500/20 text-purple-300'
          };
        }
        return {
          icon: <Activity className="w-3 h-3 text-blue-400" />,
          color: 'bg-blue-500/10 border-blue-500/20 text-blue-300'
        };
      case 'comment_created':
        return {
          icon: <MessageSquare className="w-3 h-3 text-pink-400" />,
          color: 'bg-pink-500/10 border-pink-500/20 text-pink-300'
        };
      case 'subtask_created':
        return {
          icon: <ListTodo className="w-3 h-3 text-amber-400" />,
          color: 'bg-amber-500/10 border-amber-500/20 text-amber-300'
        };
      case 'subtask_toggled':
        return {
          icon: <ClipboardCheck className="w-3 h-3 text-indigo-400" />,
          color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
        };
      default:
        return {
          icon: <Activity className="w-3 h-3 text-zinc-400" />,
          color: 'bg-zinc-800 border-zinc-700 text-zinc-300'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500 mb-2" />
        <p className="text-xs">Loading activity feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10 text-red-400 p-4 text-center">
        <p className="text-xs font-semibold">Failed to load activity logs.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b] overflow-hidden">
      {/* Activity Header */}
      <div className="p-4 border-b border-zinc-900 bg-zinc-950/20">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Workspace Event Timeline</h3>
      </div>

      {/* Feed List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 relative scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <Activity className="h-5 w-5 text-zinc-500" />
            </div>
            <p className="text-sm font-semibold text-zinc-300">No activity yet</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-[200px]">Events will appear here as team members interact with tasks and checklists.</p>
          </div>
        ) : (
          <div className="relative border-l border-zinc-850 ml-4 pl-6 space-y-6">
            {logs.map((log) => {
              const styles = getActionStyles(log.action, log.description);
              return (
                <div key={log.activity_id} className="relative group animate-fade-in">
                  {/* Timeline Avatar Anchor */}
                  <div className="absolute -left-[38px] top-0.5">
                    <div className="relative">
                      <img 
                        className="w-7 h-7 rounded-full border border-zinc-850 bg-zinc-900 shadow-sm transition-transform duration-200 group-hover:scale-105" 
                        src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${log.user_id}`} 
                        alt={log.user_name} 
                      />
                      <div className={`absolute -bottom-1.5 -right-1.5 rounded-full p-0.5 border border-[#09090b] shadow-sm ${styles.color}`}>
                        {styles.icon}
                      </div>
                    </div>
                  </div>

                  {/* Activity Content Box */}
                  <div className="bg-zinc-900/30 border border-zinc-850/80 hover:border-zinc-800/80 hover:bg-zinc-900/40 p-3 rounded-xl transition-all duration-200 shadow-sm flex flex-col gap-1">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      <span className="font-semibold text-zinc-100">{log.user_name}</span>{" "}
                      {log.description}
                    </p>
                    <span className="text-[10px] text-zinc-500 font-light">
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
