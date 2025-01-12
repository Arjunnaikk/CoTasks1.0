import React from 'react';
import AlertDialogDemo from '@/components/AlertDialogDemo';

const TeamList = ({ teamName, handleClick, isSelected, handleTeamDelete}) => {
  // console.log("Shit",teamName, handleClick, isSelected)
  return (
    <div 
      onClick={handleClick}
      className={`group px-4 py-2 text-white w-[21vw] h-[60px] ${isSelected ? 'bg-zinc-800' : 'hover:bg-zinc-800'} cursor-pointer rounded-md transition-colors flex justify-between items-center`}
    >
      <div className="flex items-start justify-between ">
        <span>{teamName}</span>
      </div>
      <AlertDialogDemo
            isSelected2={isSelected}
            handleTeamDelete={() => {handleTeamDelete(teamName)}}
            />
    </div>
  );
};

export default TeamList;

