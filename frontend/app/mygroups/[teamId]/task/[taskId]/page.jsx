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
import { Trash2, Menu, ArrowUp, ArrowDown, ArrowRight, Search, Calendar, Bell, SlidersHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import CreateTeam from '@/components/CreateTeam';
import MyTeamCard from '@/components/MyTeamCard';
import TeamList from '@/components/TeamList';
import EmptyCard from '@/components/EmptyCard';
import SkeletonDemo from "@/components/SkeletonDemo";
import DialogDemoTeam from '@/components/DialogDemoTeam';
import { CheckCheck } from "lucide-react";
import { CircleAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AlertDialogDemo from "@/components/AlertDialogDemo";
import { deleteCalendarEvent, updateCalendarEvent } from "@/lib/gcalendar";

const ErrorComponent = ({ error }) => <div className="text-red-500 p-4">Error: {error?.message || "An error occurred"}</div>;

const statusConfig = {
  backlog: { label: "Backlog", color: "bg-zinc-500" },
  in_progress: { label: "In Progress", color: "bg-sky-500" },
  ongoing: { label: "Ongoing", color: "bg-amber-500" },
  in_review: { label: "In Review", color: "bg-purple-500" },
  blocked: { label: "Blocked", color: "bg-rose-650" },
  completed: { label: "Completed", color: "bg-emerald-500" },
  missed: { label: "Missed", color: "bg-rose-550" },
};

const Page = ({ params }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState(params.taskId === '10' ? 'chat' : 'task');

  // Sync activeTab when taskId changes
  useEffect(() => {
    if (params.taskId && params.taskId !== '10') {
      setActiveTab('task');
    } else {
      setActiveTab('chat');
    }
  }, [params.taskId]);

  // Queries
  const { data: teamData, isLoading: teamLoading, error: teamError } = useGetMyTeamQuery(session?.user?.email);
  const { data: myTeamTask, isLoading, error } = useGetMyTeamTaskQuery(session?.user?.email, params.teamId);
  const { data: unreadCounts = {} } = useGetUnreadCountsQuery(session?.user?.email);
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
    priorityFilter: 'all',
    statusFilter: 'all',
    dueSoonFilter: false
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const filtered = pageState.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(pageState.searchQuery.toLowerCase()) ||
        task.descrption.toLowerCase().includes(pageState.searchQuery.toLowerCase());
      
      const matchesPriority = pageState.priorityFilter === 'all' || task.priority === parseInt(pageState.priorityFilter, 10);
      
      const matchesStatus = pageState.statusFilter === 'all' || task.status === pageState.statusFilter;
      
      let matchesDueSoon = true;
      if (pageState.dueSoonFilter) {
        if (!task.end_d || task.status === 'completed') {
          matchesDueSoon = false;
        } else {
          const diff = new Date(task.end_d).getTime() - new Date().getTime();
          matchesDueSoon = diff > 0 && diff < 24 * 60 * 60 * 1000;
        }
      }

      return matchesSearch && matchesPriority && matchesStatus && matchesDueSoon;
    });
    setPageState(prev => ({ ...prev, filteredTasks: filtered }));
  }, [pageState.searchQuery, pageState.priorityFilter, pageState.statusFilter, pageState.dueSoonFilter, pageState.tasks]);

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

  const activeFiltersCount = (pageState.priorityFilter !== 'all' ? 1 : 0) + 
                             (pageState.statusFilter !== 'all' ? 1 : 0) + 
                             (pageState.dueSoonFilter ? 1 : 0);

  if (isLoading || teamLoading || teamMembersLoading || !myTeamTask || !teamData) return <SkeletonDemo />;
  if (error || teamError) return <ErrorComponent error={error || teamError} />;

  const handleSearch = (e) => {
    setPageState(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleRoute = (name) => {
    setPageState(prev => ({ ...prev, selectedTeam: name }));
    router.push(`/mygroups/${name}/task/10`);
  };

  const handleRoute2 = (name, taskId) => {
    router.push(`/mygroups/${name}/task/${taskId}`);
  };

  const handleSort = () => {
    const newDirection = pageState.sortDirection === 'asc' ? 'desc' : 'asc';
    const sortedTasks = [...pageState.filteredTasks].sort((a, b) => {
      return newDirection === 'asc' ? 
        a.priority - b.priority : 
        b.priority - a.priority;
    });

    setPageState(prev => ({
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
      await updateTaskStatusMutation.mutateAsync({
        user_gmail: session?.user?.email,
        task_name: pageState.task.title,
        status: newStatus,
      });

      if (session?.accessToken && pageState.task.gcal_event_id) {
        const displayTitle = newStatus === 'completed'
          ? `[Completed] ${pageState.task.title}`
          : pageState.task.title;
        await updateCalendarEvent(session.accessToken, pageState.task.gcal_event_id, {
          title: displayTitle,
          descrption: pageState.task.descrption,
          start_d: pageState.task.start_d,
          end_d: pageState.task.end_d,
        });
      }

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
      if (session?.accessToken && pageState.task.gcal_event_id) {
        await deleteCalendarEvent(session.accessToken, pageState.task.gcal_event_id);
      }

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

      router.push(`/mygroups/${params.teamId}/task/10`);
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
    <div className="flex flex-row flex-1 w-full min-w-0 bg-[#09090b] h-full overflow-hidden">
      {/* Sidebar (Groups) */}
      <div className="w-[280px] h-full bg-[#09090b]/30 border-r border-zinc-900 flex flex-col p-4 shrink-0 justify-between">
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Collaborative Groups</h3>
          </div>
          <div className="w-full h-px bg-zinc-900"></div>
          <div className="flex-1 overflow-y-auto min-h-0 pr-1">
            <div className="flex flex-col w-full gap-1">
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
                <div className="text-zinc-500 text-xs py-4 text-center">No lists available</div>
              )}
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-zinc-900 w-full flex justify-center shrink-0">
          <DialogDemoTeam email={session?.user?.email} username={session?.user?.name} />
        </div>
      </div>

      {/* Tasks List Column (Middle) */}
      <div className="flex-1 h-full border-r border-zinc-900 flex flex-col p-6 bg-zinc-950/10 overflow-y-auto">
        {/* Search Row */}
        <div className="w-full flex items-center gap-2 mb-3">
          {/* Text Search */}
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={pageState.searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 h-9 bg-[#18181b] text-white border-zinc-800 rounded-md text-xs focus:border-purple-500/50"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-3.5 w-3.5" />
          </div>

          {/* Sort Button */}
          <Button
            variant="default"
            onClick={handleSort}
            className="bg-[#18181b] border border-zinc-800 text-white hover:bg-zinc-800 flex items-center gap-1.5 h-9 px-3 text-xs rounded-md shrink-0"
          >
            <span>Sort</span>
            {pageState.sortDirection === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )}
          </Button>

          {/* Toggle Extra Filters Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 w-9 p-0 flex items-center justify-center rounded-md transition-all duration-200 border-zinc-800 shrink-0 ${
              showFilters || pageState.priorityFilter !== 'all' || pageState.statusFilter !== 'all' || pageState.dueSoonFilter
                ? 'bg-purple-950/20 text-purple-400 border-purple-500/30' 
                : 'bg-[#18181b] text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Collapsible Filters Panel */}
        {showFilters && (
          <div className="w-full mb-3 flex flex-wrap items-center gap-2 p-1.5 bg-zinc-950/40 border border-zinc-900 rounded-md animate-in fade-in slide-in-from-top-1 duration-150 shrink-0">
            {/* Priority Filter */}
            <Select
              value={pageState.priorityFilter}
              onValueChange={(val) => setPageState(prev => ({ ...prev, priorityFilter: val }))}
            >
              <SelectTrigger className="w-[120px] h-8 bg-[#18181b] border-zinc-800 text-zinc-300 text-xs rounded-md px-2">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-900 text-white text-xs">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="1">Low Priority</SelectItem>
                <SelectItem value="2">Mid Priority</SelectItem>
                <SelectItem value="3">High Priority</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={pageState.statusFilter}
              onValueChange={(val) => setPageState(prev => ({ ...prev, statusFilter: val }))}
            >
              <SelectTrigger className="w-[130px] h-8 bg-[#18181b] border-zinc-800 text-zinc-300 text-xs rounded-md px-2">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-900 text-white text-xs">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
              </SelectContent>
            </Select>

            {/* Due Soon Toggle */}
            <Button
              variant="outline"
              onClick={() => setPageState(prev => ({ ...prev, dueSoonFilter: !prev.dueSoonFilter }))}
              className={`h-8 px-2.5 text-xs flex items-center gap-1.5 rounded-md transition-all duration-200 border-zinc-800 ${
                pageState.dueSoonFilter 
                  ? 'bg-red-950/30 text-red-400 border-red-500/40 hover:bg-red-950/50' 
                  : 'bg-[#18181b] text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <Bell className={`h-3.5 w-3.5 ${pageState.dueSoonFilter ? 'text-red-400 animate-pulse' : 'text-zinc-400'}`} />
              <span>Due Soon</span>
            </Button>

            {/* Clear Button */}
            {(pageState.priorityFilter !== 'all' || pageState.statusFilter !== 'all' || pageState.dueSoonFilter) && (
              <Button
                variant="ghost"
                onClick={() => setPageState(prev => ({ ...prev, priorityFilter: 'all', statusFilter: 'all', dueSoonFilter: false }))}
                className="h-8 px-2 text-[10px] text-zinc-500 hover:text-zinc-300 hover:bg-transparent ml-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Task Cards Container */}
        <div className="flex-1 overflow-y-auto w-full pr-1 max-h-[80vh]">
          {Array.isArray(pageState.filteredTasks) && pageState.filteredTasks.length > 0 ? (
            <div className="flex flex-col gap-3">
              {pageState.filteredTasks.map((item, index) => (
                <MyTeamCard
                  key={item.task_id}
                  myTeamTask={pageState.filteredTasks}
                  keye={index}
                  teamName={params.teamId}
                  handleClick={() => handleRoute2(params.teamId, item.task_id)}
                />
              ))}
            </div>
          ) : (
            <EmptyCard />
          )}
        </div>
      </div>

      {/* Task Detail / Chat / Feed Panel */}
      <div className="w-full lg:w-[42vw] xl:w-[500px] shrink-0 h-auto lg:h-[90.8vh] rounded-2xl bg-[#09090b]/80 backdrop-blur-xl lg:sticky lg:top-[55px] m-1.5 flex flex-col border border-zinc-800/80 overflow-hidden shadow-lg shadow-black/20">
        {/* Tab Switcher Header */}
        <div className="bg-zinc-900/40 border-b border-zinc-800 p-3 flex items-center justify-between shrink-0">
          <div className="flex flex-nowrap overflow-x-auto scrollbar-none gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80">
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
          <div className="flex items-center gap-2 shrink-0 ml-2">
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
              <div className="bg-zinc-900/50 p-4 border-b border-zinc-800/50 flex items-center space-x-3 shrink-0">
                <img
                  className='w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900'
                  src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${pageState.task.assigner_id}`}
                  alt=""
                />
                <h1 className='text-lg font-semibold text-white truncate'>{pageState.task.title}</h1>
              </div>

              {/* Task Details Content */}
              <div className='flex-grow overflow-y-auto p-5 space-y-6'>
                <div>
                  <h2 className='text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider'>Description</h2>
                  <p className='text-sm text-zinc-300 leading-relaxed bg-zinc-900/10 p-3 rounded-lg border border-zinc-900'>{pageState.task.descrption}</p>
                </div>

                {/* Status selector (Dropdown) */}
                <div>
                  <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Status</h2>
                  <Select
                    value={pageState.task.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full h-10 bg-[#18181b] border border-zinc-900 text-zinc-200 text-xs rounded-xl focus:ring-1 focus:ring-purple-500/50 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${statusConfig[pageState.task.status]?.color || 'bg-zinc-500'}`}></span>
                        <SelectValue placeholder="Select status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border border-zinc-900 text-white text-xs rounded-xl">
                      {Object.entries(statusConfig).map(([value, cfg]) => (
                        <SelectItem key={value} value={value} className="focus:bg-zinc-900 focus:text-white rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.color}`}></span>
                            <span>{cfg.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div>
                  <h2 className='text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2'>Priority</h2>
                  <div className='p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg'>
                    {pageState.task.status === 'completed' ? (
                      <div className="flex items-center text-emerald-500 text-xs font-medium">
                        <CheckCheck className="mr-2 h-4 w-4" />
                        <span>Task Completed Successfully</span>
                      </div>
                    ) : pageState.task.status === 'missed' ? (
                      <div className="flex items-center text-rose-500 text-xs font-medium">
                        <CircleAlert className="mr-2 h-4 w-4 animate-bounce" />
                        <span>Deadline Missed - Take Action</span>
                      </div>
                    ) : (
                      <>
                        {pageState.task.priority === 1 && (
                          <div className="flex items-center text-blue-400 text-xs">
                            <ArrowDown className="mr-2 h-4 w-4" />
                            <span>Can be addressed later</span>
                          </div>
                        )}
                        {pageState.task.priority === 2 && (
                          <div className="flex items-center text-orange-400 text-xs">
                            <ArrowRight className="mr-2 h-4 w-4" />
                            <span>Requires attention soon</span>
                          </div>
                        )}
                        {pageState.task.priority === 3 && (
                          <div className="flex items-center text-purple-400 text-xs">
                            <ArrowUp className="mr-2 h-4 w-4" />
                            <span>Immediate action needed</span>
                          </div>
                        )}
                        {(!pageState.task.priority || pageState.task.priority === 0) && (
                          <span className="text-zinc-500 text-xs">No priority set</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Subtask Accordion Checklist */}
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
              <div className='bg-zinc-900 border-t border-zinc-800 p-4 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider shrink-0 text-zinc-500'>
                <div>
                  <span className='block mb-0.5 text-zinc-500'>Created</span>
                  <p className='text-zinc-300 font-semibold'>{pageState.task.start_d.split(' ')[0]}</p>
                </div>
                <CreateTeam userMail={session?.user?.email} teamId={params.teamId} />
                <div className='text-right'>
                  <span className='block mb-0.5 text-zinc-500'>Due Date</span>
                  <p className='text-zinc-300 font-semibold'>{pageState.task.end_d ? pageState.task.end_d.split('T')[0] : 'Not set'}</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-md font-medium text-zinc-500 mb-1">No group active</h3>
              <p className="text-xs text-zinc-600 max-w-xs mx-auto">Select a task or switch tabs to interact with group members and view notifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;