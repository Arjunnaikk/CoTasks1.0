'use client'

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useGetMyTeamQuery, useGetMyTeamTaskQuery, useGetAssignedQuery } from "@/services/queries";
import { useUpdateTaskStatusMutation, useDeleteTeamTaskMutation, useDeleteTeamMutation } from "@/services/mutations";
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
import { CheckCheck } from "lucide-react";
import { CircleAlert } from "lucide-react";

const ErrorComponent = ({ error }) => <div>Error: {error?.message || "An error occurred"}</div>;

const Page = ({ params }) => {
  const router = useRouter();
  const { data: session } = useSession();
  //if(session === null) return;
  // if(!session) {
  //     router.push('/api/auth/signin');   
  // }
  // Queries
  const { data: myTeamTask, isLoading, error } = useGetMyTeamTaskQuery(session?.user?.email, params.teamId);
  const { data: teamData, isLoading: teamLoading, error: teamError } = useGetMyTeamQuery(session?.user?.email);
  const { data: assignedData, isLoading: teamAssignedLoading, error: teamAssignedError } = useGetAssignedQuery(params.teamId, params.taskId);
  const updateTaskStatusMutation = useUpdateTaskStatusMutation();
  const deleteTeamTaskMutation = useDeleteTeamTaskMutation();
  const deleteTeamMutation = useDeleteTeamMutation();

  const [pageState, setPageState] = useState({
    task: null,
    sortDirection: 'desc',
    tasks: [],
    searchQuery: '',
    sortedTasks: [],
    filteredTasks: [],
    selectedTeam: params.teamId
  });
  console.log("Helooooo000000000000000", teamData)
  console.log("Page State:", pageState.task);
  useEffect(() => {
    if (myTeamTask) {
      console.log("Fetched Tasks:", myTeamTask);
      setPageState((prevState) => ({
        ...prevState,
        tasks: myTeamTask,
        filteredTasks: myTeamTask,
        task: params.taskId
          ? myTeamTask.find((item) => item.task_id === parseInt(params.taskId, 10))
          : prevState.task,
      }));
    }
  }, [myTeamTask, params.taskId]);



  if (isLoading || teamLoading || !myTeamTask || !teamData) return <SkeletonDemo />;
  if (error || teamError) return <ErrorComponent error={error || teamError} />;

  // Handlers
  const handleRoute = (teamTitle, taskId = 10) => {
    setPageState(prev => ({ ...prev, selectedTeam: teamTitle }));
    router.push(`/mygroups/${teamTitle}/task/${taskId}`);
  };

  const handleSort = () => {
    const newDirection = pageState.sortDirection === 'asc' ? 'desc' : 'asc';
    const sortedTasks = [...pageState.filteredTasks].sort((a, b) =>
      newDirection === 'asc' ? a.priority - b.priority : b.priority - a.priority
    );

    setPageState((prev) => ({
      ...prev,
      sortDirection: newDirection,
      filteredTasks: sortedTasks,
    }));
  };

  const handleTeamDelete = async (teamName) => {
    try {
      console.log("helo broda", teamName)
      await deleteTeamMutation.mutateAsync({
        userMail: session?.user?.email,
        teamName: teamName,
      });
      router.push('/mygroups');
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  const handleStatusChange = async (newStatus) => {
    console.log("Work man it aint funny")
    if (!pageState.task) return;

    try {
      // Perform the mutation
      const updatedTask = await updateTaskStatusMutation.mutateAsync({
        user_gmail: session?.user?.email,
        task_name: pageState.task.title, // Assuming the task has a title field
        status: newStatus,
      });
      // Update the state based on the mutation response
      setPageState((prev) => {
        const updatedTasks = prev.tasks.map((t) =>
          t.task_id === prev.task.task_id ? { ...t, status: newStatus } : t
        );
        return {
          ...prev,
          task: { ...prev.task, status: newStatus },
          tasks: updatedTasks,
          filteredTasks: updatedTasks,
        };
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleDelete = async () => {
    if (!pageState.task) return;

    try {
      await deleteTeamTaskMutation.mutateAsync({
        teamName: params.teamId,
        taskId: pageState.task.task_id,
      });

      const updatedTasks = pageState.tasks.filter(t => t.task_id !== pageState.task.task_id);
      setPageState(prev => ({
        ...prev,
        tasks: updatedTasks,
        filteredTasks: updatedTasks,
        task: null
      }));

      router.push(`/mygroups/${params.teamId}/task/0`);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  console.log("taskssss name", params.taskId)

  return (
    <>
      {/* Sidebar */}
      <div className='w-[23vw] h-[90.8vh] bg-[#09090b] top-[55px] sticky rounded-md m-1 flex flex-col items-center gap-3 p-1 border-zinc-800 border-[0.5px]'>
        <div className='h-auto px-[1px] py-[10px] bg-[#09090b] w-[90%] rounded-md flex flex-col gap-2 justify-center items-center'>
          <h3 className='text-2xl font-bold bg-zinc-900 text-white'>Groups</h3>
          <div className='w-[21vw] h-[0.5px] bg-zinc-700'></div>
          <div className="h-[71vh] overflow-y-scroll bg-[#09090b]">
            <div className="flex flex-col">
              {Array.isArray(teamData?.teamTitle) && teamData.teamTitle.length > 0 ? (
                teamData.teamTitle.map((item, index) => (
                  <TeamList
                    key={index}
                    teamName={item.team_title}
                    handleClick={() => handleRoute(item.team_title)}
                    isSelected={pageState.selectedTeam === item.team_title}
                    handleTeamDelete={() => handleTeamDelete(item.team_title)}
                  />
                ))
              ) : (
                <div className="text-white">No lists available</div>
              )}
            </div>
          </div>
        </div>
        <div className='fixed bottom-8'>
          <DialogDemoTeam email={session?.user?.email} username={session?.user?.name} />
        </div>
      </div>

      {/* My Page */}
      <div>
      </div>
      <div className='h-auto w-auto bg-[#09090b] m-2 flex flex-col items-start gap-6 pt-[50px]'>
        <div className="flex items-center gap-2 mx-3">
          {pageState?.filteredTasks?.length > 0 && (
            <Button
              variant="outline"
              onClick={handleSort}
              className="text-black flex items-center gap-2"
            >
              Sort by Priority
              {pageState.sortDirection === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          )}

        </div>
        <div className='h-auto w-auto bg-[#09090b] m-2 flex flex-col items-start gap-6'>
          {Array.isArray(pageState.filteredTasks) && pageState.filteredTasks.length > 0 ? (
            pageState.filteredTasks.map((item, index) => (
              <MyTeamCard
                key={index}
                myTeamTask={pageState.filteredTasks}
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
      {params.taskId === '10' ?
        <div className='h-[90.8vh] w-[35vw] rounded-md bg-[#09090b] top-[55px] left-[10px] sticky m-2 flex flex-col border border-zinc-800 overflow-hidden'>
          <div className="bg-zinc-900  p-4 flex items-end justify-center h-full">
            <div className=' flex justify-between items-center'>
            <CreateTeam userMail={session?.user?.email} teamId={params.teamId} />
            </div>
          </div>
        </div>
        :
        <div className='h-[90.8vh] w-[35vw] rounded-md bg-[#09090b] top-[55px] left-[10px] sticky m-2 flex flex-col border border-zinc-800 overflow-hidden'>
          {pageState.task && (
            <>
              <div className='bg-zinc-800 p-4 flex justify-between items-center'>
                <div className="flex items-center space-x-3">
                  <img className='w-10 h-10 rounded-full' src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${pageState.task.assigner_id}`} alt="" />
                  <h1 className='text-xl font-semibold text-white truncate'>{pageState.task.title}</h1>
                </div>
                <div className='flex space-x-2'>
                  <Trash2 className="text-zinc-400 hover:text-red-500 cursor-pointer transition-colors" />
                </div>
              </div>
              <div className='flex-grow overflow-y-auto'>
                <div className='p-6 space-y-6'>
                  <div className="h-[20vh]">
                    <h2 className='text-lg font-semibold text-zinc-300 mb-2 '>Description</h2>
                    <p className='text-zinc-400'>{pageState.task.descrption}</p>
                  </div>
                  <div>
                    <h2 className='text-lg font-semibold text-zinc-300 mb-2'>Status</h2>
                    <Select onValueChange={handleStatusChange} defaultValue={pageState.task.status}>
                      <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-white">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 text-white">
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="missed">Missed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <h2 className='text-lg font-semibold text-zinc-300 mb-2'>Priority</h2>
                    <div className='p-3 bg-zinc-900 rounded-md'>
                      {pageState.task.priority === 0 && pageState.task.status === 'completed' && (
                        <div className="flex items-center text-green-500">
                          <CheckCheck className="mr-2" />
                          <span className="font-semibold">Task Completed Successfully!</span>
                        </div>
                      )}
                      {pageState.task.priority === 0 && pageState.task.status === 'missed' && (
                        <div className="flex items-center text-red-500">
                          <CircleAlert className="mr-2" />
                          <span className="font-semibold">Deadline Missed - Take Action!</span>
                        </div>
                      )}
                      {pageState.task.priority === 1 && (
                        <div className="flex items-center text-blue-400">
                          <ArrowDown className="mr-2" />
                          <span>Can be addressed later</span>
                        </div>
                      )}
                      {pageState.task.priority === 2 && (
                        <div className="flex items-center text-orange-400">
                          <ArrowRight className="mr-2" />
                          <span>Requires attention soon</span>
                        </div>
                      )}
                      {pageState.task.priority === 3 && (
                        <div className="flex items-center text-purple-400">
                          <ArrowUp className="mr-2" />
                          <span>Immediate action needed</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className='text-lg font-semibold text-zinc-300 mb-2'>Assigned To</h2>
                    <div className='space-y-2'>
                      {Array.isArray(assignedData?.tasksWithAssignedImages) && assignedData.tasksWithAssignedImages.length > 0 ? (
                        assignedData.tasksWithAssignedImages.map((assigned, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <img className='w-8 h-8 rounded-full' src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${assigned.user_id}`} alt="" />
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
                  <p className='text-white font-semibold'>{pageState.task.start_d.split(' ')[0]}</p>
                </div>
                <CreateTeam userMail={session?.user?.email} teamId={params.teamId} />
                <div className='text-right'>
                  <span className='text-zinc-400'>Due Date</span>
                  <p className='text-white font-semibold'>{pageState.task.end_d ? pageState.task.end_d.split('T')[0] : 'Not set'}</p>
                </div>
              </div>
            </>
          )}
        </div>}
    </>
  );
};

export default Page;