'use client'

import React, { useState } from 'react';
import { useGetSubtasksQuery } from '@/services/queries';
import { useCreateSubtaskMutation, useToggleSubtaskMutation, useDeleteSubtaskMutation } from '@/services/mutations';
import { Plus, Trash2, Loader2, Check, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SubtaskList = ({ taskId, userGmail }) => {
  const [newTitle, setNewTitle] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  // Queries & Mutations
  const { data, isLoading, error } = useGetSubtasksQuery(taskId);
  const createMutation = useCreateSubtaskMutation();
  const toggleMutation = useToggleSubtaskMutation();
  const deleteMutation = useDeleteSubtaskMutation();

  const subtasks = data?.subtasks || [];

  const total = subtasks.length;
  const completed = subtasks.filter(s => s.is_completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim() || createMutation.isPending) return;

    try {
      await createMutation.mutateAsync({
        taskId,
        title: newTitle.trim(),
        userGmail
      });
      setNewTitle("");
    } catch (err) {
      console.error("Failed to create subtask:", err);
    }
  };

  const handleToggle = async (subtask) => {
    try {
      await toggleMutation.mutateAsync({
        taskId,
        subtaskId: subtask.subtask_id,
        isCompleted: !subtask.is_completed,
        userGmail
      });
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    }
  };

  const handleDelete = async (subtaskId) => {
    try {
      await deleteMutation.mutateAsync({
        taskId,
        subtaskId
      });
    } catch (err) {
      console.error("Failed to delete subtask:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 flex items-center gap-2 text-zinc-500 text-xs">
        <Loader2 className="w-4.5 h-4.5 animate-spin text-purple-500" />
        <span>Loading subtasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-red-400 text-xs">
        <span>Failed to load subtasks: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Progress */}
      <div className="space-y-2">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex justify-between items-center text-sm font-semibold text-zinc-300 cursor-pointer hover:text-zinc-100 transition-colors select-none"
        >
          <span className="flex items-center gap-1.5">
            Subtasks
            <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full font-medium">
              {completed}/{total}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-400">{percent}%</span>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-900 border border-zinc-800/80 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-purple-600 h-full transition-all duration-500 rounded-full" 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {isOpen && (
        <>
          {/* Subtask Checklist */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {subtasks.length === 0 ? (
          <p className="text-zinc-500 text-xs italic py-2">No subtasks added yet. Break down this task below!</p>
        ) : (
          subtasks.map((subtask) => (
            <div 
              key={subtask.subtask_id} 
              className="flex items-center justify-between group bg-zinc-900/30 hover:bg-zinc-900/60 p-2 rounded-lg border border-zinc-850/50 transition-all duration-200"
            >
              <div 
                onClick={() => handleToggle(subtask)}
                className="flex items-center gap-2.5 cursor-pointer min-w-0 grow py-0.5"
              >
                {/* Styled Checkbox */}
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${
                  subtask.is_completed 
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'border-zinc-700 bg-zinc-950 hover:border-zinc-500'
                }`}>
                  {subtask.is_completed && <Check className="w-3 h-3 stroke-[3]" />}
                </div>

                {/* Subtask Title */}
                <span className={`text-xs truncate transition-all duration-200 select-none ${
                  subtask.is_completed 
                    ? 'line-through text-zinc-500' 
                    : 'text-zinc-300 font-medium'
                }`}>
                  {subtask.title}
                </span>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(subtask.subtask_id)}
                disabled={deleteMutation.isPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400 shrink-0 ml-2"
                title="Delete subtask"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Subtask Form */}
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          type="text"
          placeholder="Add a step..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          maxLength={100}
          className="bg-zinc-950 border-zinc-800 focus-visible:ring-purple-500 text-xs h-8 text-white grow"
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={!newTitle.trim() || createMutation.isPending}
          className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200 h-8 px-3 shrink-0"
        >
          {createMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </Button>
      </form>
        </>
      )}
    </div>
  );
};

export default SubtaskList;
