import React from 'react';
import AlertDialogDemo from '@/components/AlertDialogDemo';
import { Users } from 'lucide-react';

const TeamList = ({ teamName, handleClick, isSelected, handleTeamDelete, unreadCount, isAdmin }) => {
  return (
    <div 
      onClick={handleClick}
      className={`group px-4 py-3 w-[21vw] h-14 cursor-pointer rounded-xl flex justify-between items-center transition-all duration-200 border ${
        isSelected 
          ? 'bg-zinc-900 border-zinc-850 text-white font-medium shadow-md shadow-black/20' 
          : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Users className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`} />
        <span className="truncate text-sm tracking-tight">{teamName}</span>
        {unreadCount > 0 && (
          <span className="shrink-0 flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-[9px] text-white font-bold select-none border border-[#09090b]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
      {isAdmin && (
        <div className="shrink-0">
          <AlertDialogDemo
            isSelected2={isSelected}
            handleTeamDelete={() => {handleTeamDelete(teamName)}}
          />
        </div>
      )}
    </div>
  );
};

export default TeamList;
