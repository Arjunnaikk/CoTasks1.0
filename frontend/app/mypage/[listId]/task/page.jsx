'use client'

import { useSession } from "next-auth/react"
import React from 'react'
import Sidebar from '@/components/Sidebar'
import Create from '@/components/Create'
import Cards from '@/components/Cards'
import { ArrowUp, Menu, Trash2 } from 'lucide-react'
import DialogDemo from '@/components/DialogDemo'
import List from "@/components/List";
import { useRouter } from "next/navigation";
import { useGetMyTaskQuery, useGetListQuery } from "@/services/queries";
import { ArrowRight } from "lucide-react"
import { ArrowDown } from "lucide-react"
import { useDeleteMyTaskMutation } from "@/services/mutations"


const Loading = () => <div>Loading...</div>;
const ErrorComponent = ({ error }) => <div>Error: {error?.message || "An error occurred"}</div>;

const Page = ({ params }) => {
  const router = useRouter();
  const { data: session } = useSession();
  if(session === null) return;
  if(!session) {
    router.push('/');   
  }
  const { data: myTask, isLoading, error } = useGetMyTaskQuery(session?.user?.email, params.listId);
  const { data: listData, isLoading: listLoading, error: listError } = useGetListQuery(session?.user?.email);
  
  // Fetch the current task based on taskId in params
  const task = myTask?.newTask.find((item) => item.task_id === parseInt(params.taskId, 10));
  const deleteTaskMutation = useDeleteMyTaskMutation();

  if (isLoading || listLoading) return <Loading />;
  if (error || listError) return <ErrorComponent error={error || listError} />;

  // Modify handleRoute to route to the first task of the selected list
  const handleRoute = (name, taskId) => {
    router.push(`/mypage/${name}/task/${taskId}`);
  };

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync({
        userMail: session?.user?.email,
        taskName: task.title, // or use task_id if your mutation supports it
      });
      console.log("Task deleted successfully");
      router.push(`/mypage/College/task/8`); // Redirect or refresh as needed
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className='w-[25vw] h-[90.8vh] bg-#09090b top-[55px] sticky rounded-md m-1 flex flex-col items-center gap-3 p-1 border-zinc-800 border-[0.5px]'>
        <div className='h-auto px-[1px] py-[10px] bg-#18181b w-[90%] rounded-md flex flex-col gap-2 justify-center items-center'>
          <h3 className='text-2xl font-bold text-white'>My Listtttttttt</h3>
          <div className='w-[21vw] h-[0.5px] bg-zinc-700'></div>
          <div className="h-[71vh] overflow-y-scroll bg-#09090b">
            <div className="flex flex-col">
              {(Array.isArray(listData?.newList) ? listData.newList : []).map((item, index) => {
                // Get the first task of the current list
                const firstTaskId = myTask?.newTask.find(task => task.listId === item.id)?.task_id; // Adjust according to your task's structure

                return (
                  <List 
                    key={index} 
                    listName={item.name} 
                    handleClick={() => handleRoute(item.name, firstTaskId)} // Pass firstTaskId to handleRoute
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div className='fixed bottom-4'>
          <DialogDemo email={session?.user?.email} />
        </div>
      </div>

      {/* My Page */}
      <div className='h-auto w-auto bg-#09090b m-2 flex flex-col items-start gap-6 pt-[50px]'>
        {myTask?.newTask?.length === 0 ? (
          <div className='text-white text-lg'>No tasks available.</div>
        ) : (
          (Array.isArray(myTask?.newTask) ? myTask.newTask : []).map((item, index) => (
            <Cards myTask={myTask} key={index} listName={params.listId} handleClick={() => handleRoute(item.name)} />
          ))
        )}
      </div>

      {/* Task Detail */}
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
</div>
    </>
  );
}

export default Page;
