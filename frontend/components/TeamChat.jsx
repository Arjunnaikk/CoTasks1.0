'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useGetTeamMessagesQuery, useGetTeamMembersQuery } from '@/services/queries';
import { useSendTeamMessageMutation, useDeleteTeamMessageMutation, useMarkTeamMessageAsReadMutation, useToggleReactionMutation } from '@/services/mutations';
import { Send, Loader2, MessageSquare, Trash2, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TeamChat = ({ teamName, userGmail, userId }) => {
  const [typedMessage, setTypedMessage] = useState("");
  const [activePickerId, setActivePickerId] = useState(null);
  const messagesEndRef = useRef(null);

  // Queries & Mutations
  const { data, isLoading, error } = useGetTeamMessagesQuery(teamName);
  const { data: teamMembersData } = useGetTeamMembersQuery(teamName);
  const sendMutation = useSendTeamMessageMutation();
  const deleteMutation = useDeleteTeamMessageMutation();
  const readMutation = useMarkTeamMessageAsReadMutation();
  const toggleReactionMutation = useToggleReactionMutation();

  const messages = data?.messages || [];

  const availableEmojis = ["👍", "❤️", "😂", "🎉", "😮", "😢", "🔥", "✅"];

  // Scroll to bottom when messages list changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Mark messages as read when they load or update
  useEffect(() => {
    if (messages.length > 0 && teamName && userGmail) {
      readMutation.mutate({
        teamName,
        userGmail,
      });
    }
  }, [messages.length, teamName, userGmail]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim() || sendMutation.isPending) return;

    const messageText = typedMessage.trim();
    setTypedMessage(""); // Clear immediately for snappy UX

    try {
      await sendMutation.mutateAsync({
        teamName,
        userGmail,
        content: messageText,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      // Restore typed message if failed
      setTypedMessage(messageText);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteMutation.mutateAsync({
        messageId,
        userGmail,
      });
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleToggleReaction = async (messageId, emoji) => {
    try {
      await toggleReactionMutation.mutateAsync({
        messageId,
        userGmail,
        emoji,
        teamName,
      });
    } catch (err) {
      console.error("Failed to toggle reaction:", err);
    }
  };

  // Group message reactions by emoji
  const groupReactions = (reactionsList) => {
    if (!reactionsList) return [];
    const map = {};
    for (const r of reactionsList) {
      if (!map[r.emoji]) {
        map[r.emoji] = {
          emoji: r.emoji,
          count: 0,
          users: [],
          hasReacted: false,
        };
      }
      map[r.emoji].count += 1;
      map[r.emoji].users.push(r.sender_name);
      if (r.sender_gmail === userGmail) {
        map[r.emoji].hasReacted = true;
      }
    }
    return Object.values(map);
  };

  const isUserOnline = (lastActiveStr) => {
    if (!lastActiveStr) return false;
    try {
      const utcStr = lastActiveStr.replace(' ', 'T') + 'Z';
      const lastActive = new Date(utcStr);
      const diff = new Date().getTime() - lastActive.getTime();
      return diff < 40000; // 40 seconds threshold
    } catch (e) {
      return false;
    }
  };

  const isSenderOnline = (senderGmail) => {
    const member = teamMembersData?.members?.find(m => m.gmail === senderGmail);
    return member ? isUserOnline(member.last_active_at) : false;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      const utcStr = timeStr.replace(' ', 'T') + 'Z';
      const date = new Date(utcStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "";
    }
  };

  const isToday = (dateStr) => {
    try {
      const utcStr = dateStr.replace(' ', 'T') + 'Z';
      const date = new Date(utcStr);
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    } catch (e) {
      return false;
    }
  };

  const formatDateHeader = (dateStr) => {
    try {
      const utcStr = dateStr.replace(' ', 'T') + 'Z';
      const date = new Date(utcStr);
      if (isToday(dateStr)) return "Today";
      return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    } catch (e) {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#09090b] text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
        <p className="text-sm">Loading team messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#09090b] text-red-400 p-4 text-center">
        <p className="text-sm font-semibold">Failed to load chat history.</p>
        <p className="text-xs text-zinc-500 mt-1">{error?.message || "An error occurred"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#09090b] overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden p-4 space-y-2 min-h-[40vh] max-h-[70vh] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-500 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-300">No messages yet</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-[200px]">Send a message to start conversing with your team members.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSelf = msg.sender_gmail === userGmail;
            
            // Date Header detection
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showDateHeader = !prevMsg || 
              new Date(msg.created_at.split(' ')[0]).getTime() !== new Date(prevMsg.created_at.split(' ')[0]).getTime();

            // Sender Grouping detection
            const isSameSender = prevMsg && prevMsg.sender_gmail === msg.sender_gmail && !showDateHeader;
            
            // Check if the time difference between messages is less than 3 minutes
            const isWithinThreeMin = prevMsg && (
              new Date(msg.created_at.replace(' ', 'T') + 'Z').getTime() - 
              new Date(prevMsg.created_at.replace(' ', 'T') + 'Z').getTime()
            ) < 3 * 60 * 1000;

            const hideDetails = isSameSender && isWithinThreeMin;
            const grouped = groupReactions(msg.reactions);

            return (
              <div key={msg.message_id || index} className="flex flex-col animate-fade-in">
                {showDateHeader && (
                  <div className="flex justify-center my-4">
                    <span className="bg-zinc-900/90 border border-zinc-800/80 text-zinc-400 text-[10px] px-3 py-1 rounded-full font-semibold shadow-sm tracking-wider uppercase">
                      {formatDateHeader(msg.created_at)}
                    </span>
                  </div>
                )}

                <div className={`flex items-start space-x-2 ${isSelf ? 'justify-end' : 'justify-start'} ${hideDetails ? 'mt-[2px]' : 'mt-3'}`}>
                  {/* Left avatar for other people (or spacing helper if consecutive) */}
                  {!isSelf && (
                    <div className="w-8 shrink-0 flex justify-center">
                      {!hideDetails ? (
                        <div className="relative">
                          <img 
                            className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900 shadow-sm" 
                            src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${msg.user_id}`} 
                            alt={msg.sender_name} 
                          />
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#09090b] ${
                            isSenderOnline(msg.sender_gmail) ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
                          }`} />
                        </div>
                      ) : (
                        <div className="w-8 h-1" /> // Spacing helper
                      )}
                    </div>
                  )}

                  <div className="flex flex-col max-w-[70%] min-w-0 group">
                    {/* Sender Name for other users */}
                    {!isSelf && !hideDetails && (
                      <span className="text-[11px] text-zinc-400 font-semibold ml-1.5 mb-0.5">
                        {msg.sender_name}
                      </span>
                    )}

                    <div className="flex items-center gap-1 w-full min-w-0 relative">
                      {/* Emoji Picker Popup */}
                      {activePickerId === msg.message_id && (
                        <div className={`absolute z-10 bottom-full mb-1.5 bg-zinc-950/95 border border-zinc-800 p-1 rounded-lg flex gap-0.5 shadow-lg shadow-black/45 backdrop-blur-md animate-fade-in ${
                          isSelf ? 'right-0' : 'left-0'
                        }`}>
                          {availableEmojis.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                handleToggleReaction(msg.message_id, emoji);
                                setActivePickerId(null);
                              }}
                              className="hover:bg-zinc-800 p-1.5 rounded text-sm transition-all duration-150 transform active:scale-75 select-none"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action buttons on left for self messages */}
                      {isSelf && (
                        <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => setActivePickerId(activePickerId === msg.message_id ? null : msg.message_id)}
                            className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-purple-400 transition-colors"
                            title="React to message"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.message_id)}
                            disabled={deleteMutation.isPending}
                            className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-red-400 transition-colors"
                            title="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Chat Bubble */}
                      <div className={`p-2.5 px-3.5 rounded-2xl shadow-sm text-sm break-all relative grow min-w-0 ${
                        isSelf 
                          ? 'bg-purple-600 text-white rounded-tr-none font-medium' 
                          : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
                      }`}>
                        <p className="leading-relaxed pr-8">{msg.content}</p>
                        <span className={`absolute bottom-1 right-2 text-[9px] select-none font-light tracking-wide ${
                          isSelf ? 'text-purple-200/80' : 'text-zinc-500'
                        }`}>
                          {formatTime(msg.created_at)}
                        </span>
                      </div>

                      {/* Action buttons on right for other messages */}
                      {!isSelf && (
                        <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => setActivePickerId(activePickerId === msg.message_id ? null : msg.message_id)}
                            className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-purple-400 transition-colors"
                            title="React to message"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Reaction Badges Container */}
                    {grouped.length > 0 && (
                      <div className={`flex flex-wrap gap-1 mt-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        {grouped.map(group => (
                          <button
                            key={group.emoji}
                            type="button"
                            onClick={() => handleToggleReaction(msg.message_id, group.emoji)}
                            className={`flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full border transition-all duration-200 select-none ${
                              group.hasReacted 
                                ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 shadow-sm shadow-purple-500/10' 
                                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                            }`}
                            title={group.users.join(", ")}
                          >
                            <span>{group.emoji}</span>
                            <span className="font-semibold">{group.count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <div className="p-4 bg-zinc-950/80 border-t border-zinc-900">
        <form onSubmit={handleSend} className="bg-zinc-900 border border-zinc-800/80 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 p-1.5 rounded-xl flex gap-2 items-center w-full transition-all duration-300">
          <input
            type="text"
            placeholder="Send a message..."
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            className="flex-grow bg-transparent border-0 focus:outline-none focus:ring-0 px-2.5 text-sm text-zinc-100 placeholder:text-zinc-500"
          />
          <button 
            type="submit" 
            disabled={!typedMessage.trim() || sendMutation.isPending}
            className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg p-2 transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:scale-100 w-8 h-8 flex items-center justify-center shrink-0 shadow-md shadow-purple-900/20"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamChat;
