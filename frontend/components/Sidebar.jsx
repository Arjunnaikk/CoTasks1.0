'use client'

import React from 'react';
import { MessageCircleMore, Settings, User, Users } from 'lucide-react';
import Link from 'next/link';
import { useGetListQuery, useGetMyTaskQuery } from "@/services/queries"; // Ensure you import your task query
import { useSession } from "next-auth/react";

const Sidebar = () => {
  const { data: session } = useSession(); // Get the current user session

  // Use hooks unconditionally
  // const { data: listData, isLoading: listLoading, error: listError } = useGetListQuery(session?.user?.email);
  
  // Initialize task data to null initially
  // let taskData = null;

  // Select the first list from the array
  // const firstList = listData?.newList?.[0]; // Access the first list safely
  
  // Fetch tasks for the first list if it exists
  // if (firstList) {
  //   taskData = useGetMyTaskQuery(session?.user?.email, firstList.id); // Fetch tasks if firstList exists
  // }

  // if (listLoading || (firstList && taskData?.isLoading)) return <div>Loading...</div>; // Loading state
  // if (listError) return <div>Error: {listError.message}</div>; // Error handling

  // Select the first task from the task data
  // const firstTask = taskData?.data?.newTask?.[0]; // Assuming newTask is the array containing tasks
  // const firstTaskId = firstTask ? firstTask.task_id : null; // Store the first task's ID if it exists

  // // Debugging output
  // if (firstList) {
  //   console.log("First List Name:", firstList.name);
  // } else {
  //   console.log("No lists found.");
  // }

  // if (firstTask) {
  //   console.log("First Task ID:", firstTask.task_id);
  // } else {
  //   console.log("No tasks found for the first list.");
  // }

  return (
    <div className='flex flex-row'>
      <div className='w-[4vw] h-[90.8vh] bg-#09090b top-[55px] sticky rounded-md m-1 border border-zinc-800 border-1'>
        <div className='flex justify-center items-center align-middle flex-col gap-7 mt-4 text-white'>

          {/* Link to the first task of the first list */}
          {(
            <Link href={`/mypage/`}>
              <User /> {/* Change icon as needed */}
            </Link>
          )}

          {/* Link to the users page */}
          <Link href={`/mygroups/MiniProject/task/10`}>
            <Users />
          </Link>

          {/* Link to the messages page */}
          <Link href="/mychats">
            <MessageCircleMore />
          </Link>

          {/* Link to the settings page */}
          <Link href="/mysettings">
            <Settings />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
