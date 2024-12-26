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
            <div className='h-[90.8vh] w-[35vw] rounded-md bg-[#09090b] top-[55px] left-[10px] sticky m-2 flex flex-col border border-zinc-800'>
                <div className='text-white flex justify-between m-1 p-3 cursor-pointer'>
                    <Trash2 />
                    <Menu />
                </div>
                <div className='h-[1px] w-full bg-zinc-800'></div>
                {task && (
                    <>
                        <div className='flex flex-row p-1 justify-between'>
                            <div className="flex flex-row">
                                <img className='mx-1 my-2 w-[50px] h-[50px]' src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${task.assigner_id}`} alt="" />
                                <h1 className='text-2xl font-semibold text-white flex p-2 items-center'>{task.title}</h1>
                            </div>
                            <div className='text-white font-thin text-xs flex m-2 items-end'>
                                <p>{task.start_d.split(' ')[0]}</p>
                            </div>
                        </div>
                        <div className='h-[1px] w-full bg-zinc-800'></div>
                        <div className='min-h-[20vh] text-sm font-inter text-white flex p-3'>
                            <span>{task.descrption}</span>
                        </div>
                        <div className='h-[1px] w-full bg-zinc-800'></div>
                        <div className='min-h-[10vh] text-sm font-inter text-white flex flex-col p-3 gap-2'>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">Status:</span>
                                <span>{task.status}</span>
                            </div>
                            <div className="flex items-center gap-2">
                            <span>Update Status:</span>
                            <Select onValueChange={handleStatusChange} defaultValue={task.status}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        </div>
                        <div className='h-[1px] w-full bg-zinc-800'></div>
                        <div className='p-3 text-white flex flex-row'>
                            {task.priority === 1 && <span>Priority : Low <ArrowDown /></span>}
                            {task.priority === 2 && <span>Priority : Mid <ArrowRight /></span>}
                            {task.priority === 3 && <span>Priority : High <ArrowUp /></span>}
                        </div>
                        <div className='h-[1px] w-full bg-zinc-800'></div>
                        <div className='p-3 text-white flex flex-col items-center'>
                            <p>Assigned To</p>
                            <div className='h-[1px] w-[50%] bg-zinc-800'></div>
                            {Array.isArray(assignedData?.tasksWithAssignedImages) && assignedData.tasksWithAssignedImages.length > 0 ? (
                                assignedData.tasksWithAssignedImages.map((assigned, index) => (
                                    <div key={index}>
                                        <span>{assigned.assigner_name}</span>
                                    </div>
                                ))
                            ) : (
                                <span>No one is assigned to this task</span>
                            )}
                        </div>
                    </>
                )}
            </div>
            <CreateTeam userMail={session?.user?.email} teamId={params.teamId} />
        </>
    );
};

export default Page;