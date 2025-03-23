'use client'

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useGetMyTaskQuery, useGetListQuery } from "@/services/queries";
import { useDeleteMyTaskMutation, useUpdateTaskStatusMutation, useDeleteListMutation } from "@/services/mutations";
import { ArrowUp, ArrowDown, ArrowRight, Menu, Trash2, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import Create from '@/components/Create';
import Cards from '@/components/Cards';
import DialogDemo from '@/components/DialogDemo';
import List from "@/components/List";
import EmptyCard from '@/components/EmptyCard';
import SkeletonDemo from "@/components/SkeletonDemo";
import { Input } from "@/components/ui/input";
import { CheckCheck } from "lucide-react";
import { CircleAlert } from "lucide-react";

const STATUS_COLORS = {
  'Not Started': 'bg-red-500',
  'In Progress': 'bg-yellow-500',
  'Completed': 'bg-green-500',
  'default': 'bg-gray-500'
};

const ErrorComponent = ({ error }) => <div>Error: {error?.message || "An error occurred"}</div>;

const Page = ({ params }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [pageState, setPageState] = useState({
    task: null,
    sortDirection: 'desc',
    tasks: [],
    searchQuery: '',
    filteredTasks: [],
    selectedList: params.listId
  });

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

  useEffect(() => {
    if (myTask?.newTask) {
      const currentTask = myTask.newTask.find(
        item => item.task_id === parseInt(params.taskId, 10)
      );
      setPageState(prev => ({ ...prev, task: currentTask }));
    }
  }, [myTask, params.taskId]);

  useEffect(() => {
    const filtered = pageState.tasks.filter(task => 
      task.title.toLowerCase().includes(pageState.searchQuery.toLowerCase()) ||
      task.descrption.toLowerCase().includes(pageState.searchQuery.toLowerCase())
    );
    setPageState(prev => ({ ...prev, filteredTasks: filtered }));
  }, [pageState.searchQuery, pageState.tasks]);

  
  const handleRoute = (name, taskId) => {
    setPageState(prev => ({ ...prev, selectedList: name }));
    router.push(`/mypage/${name}/task/${taskId}`);
  };
  
  const handleListDelete = async (listName)=>{
    console.log("helo broda",listName)
    try{
      await deleteListMutation.mutateAsync({
        userMail: session?.user?.email,
        name: listName,
      });
      router.push('/mypage');
    } catch (error) {
      console.error("Error deleting task:", error);
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
      
      router.push(`/mypage/${params.listId}/task/0`);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

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

  console.log("PageState:", pageState);
  

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

  if (isLoading || listLoading) return <SkeletonDemo />;
  if (error || listError) return <ErrorComponent error={error || listError} />;

  return (
    <>
      {/* Sidebar */}
      <div className='w-[23vw] h-[90.8vh] bg-[#09090b] top-[55px] sticky rounded-md m-1 flex flex-col items-center gap-3 p-1 border-zinc-800 border-[0.5px]'>
        <div className='h-auto px-[1px] py-[10px] bg-[#09090b] w-[90%] rounded-md flex flex-col gap-2 justify-center items-center'>
          <h3 className='text-2xl font-bold text-white'>My List</h3>
          <div className='w-[21vw] h-[0.5px] bg-zinc-700'></div>
          <div className="h-[71vh] overflow-y-scroll bg-[#09090b]">
            <div className="flex flex-col">
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
        <div className='fixed bottom-8'>
          <DialogDemo email={session?.user?.email} />
        </div>
      </div>

      {/* My Page */}
      <div className='h-auto w-auto bg-[#09090b] m-2 flex flex-col items-start gap-6 pt-[50px]'>
        <div className="w-full mb-3 px-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={pageState.searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-[#18181b] text-white border-zinc-700 rounded-md"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          </div>
        </div>
        
        <div className="flex items-center gap-1 mx-3">
          <Button 
            onClick={handleSort} 
            className="border-zinc-200 text-white flex items-center gap-2"
          >
            Sort by Priority 
            {pageState.sortDirection === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className='h-auto w-auto bg-[#09090b] m-2 flex flex-col items-start gap-3'>
          {pageState.filteredTasks.length > 0 ? (
            pageState.filteredTasks.map((item, index) => (
              <Cards 
                myTask={{ newTask: pageState.filteredTasks }}
                keye={index} 
                key={index} 
                listName={params.listId} 
                handleClick={() => handleRoute(params.listId, item.task_id)}
                status={item.status}
              />
            ))
          ) : (
            <EmptyCard/>
          )}
        </div>
      </div>

      {/* Task Detail */}
          {params.taskId === '0' ? 
           <div className='h-[90.8vh] w-[35vw] rounded-md bg-[#09090b] top-[55px] left-[10px] sticky m-2 flex flex-col border border-zinc-800 overflow-hidden'>
            <div className="bg-zinc-900  p-4 flex items-end justify-center h-full">
            <div className=' flex justify-between items-center'>
           <Create className="w-full" userMail={session?.user?.email} listId={params.listId} onTaskCreated={() => {}} />
            </div>
           </div>
         </div>
           :
            <div className='h-[90.8vh] w-[35vw] rounded-md bg-[#09090b] top-[55px] left-[10px] sticky m-2 flex flex-col border border-zinc-800 overflow-hidden'>
  {pageState.task && (
    <>
      <div className='bg-zinc-900 p-4 flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-white truncate'>{pageState.task.title}</h1>
        <Trash2 onClick={handleDelete} className="text-zinc-400 hover:text-red-600 cursor-pointer transition-colors" />
      </div>
      <div className='flex-grow overflow-y-auto p-6 space-y-6'>
        <div>
          <h2 className='text-lg font-semibold text-zinc-300 mb-2'>Description</h2>
          <p className='text-zinc-400 whitespace-pre-wrap'>{pageState.task.descrption}</p>
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
      </div>
      <div className='bg-zinc-900 p-4 flex justify-between items-center'>
        <div>
          <span className='text-zinc-400 text-sm'>Created on</span>
          <p className='text-white font-semibold'>{pageState.task.start_d.split(' ')[0]}</p>
        </div>
        <Create userMail={session?.user?.email} listId={params.listId} onTaskCreated={() => {}} />
        <div className='text-right'>
          <span className='text-zinc-400 text-sm'>Due Date</span>
          <p className='text-white font-semibold'>{pageState.task.end_d.split('T')[0]}</p>
        </div>
      </div>
    </>
  )}
</div> }


    </>
  );
}

export default Page;