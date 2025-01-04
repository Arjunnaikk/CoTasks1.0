import React from 'react';
import AlertDialogDemo from '@/components/AlertDialogDemo';

const List = ({ listName, handleClick, isSelected, handleListDelete }) => {
  // console.log("Shit",listName, handleClick, isSelected)
  return (
    <div 
      onClick={handleClick}
      className={`group px-4 py-2 text-white w-[21vw] h-[60px] ${isSelected ? 'bg-zinc-800' : 'hover:bg-zinc-800'} cursor-pointer rounded-md transition-colors flex justify-between items-center`}
    >
      <div className="flex items-start justify-between">
        <span>{listName}</span>
      </div>
      <AlertDialogDemo 
      isSelected2={isSelected}
      handleListDelete={() => {handleListDelete(listName)}}
      />
      
    </div>
  );
};

export default List;

