'use client'

import React from "react";
import { useSession } from "next-auth/react";
import { useGetUserQuery } from "@/services/queries";

const ProfileSection = () => {
  const { data: session } = useSession();
  const { data: userData, isLoading, error } = useGetUserQuery();
  const user = userData?.user?.find((u) => u.name === session?.user?.name);

  return (
    <div className="text-white w-full max-w-2xl space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white tracking-tight">Profile Settings</h3>
        <p className="text-zinc-400 text-xs mt-1">Manage your public profile account information.</p>
      </div>
      
      {/* Display Picture */}
      <div className="flex flex-col items-start bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl space-y-3">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Display Picture</label>
        <div className="flex items-center gap-4">
          <img 
            className="w-16 h-16 rounded-full border border-zinc-800 bg-zinc-900 shadow-md ring-2 ring-purple-500/20" 
            src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${user?.user_id || 'default'}`} 
            alt="Profile Avatar" 
          />
          <div className="text-left">
            <p className="text-xs text-zinc-500 font-medium">Avatar automatically generated via seed</p>
            <p className="text-[10px] text-purple-400/80 font-mono mt-0.5">seed: {user?.user_id || 'default'}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Username */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Username</label>
          <input
            type="text"
            readOnly
            value={session?.user?.name || ""}
            className="w-full bg-[#18181b] border-zinc-850 border rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none cursor-not-allowed opacity-80"
          />
        </div>
        
        {/* Gmail */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
          <input
            type="email"
            readOnly
            value={session?.user?.email || ""}
            className="w-full bg-[#18181b] border-zinc-850 border rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none cursor-not-allowed opacity-80"
          />
        </div>
        
        {/* Phone Number */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Phone Number</label>
          <input
            type="tel"
            placeholder="No phone number provided"
            className="w-full bg-[#18181b] border-zinc-800 border rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Location/Address</label>
          <input
            type="text"
            placeholder="No address provided"
            className="w-full bg-[#18181b] border-zinc-800 border rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
          />
        </div>
      </div>

      <div className="pt-2">
        <button className="bg-white text-zinc-950 hover:bg-zinc-200 transition-colors font-bold text-xs h-9 px-5 rounded-xl shadow-md flex items-center justify-center active:scale-95 duration-150 cursor-pointer">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileSection;