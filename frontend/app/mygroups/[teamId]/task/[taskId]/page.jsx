'use client'

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useGetMyTeamQuery, useGetMyTeamTaskQuery, useGetAssignedQuery } from "@/services/queries";
import { useUpdateTaskStatusMutation } from "@/services/mutations";
import { Trash2, Menu, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Sidebar from '@/components/Sidebar';
import Create from '@/components/Create';
import CreateTeam from '@/components/CreateTeam';
import MyTeamCard from '@/components/MyTeamCard';
import TeamList from '@/components/TeamList';
import EmptyCard from '@/components/EmptyCard';
import DialogDemoTeam from '@/components/DialogDemoTeam';
import SkeletonDemo from "@/components/SkeletonDemo";

const ErrorComponent = ({ error }) => <div>Error: {error?.message || "An error occurred"}</div>;

const Page = ({ params }) => {
    const router = useRouter();
    const { data: session } = useSession();
    //if(session === null) return;
    if(!session) {
        router.push('/api/auth/signin');   
    }
    // Queries
    const { data: myTeamTask, isLoading, error } = useGetMyTeamTaskQuery(session?.user?.email, params.teamId);
    const { data: teamData, isLoading: teamLoading, error: teamError } = useGetMyTeamQuery(session?.user?.email);
    const { data: assignedData, isLoading: teamAssignedLoading, error: teamAssignedError } = useGetAssignedQuery(params.teamId, params.taskId);
    // const [updateTaskStatus] = useUpdateTaskStatusMutation();
    
    const [task, setTask] = useState(null);
    const [sortedTasks, setSortedTasks] = useState([]);
    const [sortDirection, setSortDirection] = useState('desc');

    useEffect(() => {
        if (myTeamTask) {
            setSortedTasks([...myTeamTask]);
            
            if (params.taskId) {
                const currentTask = myTeamTask.find(item => item.task_id === parseInt(params.taskId, 10));
                setTask(currentTask);
            }
        }
    }, [myTeamTask, params.taskId]);    

    if (isLoading || teamLoading || !myTeamTask || !teamData) return <SkeletonDemo />;
    if (error || teamError) return <ErrorComponent error={error || teamError} />;

    // Handlers
    const handleRoute = (teamTitle, taskId = 10) => {
        router.push(`/mygroups/${teamTitle}/task/${taskId}`);
    };

    const handleSort = () => {
        const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        setSortDirection(newDirection);
        
        const newSortedTasks = [...sortedTasks].sort((a, b) => {
            if (newDirection === 'asc') {
                return a.priority - b.priority;
            } else {
                return b.priority - a.priority;
            }
        });
        
        setSortedTasks(newSortedTasks);
    };

    const handleStatusChange = async (newStatus) => {
        if (task) {
            try {
                await updateTaskStatus({
                    user_gmail:session?.user?.email,
                    taskId: task.task_id,
                    status: newStatus
                });
                setTask({ ...task, status: newStatus });
            } catch (error) {
                console.error("Failed to update task status:", error);
            }
        }
    };

    return (
        <>
            {/* Sidebar */}
            <div className='w-[25vw] h-[90.8vh] bg-[#09090b] top-[55px] sticky rounded-md m-1 flex flex-col items-center gap-3 p-1 border-zinc-800 border-[0.5px]'>
                <div className='h-auto px-[1px] py-[10px] bg-[#09090b] w-[90%] rounded-md flex flex-col gap-2 justify-center items-center'>
                    <h3 className='text-2xl font-bold bg-zinc-900 text-white'>Groups</h3>
                    <div className='w-[21vw] h-[0.5px] bg-zinc-700'></div>
                    <div className="h-[71vh] overflow-y-scroll bg-[#09090b]">
                        <div className="flex flex-col">
                        {Array.isArray(teamData?.teamTitle) && teamData.teamTitle.length > 0 ? (
                            teamData.teamTitle.map((item, index) => (
                                <TeamList
                                    key={index}
                                    listName={item.team_title}
                                    handleClick={() => handleRoute(item.team_title)}
                                />
                            ))
                        ) : (
                            <div className="text-white">No lists available</div>
                        )}
                        </div>
                    </div>
                </div>
                <div className='fixed bottom-4'>
                    <DialogDemoTeam email={session?.user?.email} />
                </div>
            </div>

            {/* My Page */}
            <div>
                
            </div>
            <div className='h-auto w-auto bg-[#09090b] m-2 flex flex-col items-start gap-6 pt-[50px]'>
                <div className="flex items-center gap-2 mx-3">
                    <Button 
                        variant="outline" 
                        onClick={handleSort} 
                        className="text-black flex items-center gap-2"
                    >
                        Sort by Priority 
                        {sortDirection === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                        ) : (
                            <ArrowDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <div className='h-auto w-auto bg-[#09090b] m-2 flex flex-col items-start gap-6'>
                    {Array.isArray(sortedTasks) && sortedTasks.length > 0 ? (
                        sortedTasks.map((item, index) => (
                            <MyTeamCard
                                myTeamTask={sortedTasks}
                                key={index}
                                keye={index}
                                teamName={params.teamId}
                                handleClick={() => handleRoute(item.name)}
                            />
                        ))
                    ) : (
                        <EmptyCard />
                    )}
                </div>
            </div>

            {/* Task Detail */}
            <div className='h-[90.8vh] w-[35vw] rounded-md bg-[#09090b] top-[55px] left-[10px] sticky m-2 flex flex-col border border-zinc-800 overflow-hidden'>
        {task && (
          <>
            <div className='bg-zinc-800 p-4 flex justify-between items-center'>
              <div className="flex items-center space-x-3">
                <img className='w-10 h-10 rounded-full' src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${task.assigner_id}`} alt="" />
                <h1 className='text-xl font-semibold text-white truncate'>{task.title}</h1>
              </div>
              <div className='flex space-x-2'>
                <Trash2 className="text-zinc-400 hover:text-red-500 cursor-pointer transition-colors" />
                <Menu className="text-zinc-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
            <div className='flex-grow overflow-y-auto'>
              <div className='p-6 space-y-6'>
                <div>
                  <h2 className='text-lg font-semibold text-zinc-300 mb-2'>Description</h2>
                  <p className='text-zinc-400 whitespace-pre-wrap'>{task.descrption}</p>
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-zinc-300 mb-2'>Status</h2>
                  <div className='flex items-center space-x-4'>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'Completed' ? 'bg-green-500 text-green-100' :
                      task.status === 'In Progress' ? 'bg-yellow-500 text-yellow-100' :
                      'bg-red-500 text-red-100'
                    }`}>
                      {task.status}
                    </span>
                    <Select onValueChange={handleStatusChange} defaultValue={task.status}>
                      <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 text-white">
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-zinc-300 mb-2'>Priority</h2>
                  <div className={`flex items-center space-x-2 p-2 rounded-md ${
                    task.priority === 1 ? 'bg-blue-500/20 text-blue-400' :
                    task.priority === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {task.priority === 1 && <><ArrowDown /> <span>Low Priority</span></>}
                    {task.priority === 2 && <><ArrowRight /> <span>Medium Priority</span></>}
                    {task.priority === 3 && <><ArrowUp /> <span>High Priority</span></>}
                  </div>
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-zinc-300 mb-2'>Assigned To</h2>
                  <div className='space-y-2'>
                    {Array.isArray(assignedData?.tasksWithAssignedImages) && assignedData.tasksWithAssignedImages.length > 0 ? (
                      assignedData.tasksWithAssignedImages.map((assigned, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <img className='w-8 h-8 rounded-full' src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${assigned.assigner_id}`} alt="" />
                          <span className="text-zinc-300">{assigned.assigner_name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-zinc-400">No one is assigned to this task</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='bg-zinc-800 p-4 flex justify-between items-center text-sm'>
              <div>
                <span className='text-zinc-400'>Created on</span>
                <p className='text-white font-semibold'>{task.start_d.split(' ')[0]}</p>
              </div>
              <div className='text-right'>
                <span className='text-zinc-400'>Due Date</span>
                <p className='text-white font-semibold'>{task.end_d ? task.end_d.split('T')[0] : 'Not set'}</p>
              </div>
            </div>
          </>
        )}
      </div>
            <CreateTeam userMail={session?.user?.email} teamId={params.teamId} />
        </>
    );
};

export default Page;