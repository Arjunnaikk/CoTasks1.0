'use client'

import React, { useState } from 'react';
import { useGetTaskCommentsQuery } from '@/services/queries';
import { useCreateTaskCommentMutation, useDeleteTaskCommentMutation } from '@/services/mutations';
import { Send, Loader2, Trash2, MessageSquare, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TaskComments = ({ taskId, userGmail }) => {
  const [typedComment, setTypedComment] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  // Queries & Mutations
  const { data, isLoading, error } = useGetTaskCommentsQuery(taskId);
  const createMutation = useCreateTaskCommentMutation();
  const deleteMutation = useDeleteTaskCommentMutation();

  const comments = data?.comments || [];

  const handlePost = async (e) => {
    if (e) e.preventDefault();
    if (!typedComment.trim() || createMutation.isPending) return;

    try {
      await createMutation.mutateAsync({
        taskId,
        userGmail,
        content: typedComment.trim()
      });
      setTypedComment("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteMutation.mutateAsync({
        taskId,
        commentId,
        userGmail
      });
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      const utcStr = timeStr.replace(' ', 'T') + 'Z';
      const date = new Date(utcStr);
      
      const diffMs = new Date().getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 flex flex-col items-center justify-center text-zinc-500 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-purple-500 mb-1.5" />
        <span>Loading discussion...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-red-400 text-xs">
        <span>Failed to load discussion: {error.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center text-sm font-semibold text-zinc-300 cursor-pointer hover:text-zinc-100 transition-colors select-none"
      >
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-zinc-400" />
          <span>Discussion</span>
          <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full font-medium">
            {comments.length}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
      </div>

      {isOpen && (
        <>
          {/* Comments List */}
          <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {comments.length === 0 ? (
              <div className="text-center py-6 bg-zinc-900/10 rounded-xl border border-zinc-850/30 border-dashed">
                <p className="text-zinc-500 text-xs italic">No comments yet. Start the conversation!</p>
              </div>
            ) : (
              comments.map((comment) => {
                const isAuthor = comment.sender_gmail === userGmail;
                return (
                  <div 
                    key={comment.comment_id} 
                    className="flex gap-2.5 group bg-zinc-900/20 hover:bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-850/20 transition-all duration-200"
                  >
                    {/* DiceBear Avatar */}
                    <img 
                      className="w-7 h-7 rounded-full border border-zinc-800 bg-zinc-900 shadow-sm shrink-0" 
                      src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${comment.user_id}`} 
                      alt={comment.sender_name} 
                    />

                    {/* Comment Content block */}
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-zinc-200 truncate">
                          {comment.sender_name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-zinc-500 select-none">
                            {formatTime(comment.created_at)}
                          </span>
                          {isAuthor && (
                            <button
                              onClick={() => handleDelete(comment.comment_id)}
                              disabled={deleteMutation.isPending}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-0.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-red-400"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed break-all whitespace-pre-wrap pr-1">{comment.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Comment Input Bar */}
          <form onSubmit={handlePost} className="bg-zinc-950 border border-zinc-800 focus-within:border-purple-500/50 p-1 rounded-xl flex gap-2 items-center transition-all duration-200">
            <input
              type="text"
              placeholder="Write a comment..."
              value={typedComment}
              onChange={(e) => setTypedComment(e.target.value)}
              maxLength={1000}
              className="flex-grow bg-transparent border-0 focus:outline-none focus:ring-0 px-2.5 py-1 text-xs text-zinc-100 placeholder:text-zinc-600"
            />
            <button 
              type="submit" 
              disabled={!typedComment.trim() || createMutation.isPending}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg p-1.5 transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:scale-100 w-7 h-7 flex items-center justify-center shrink-0"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default TaskComments;
