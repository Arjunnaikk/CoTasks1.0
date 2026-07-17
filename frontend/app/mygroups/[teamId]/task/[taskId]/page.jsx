'use client'

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useGetMyTeamQuery, useGetMyTeamTaskQuery, useGetAssignedQuery, useGetTeamMembersQuery, useGetUnreadCountsQuery } from "@/services/queries";
import { useUpdateTaskStatusMutation, useDeleteTeamTaskMutation, useDeleteTeamMutation, usePingUserMutation } from "@/services/mutations";
import TeamChat from '@/components/TeamChat';
import SubtaskList from '@/components/SubtaskList';
import TaskComments from '@/components/TaskComments';
import ActivityFeed from '@/components/ActivityFeed';
import TeamMembersList from '@/components/TeamMembersList';
import { Trash2, Menu, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import CreateTeam from '@/components/CreateTeam';
import MyTeamCard from '@/components/MyTeamCard';
import TeamList from '@/components/TeamList';
import EmptyCard from '@/components/EmptyCard';
import DialogDemoTeam from '@/components/DialogDemoTeam';
import SkeletonDemo from "@/components/SkeletonDemo";
import { CheckCheck } from "lucide-react";
import { CircleAlert } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import AlertDialogDemo from "@/components/AlertDialogDemo";
import { Search } from "lucide-react";
const ErrorComponent = ({ error }) => <div>Error: {error?.message || "An error occurred"}</div>;

const Page = ({ params }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  //if(session === null) return;
  // if(!session) {
  //     router.push('/api/auth/signin');   
  // }
  // Queries
  const { data: myTeamTask, isLoading, error } = useGetMyTeamTaskQuery(session?.user?.email, params.teamId);
  const { data: teamData, isLoading: teamLoading, error: teamError } = useGetMyTeamQuery(session?.user?.email);
  const { data: assignedData, isLoading: teamAssignedLoading, error: teamAssignedError } = useGetAssignedQuery(params.teamId, params.taskId);
  const { data: unreadData } = useGetUnreadCountsQuery(session?.user?.email);
  const unreadCounts = unreadData?.unreadCounts || {};
  const activeTeamUnreadCount = unreadCounts[params.teamId] || 0;
  const { data: teamMembersData, isLoading: teamMembersLoading } = useGetTeamMembersQuery(params.teamId);
  const updateTaskStatusMutation = useUpdateTaskStatusMutation();
  const deleteTeamTaskMutation = useDeleteTeamTaskMutation();
  const deleteTeamMutation = useDeleteTeamMutation();
  const pingUserMutation = usePingUserMutation();

  // Periodic user presence ping
  useEffect(() => {
    if (!session?.user?.email) return;
    const sendPing = () => {
      pingUserMutation.mutate({ userGmail: session.user.email });
    };
    sendPing();
    const interval = setInterval(sendPing, 15000);
    return () => clearInterval(interval);
  }, [session?.user?.email]);

  // Alert for team tasks due soon
  useEffect(() => {
    if (!myTeamTask || myTeamTask.length === 0) return;
    const soonTasks = myTeamTask.filter(t => {
      if (t.status === 'completed' || !t.end_d) return false;
      const diff = new Date(t.end_d).getTime() - new Date().getTime();
      return diff > 0 && diff < 24 * 60 * 60 * 1000;
    });
    if (soonTasks.length > 0) {
      toast({
        title: "⚠️ Tasks Due Soon!",
        description: `You have ${soonTasks.length} group task(s) ending within 24 hours.`,
        variant: "destructive",
      });
    }
  }, [myTeamTask, toast]);

  const isUserOnline = (lastActiveStr) => {
    if (!lastActiveStr) return false;
    try {
      const utcStr = lastActiveStr.replace(' ', 'T') + 'Z';
      const lastActive = new Date(utcStr);
      const diff = new Date().getTime() - lastActive.getTime();
      return diff < 40000;
    } catch (e) {
      return false;
    }
  };

  const isAssigneeOnlineById = (assigneeUserId) => {
    const member = teamMembersData?.members?.find(m => m.user_id === assigneeUserId);
    return member ? isUserOnline(member.last_active_at) : false;
  };

  const [activeTab, setActiveTab] = useState(params.taskId === '10' ? 'chat' : 'task');

  // Sync activeTab when taskId changes: if user clicks a task, switch to 'task' tab
  useEffect(() => {
    if (params.taskId !== '10') {
      setActiveTab('task');
    } else {
      setActiveTab('chat');
    }
  }, [params.taskId]);

  const currentUser = teamMembersData?.members?.find(m => m.gmail === session?.user?.email);
  const currentUserId = currentUser?.user_id || 0;

  const [pageState, setPageState] = useState({
    task: null,
    sortDirection: 'desc',
    tasks: [],
    searchQuery: '',
    sortedTasks: [],
    filteredTasks: [],
    selectedTeam: params.teamId,
    priorityFilter: 'all'
  });

  useEffect(() => {
    const filtered = pageState.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(pageState.searchQuery.toLowerCase()) ||
        task.descrption.toLowerCase().includes(pageState.searchQuery.toLowerCase());
      const matchesPriority = pageState.priorityFilter === 'all' || task.priority === parseInt(pageState.priorityFilter, 10);
      return matchesSearch && matchesPriority;
    });
    setPageState(prev => ({ ...prev, filteredTasks: filtered }));
  }, [pageState.searchQuery, pageState.priorityFilter, pageState.tasks]);

    

  useEffect(() => {
    if (myTeamTask) {
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



  if (isLoading || teamLoading || teamMembersLoading || !myTeamTask || !teamData) return <SkeletonDemo />;
  if (error || teamError) return <ErrorComponent error={error || teamError} />;

    const handleSearch = (e) => {
    setPageState(prev => ({ ...prev, searchQuery: e.target.value }));
  };
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
      await deleteTeamMutation.mutateAsync({
        userMail: session?.user?.email,
        teamName: teamName,
      });
      router.push('/mygroups');
      toast({
        title: "Team deleted successfully",
        description: "Your team has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleStatusChange = async (newStatus) => {
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
      toast({
        title: "Task Deleted",
        description: "Task has been deleted successfully!",
        variant: "dark",
      });

      router.push(`/mygroups/${params.teamId}/task/0`);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };


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
                    unreadCount={unreadCounts[item.team_title] || 0}
                    isAdmin={item.role === 'admin'}
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
      <div className='h-auto w-auto bg-[#09090b] m-2 flex flex-col items-start gap-6 pt-[50px]'>
        <div className="w-full mb-3 px-3 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-grow w-full">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={pageState.searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-[#18181b] text-white border-zinc-750 rounded-md focus:border-purple-500/50"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {/* Priority Filter Select */}
            <Select
              value={pageState.priorityFilter}
              onValueChange={(val) => setPageState(prev => ({ ...prev, priorityFilter: val }))}
            >
              <SelectTrigger className="w-[130px] bg-[#18181b] border-zinc-750 text-zinc-300">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="1">Low Priority</SelectItem>
                <SelectItem value="2">Mid Priority</SelectItem>
                <SelectItem value="3">High Priority</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Button */}
            <Button
              variant="default"
              onClick={handleSort}
              className="bg-[#18181b] border border-zinc-750 text-white hover:bg-zinc-800 flex items-center gap-2 h-9 px-3 shrink-0"
            >
              Sort
              {pageState.sortDirection === 'asc' ? (
                <ArrowUp className="h-3.5 w-3.5" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
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
      <div className='h-[90.8vh] w-[35vw] rounded-md bg-[#09090b] top-[55px] left-[10px] sticky m-2 flex flex-col border border-zinc-800 overflow-hidden'>
        {/* Tab Switcher Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 p-3 flex items-center justify-between shrink-0">
          <div className="flex space-x-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
            {params.taskId !== '10' && (
              <button
                type="button"
                onClick={() => setActiveTab('task')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                  activeTab === 'task'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Task Details
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Group Chat
              {activeTab !== 'chat' && activeTeamUnreadCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                activeTab === 'activity'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Activity Feed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                activeTab === 'members'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Members
            </button>
          </div>

          {/* Action Buttons: Add Task & Delete Task */}
          <div className="flex items-center gap-2">
            {params.taskId === '10' && (
              <CreateTeam userMail={session?.user?.email} teamId={params.teamId} />
            )}
            
            {activeTab === 'task' && pageState.task && (
              <AlertDialogDemo
                isSelected2={true}
                handleListDelete={handleDelete}
                dialogTitle="Delete this task?"
                dialogDescription="This action cannot be undone. This will permanently delete this task and all associated data."
              />
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-grow overflow-hidden flex flex-col h-full">
          {activeTab === 'task' && pageState.task ? (
            <>
              {/* Task Details Header */}
              <div className="bg-zinc-900/50 p-4 border-b border-zinc-800/50 flex items-center space-x-3">
                <img
                  className='w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900'
                  src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${pageState.task.assigner_id}`}
                  alt=""
                />
                <h1 className='text-lg font-semibold text-white truncate'>{pageState.task.title}</h1>
              </div>

              {/* Task Details Content */}
              <div className='flex-grow overflow-y-auto p-6 space-y-6'>
                <div>
                  <h2 className='text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider'>Description</h2>
                  <p className='text-zinc-300 leading-relaxed max-h-[15vh] overflow-y-auto pr-1'>{pageState.task.descrption}</p>
                </div>

                <div>
                  <h2 className='text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider'>Status</h2>
                  <div className="grid grid-cols-3 bg-zinc-950 border border-zinc-900 p-1.5 rounded-xl w-full gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStatusChange("ongoing")}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                        pageState.task.status === "ongoing"
                          ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/10"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
                      }`}
                    >
                      Ongoing
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("completed")}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                        pageState.task.status === "completed"
                          ? "bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/10"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("missed")}
                      className={`py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                        pageState.task.status === "missed"
                          ? "bg-rose-500 text-zinc-950 font-bold shadow-md shadow-rose-500/10"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
                      }`}
                    >
                      Missed
                    </button>
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider'>Priority</h2>
                  <div className='p-3 bg-zinc-900/80 rounded-md border border-zinc-800/50'>
                    {pageState.task.priority === 0 && pageState.task.status === 'completed' && (
                      <div className="flex items-center text-green-500">
                        <CheckCheck className="mr-2 h-4 w-4" />
                        <span className="font-semibold">Task Completed Successfully!</span>
                      </div>
                    )}
                    {pageState.task.priority === 0 && pageState.task.status === 'missed' && (
                      <div className="flex items-center text-red-500">
                        <CircleAlert className="mr-2 h-4 w-4" />
                        <span className="font-semibold">Deadline Missed - Take Action!</span>
                      </div>
                    )}
                    {pageState.task.priority === 1 && (
                      <div className="flex items-center text-blue-400">
                        <ArrowDown className="mr-2 h-4 w-4" />
                        <span>Can be addressed later</span>
                      </div>
                    )}
                    {pageState.task.priority === 2 && (
                      <div className="flex items-center text-orange-400">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        <span>Requires attention soon</span>
                      </div>
                    )}
                    {pageState.task.priority === 3 && (
                      <div className="flex items-center text-purple-400">
                        <ArrowUp className="mr-2 h-4 w-4" />
                        <span>Immediate action needed</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className='text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider'>Assigned To</h2>
                  <div className='space-y-2 max-h-32 overflow-y-auto pr-1'>
                    {Array.isArray(assignedData?.tasksWithAssignedImages) && assignedData.tasksWithAssignedImages.length > 0 ? (
                      assignedData.tasksWithAssignedImages.map((assigned, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-zinc-900/40 p-2 rounded-lg border border-zinc-850">
                          <div className="relative shrink-0">
                            <img className='w-6 h-6 rounded-full bg-zinc-850' src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${assigned.user_id}`} alt="" />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-[#09090b] ${
                              isAssigneeOnlineById(assigned.user_id) ? 'bg-emerald-500' : 'bg-zinc-600'
                            }`} />
                          </div>
                          <span className="text-sm text-zinc-300">{assigned.assigner_name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-500">No one is assigned to this task</span>
                    )}
                  </div>
                </div>

                {/* Subtasks Checklist */}
                <div className="border-t border-zinc-800/60 pt-4">
                  <SubtaskList 
                    taskId={pageState.task.task_id} 
                    userGmail={session?.user?.email} 
                  />
                </div>

                {/* Task Comments / Discussions */}
                <div className="border-t border-zinc-800/60 pt-4">
                  <TaskComments 
                    taskId={pageState.task.task_id} 
                    userGmail={session?.user?.email} 
                  />
                </div>
              </div>

              {/* Task Details Footer */}
              <div className='bg-zinc-900 border-t border-zinc-800 p-4 flex justify-between items-center text-xs'>
                <div>
                  <span className='text-zinc-500 block mb-0.5'>Created on</span>
                  <p className='text-white font-semibold'>{pageState.task.start_d.split(' ')[0]}</p>
                </div>
                <CreateTeam userMail={session?.user?.email} teamId={params.teamId} />
                <div className='text-right'>
                  <span className='text-zinc-500 block mb-0.5'>Due Date</span>
                  <p className='text-white font-semibold'>{pageState.task.end_d ? pageState.task.end_d.split('T')[0] : 'Not set'}</p>
                </div>
              </div>
            </>
          ) : activeTab === 'chat' ? (
            <div className="flex-grow flex flex-col overflow-hidden h-full">
              <TeamChat
                teamName={params.teamId}
                userGmail={session?.user?.email}
                userId={currentUserId}
              />
            </div>
          ) : activeTab === 'activity' ? (
            <div className="flex-grow flex flex-col overflow-hidden h-full">
              <ActivityFeed teamName={params.teamId} />
            </div>
          ) : activeTab === 'members' ? (
            <div className="flex-grow flex flex-col overflow-hidden h-full">
              <TeamMembersList teamName={params.teamId} currentUserEmail={session?.user?.email} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-[#09090b] text-zinc-400 p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-1">No Task Selected</h3>
              <p className="text-xs text-zinc-500 mb-6 max-w-xs">Select a task from the list or create a new one to view its details.</p>
              <CreateTeam userMail={session?.user?.email} teamId={params.teamId} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;