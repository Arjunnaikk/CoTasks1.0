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
          <h3 className='text-2xl font-bold text-white'>My List</h3>
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

      {/* Create */}
      <Create userMail={session?.user?.email} listId={params.listId} />
    </>
  );
}

export default Page;
