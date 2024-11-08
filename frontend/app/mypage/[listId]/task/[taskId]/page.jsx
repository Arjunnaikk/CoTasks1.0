'use client'

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useGetMyTaskQuery, useGetListQuery } from "@/services/queries";
import { useDeleteMyTaskMutation, useUpdateTaskStatusMutation } from "@/services/mutations";
import { ArrowUp, ArrowDown, ArrowRight, Menu, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Sidebar from '@/components/Sidebar';
import Create from '@/components/Create';
import Cards from '@/components/Cards';
import DialogDemo from '@/components/DialogDemo';
import List from "@/components/List";
import EmptyCard from '@/components/EmptyCard';
import SkeletonDemo from "@/components/SkeletonDemo";

const ErrorComponent = ({ error }) => <div>Error: {error?.message || "An error occurred"}</div>;

const Page = ({ params }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: myTask, isLoading, error } = useGetMyTaskQuery(session?.user?.email, params.listId);
  const { data: listData, isLoading: listLoading, error: listError } = useGetListQuery(session?.user?.email);
  const deleteTaskMutation = useDeleteMyTaskMutation();
  // const updateTaskStatusMutation = useUpdateTaskStatusMutation();

  const [task, setTask] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (myTask?.newTask) {
      setTasks([...myTask.newTask]);
    }
  }, [myTask]);

  useEffect(() => {
    if (myTask?.newTask) {
      const currentTask = myTask.newTask.find(item => item.task_id === parseInt(params.taskId, 10));
      setTask(currentTask);
    }
  }, [myTask, params.taskId]);

  if (isLoading || listLoading) return <SkeletonDemo />;
  if (error || listError) return <ErrorComponent error={error || listError} />;

  const handleRoute = (name, taskId) => {
    router.push(`/mypage/${name}/task/${taskId}`);
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await deleteTaskMutation.mutateAsync({
        userMail: session?.user?.email,
        task_id: task.task_id,
      });
      console.log("Task deleted successfully");
      const updatedTasks = tasks.filter(t => t.task_id !== task.task_id);
      setTasks(updatedTasks);
      setTask(null);
      router.push(`/mypage/${params.listId}`);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (task) {
      try {
        await updateTaskStatusMutation.mutateAsync({
          user_gmail: session?.user?.email,
          taskId: task.task_id,
          status: newStatus
        });
        setTask({ ...task, status: newStatus });
        const updatedTasks = tasks.map(t => 
          t.task_id === task.task_id ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);
      } catch (error) {
        console.error("Failed to update task status:", error);
      }
    }
  };

  const handleSort = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    
    const sortedTasks = [...tasks].sort((a, b) => {
      if (newDirection === 'asc') {
        return a.priority - b.priority;
      } else {
        return b.priority - a.priority;
      }
    });
    
    setTasks(sortedTasks);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started':
        return 'bg-red-500';
      case 'In Progress':
        return 'bg-yellow-500';
      case 'Completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className='w-[25vw] h-[90.8vh] bg-[#09090b] top-[55px] sticky rounded-md m-1 flex flex-col items-center gap-3 p-1 border-zinc-800 border-[0.5px]'>
        <div className='h-auto px-[1px] py-[10px] bg-[#09090b] w-[90%] rounded-md flex flex-col gap-2 justify-center items-center'>
          <h3 className='text-2xl font-bold text-white'>My List</h3>
          <div className='w-[21vw] h-[0.5px] bg-zinc-700'></div>
          <div className="h-[71vh] overflow-y-scroll bg-[#09090b]">
            <div className="flex flex-col">
              {(Array.isArray(listData?.newList) ? listData.newList : []).map((item, index) => (
                <List 
                  key={index} 
                  listName={item.name} 
                  handleClick={() => handleRoute(item.name)} 
                />
              ))}
            </div>
          </div>
        </div>
        <div className='fixed bottom-4'>
          <DialogDemo email={session?.user?.email} />
        </div>
      </div>

      {/* My Page */}
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
          {Array.isArray(tasks) && tasks.length > 0 ? (
            tasks.map((item, index) => (
              <Cards 
                myTask={{ newTask: tasks }}
                keye={index} 
                key={index} 
                listName={params.listId} 
                handleClick={() => handleRoute(params.listId, item.task_id)}
                status={item.status}
                statusColor={getStatusColor(item.status)}
              />
            ))
          ) : (
            <EmptyCard/>
          )}
        </div>
      </div>

      {/* Task Detail */}
      <div className='h-[90.8vh] w-[35vw] rounded-md bg-[#09090b] top-[55px] left-[10px] sticky m-2 flex flex-col border border-zinc-800'>
        <div className='text-white flex justify-between m-1 p-3 cursor-pointer'>
          <Trash2 onClick={handleDelete} />
          <Menu />
        </div>
        <div className='h-[1px] w-full bg-zinc-800'></div>
        {task && (
          <>
            <div className='flex flex-row p-1 justify-between'>
              <div className='flex flex-row p-0'>
                <h1 className='text-2xl font-semibold text-white flex p-2 items-center'>{task.title}</h1>
              </div>
              <div className='text-white font-thin text-xs flex m-2 items-end'>
                <p>{task.start_d.split(' ')[0]}</p>
              </div>
            </div>
            <div className='h-[1px] w-full bg-zinc-800'></div>
            <div className='h-[40vh] text-sm font-inter font-poppins text-white flex p-3'>
              <span>{task.descrption}</span>
            </div>
            <div className='h-[1px] w-full bg-zinc-800'></div>
            <div className='p-3 text-white flex flex-col gap-3'>
              
              <div className="flex items-center gap-2">
                <span>Update Status:</span>
                <Select onValueChange={handleStatusChange} className="text-black bg-zinc-900"  defaultValue={task.status}>
                  <SelectTrigger className="w-[180px] text-black">
                    <SelectValue className="text-black bg-zinc-900" placeholder="Select a status" />
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
              <div className='w-auto flex flex-row gap-5 justify-between items-center p-3 text-white'>
                <div className="flex items-center gap-2">
                  <span>Priority:</span>
                  {task.priority === 1 && <span className="flex items-center">Low <ArrowDown className="ml-1" /></span>}
                  {task.priority === 2 && <span className="flex items-center">Mid <ArrowRight className="ml-1" /></span>}
                  {task.priority === 3 && <span className="flex items-center">High <ArrowUp className="ml-1" /></span>}
                </div>
                <Badge className={`${getStatusColor(task.status)} text-white`}>
                  {task.status}
                </Badge>
              </div>
            <div className='h-[1px] w-full bg-zinc-800'></div>
          </>
        )}
      </div>
      <Create userMail={session?.user?.email} listId={params.listId} />
    </>
  );
}

export default Page;