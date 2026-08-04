"use client";

import React, { useState } from "react";
import ProfileSection from "@/components/ProfileSection";
import FeedbackSection from "@/components/FeedbackSection";

const Page = () => {
  const [selectedSection, setSelectedSection] = useState("profile");

  const renderSectionContent = () => {
    switch (selectedSection) {
      case "profile":
        return <ProfileSection />;
      case "feedback":
        return <FeedbackSection />;
      default:
        return <div className="text-white text-sm">Select a section</div>;
    }
  };

  return (
    <div className="flex flex-row flex-1 w-full min-w-0 bg-[#09090b] h-full overflow-hidden">
      {/* Settings Navigation Sidebar (Flush) */}
      <div className="w-[280px] h-full bg-[#09090b]/30 border-r border-zinc-900 flex flex-col p-4 shrink-0 gap-4">
        <div className="flex flex-col gap-2.5 px-2 py-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Settings</h3>
          <div className="w-full h-px bg-zinc-900 mt-2"></div>
        </div>

        {/* Subsection buttons */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setSelectedSection("profile")}
            className={`py-2.5 px-4 rounded-xl w-full text-left text-xs font-semibold transition-all duration-200 ${
              selectedSection === "profile"
                ? "bg-white text-zinc-950 shadow-md shadow-white/5"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
            }`}
          >
            Profile Settings
          </button>
          <button
            onClick={() => setSelectedSection("feedback")}
            className={`py-2.5 px-4 rounded-xl w-full text-left text-xs font-semibold transition-all duration-200 ${
              selectedSection === "feedback"
                ? "bg-white text-zinc-950 shadow-md shadow-white/5"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
            }`}
          >
            Feedback & Support
          </button>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="flex-grow h-full overflow-y-auto p-8 bg-zinc-950/10">
        <div className="w-full max-w-2xl">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};

export default Page;