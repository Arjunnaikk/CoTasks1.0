"use client";

import Sidebar from "@/components/Sidebar";
import React, { useState, useEffect } from "react";
import ProfileSection from "@/components/ProfileSection";
import FeedbackSection from "@/components/FeedbackSection";

const Page = () => {

  const [selectedSection, setSelectedSection] = useState("profile");

  // Subsections content
  const renderSectionContent = () => {
    switch (selectedSection) {
      case "profile":
        return <ProfileSection />;
      case "feedback":
        return <FeedbackSection />;
      default:
        return <div className="text-white">Select a section</div>;
    }
  };

  return (
    <>
      {/* Sidebar with subsections */}
      <div className='w-[23vw] h-[90.8vh] bg-[#09090b] top-[55px] sticky rounded-md m-1 flex flex-col items-center gap-3 p-2 border-zinc-800 border-[0.5px]'>
      <div className='h-auto px-[1px] py-[10px] bg-[#09090b] w-[90%] rounded-md flex flex-col gap-2 justify-center items-center'>
          <h3 className='text-2xl font-bold text-white'>Setting</h3>
          <div className='w-[21vw] h-[0.5px] bg-zinc-700'></div>
        </div>

        {/* Subsection buttons */}
        <button
          onClick={() => setSelectedSection("profile")}
          className={`text-white py-2 px-4 rounded-md w-[90%] text-left ${
            selectedSection === "profile" ? "bg-zinc-800" : "bg-#18181b"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setSelectedSection("feedback")}
          className={`text-white py-2 px-4 rounded-md w-[90%] text-left ${
            selectedSection === "feedback" ? "bg-zinc-800" : "bg-#18181b"
          }`}
        >
          Feedback
        </button>
      </div>

      {/* Main content area */}
      <div className="h-auto w-[90vw] bg-#09090b m-2 flex flex-col items-center gap-10 pt-[15px]">
        {/* Render subsection content based on selection */}
        {renderSectionContent()}
      </div>
    </>
  );
};

export default Page;