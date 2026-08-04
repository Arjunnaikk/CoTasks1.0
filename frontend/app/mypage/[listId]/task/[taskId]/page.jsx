'use client'

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useGetMyTaskQuery, useGetListQuery } from "@/services/queries";
import { useDeleteMyTaskMutation, useUpdateTaskStatusMutation, useDeleteListMutation } from "@/services/mutations";
import { ArrowUp, ArrowDown, ArrowRight, Menu, Trash2, Search, Calendar, Bell, SlidersHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

import Create from '@/components/Create';
import Cards from '@/components/Cards';
import DialogDemo from '@/components/DialogDemo';
import List from "@/components/List";
import EmptyCard from '@/components/EmptyCard';
import SkeletonDemo from "@/components/SkeletonDemo";
import { Input } from "@/components/ui/input";
import { CheckCheck } from "lucide-react";
import { CircleAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AlertDialogDemo from "@/components/AlertDialogDemo";

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
  const {toast} = useToast();
  const { data: session, status } = useSession();
  
  const [pageState, setPageState] = useState({
    task: null,
    sortDirection: 'desc',
    tasks: [],
    searchQuery: '',
    filteredTasks: [],
    selectedList: params.listId,
    priorityFilter: 'all',
    statusFilter: 'all',
    dueSoonFilter: false
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  const { 
    data: myTask, 
    isLoading, 
    error 
  } = useGetMyTaskQuery(session?.user?.email, params.listId);

  const { 
    data: listData, 
    isLoading: listLoading, 
    error: listError 
  } = useGetListQuery(session?.user?.email);

  const deleteTaskMutation = useDeleteMyTaskMutation();
  const updateTaskStatusMutation = useUpdateTaskStatusMutation();
  const deleteListMutation = useDeleteListMutation();

  useEffect(() => {
    if (myTask?.newTask) {
      setPageState(prev => ({
        ...prev,
        tasks: myTask.newTask,
        filteredTasks: myTask.newTask
      }));
    }
  }, [myTask]);

  // Alert for personal tasks due soon
  useEffect(() => {
    if (!myTask?.newTask || myTask.newTask.length === 0) return;
    const soonTasks = myTask.newTask.filter(t => {
      if (t.status === 'completed' || !t.end_d) return false;
      const diff = new Date(t.end_d).getTime() - new Date().getTime();
      return diff > 0 && diff < 24 * 60 * 60 * 1000;
    });
    if (soonTasks.length > 0) {
      toast({
        title: "⚠️ Tasks Due Soon!",
        description: `You have ${soonTasks.length} personal task(s) ending within 24 hours.`,
        variant: "destructive",
      });
    }
  }, [myTask, toast]);

  useEffect(() => {
    if (myTask?.newTask) {
      const currentTask = myTask.newTask.find(
        item => item.task_id === parseInt(params.taskId, 10)
      );
      setPageState(prev => ({ ...prev, task: currentTask }));
    }
  }, [myTask, params.taskId]);

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

  
  const handleRoute = (name, taskId) => {
    setPageState(prev => ({ ...prev, selectedList: name }));
    router.push(`/mypage/${name}/task/${taskId}`);
  };
  
  const handleListDelete = async (listName)=>{
    try{
      await deleteListMutation.mutateAsync({
        userMail: session?.user?.email,
        name: listName,
      },
    {
      onSuccess: () => {
        toast({
          title: "List deleted",
          description: "List deleted successfully",
          variant: "dark",
        });
        router.push('/mypage');
      }
    }
    );
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete list",
        variant: "destructive",
      });
    }
  }

  const handleDelete = async () => {
    if (!pageState.task) return;
    
    try {
      await deleteTaskMutation.mutateAsync({
        userMail: session?.user?.email,
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
        title: "Success",
        description: "Task deleted successfully",
        variant: "dark",
      });
      
      router.push(`/mypage/${params.listId}/task/0`);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!pageState.task) return;
  
    try {
      await updateTaskStatusMutation.mutateAsync({
        user_gmail: session?.user?.email,
        task_name: pageState.task.title,
        status: newStatus,
      });
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
      filteredTasks: sortedTasks
    }));
  };

  const handleSearch = (e) => {
    setPageState(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const activeFiltersCount = (pageState.priorityFilter !== 'all' ? 1 : 0) + 
                             (pageState.statusFilter !== 'all' ? 1 : 0) + 
                             (pageState.dueSoonFilter ? 1 : 0);

  if (isLoading || listLoading) return <SkeletonDemo />;
  if (error || listError) return <ErrorComponent error={error || listError} />;

  return (
    <div className="flex flex-row flex-1 w-full min-w-0 bg-[#09090b] h-full overflow-hidden">
      {/* Sidebar (Lists) */}
      <div className="w-[280px] h-full bg-[#09090b]/30 border-r border-zinc-900 flex flex-col p-4 shrink-0 justify-between">
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">My Lists</h3>
          </div>
          <div className="w-full h-px bg-zinc-900"></div>
          <div className="flex-1 overflow-y-auto min-h-0 pr-1">
            <div className="flex flex-col w-full gap-1">
              {(Array.isArray(listData?.newList) ? listData.newList : []).map((item, index) => (
                <List 
                  key={index} 
                  listName={item.name} 
                  handleClick={() => handleRoute(item.name, 0)}
                  isSelected={pageState.selectedList === item.name}
                  handleListDelete={() => handleListDelete(item.name)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-zinc-900 w-full flex justify-center shrink-0">
          <DialogDemo email={session?.user?.email} />
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
          {pageState.filteredTasks.length > 0 ? (
            <div className="flex flex-col gap-3">
              {pageState.filteredTasks.map((item, index) => (
                <Cards 
                  myTask={{ newTask: pageState.filteredTasks }}
                  keye={index} 
                  key={item.task_id} 
                  listName={params.listId} 
                  handleClick={() => handleRoute(params.listId, item.task_id)}
                  status={item.status}
                />
              ))}
            </div>
          ) : (
            <EmptyCard />
          )}
        </div>
      </div>

      {/* Task Detail Panel */}
      {/* Task Detail Panel */}
      {params.taskId !== '0' && (
        <div className="w-[480px] h-full bg-[#09090b]/40 flex flex-col shrink-0 overflow-y-auto">
          {pageState.task && (
            <>
              {/* Task Title header */}
              <div className="bg-[#09090b]/20 p-4 border-b border-zinc-900 flex justify-between items-center shrink-0">
                <h1 className="text-lg font-bold text-white truncate max-w-[80%]">{pageState.task.title}</h1>
                <AlertDialogDemo 
                  isSelected2={true}
                  handleListDelete={handleDelete}
                />
              </div>

              {/* Task detail body */}
              <div className="flex-grow p-6 space-y-6">
                <div>
                  <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Description</h2>
                  <p className="text-xs text-zinc-350 whitespace-pre-wrap leading-relaxed bg-zinc-900/10 p-3.5 rounded-xl border border-zinc-900/60">{pageState.task.descrption}</p>
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

                {/* Priority Details */}
                <div>
                  <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Priority</h2>
                  <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-lg">
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
              </div>

              {/* Task Dates footer */}
              <div className="bg-zinc-900/60 border-t border-zinc-800/80 p-4 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider shrink-0 text-zinc-500">
                <div>
                  <span className="block mb-0.5 text-zinc-500">Created</span>
                  <p className="text-zinc-300 font-semibold">{pageState.task.start_d ? pageState.task.start_d.split(' ')[0] : 'N/A'}</p>
                </div>
                <Create userMail={session?.user?.email} listId={params.listId} onTaskCreated={() => {}} />
                <div className="text-right">
                  <span className="block mb-0.5 text-zinc-500">Due Date</span>
                  <p className="text-zinc-300 font-semibold">{pageState.task.end_d ? pageState.task.end_d.split('T')[0] : 'N/A'}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Page;