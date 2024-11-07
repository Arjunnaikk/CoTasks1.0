'use client'

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Create from '@/components/Create';
import Cards from '@/components/Cards';
import { ArrowUp, Menu, Trash2 } from 'lucide-react';
import DialogDemo from '@/components/DialogDemo';
import List from "@/components/List";
import { useRouter } from "next/navigation";
import { useGetMyTaskQuery, useGetListQuery } from "@/services/queries";
import { useDeleteMyTaskMutation } from "@/services/mutations";
import { ArrowDown } from "lucide-react";
import { ArrowRight } from "lucide-react";
import EmptyCard from '@/components/EmptyCard';
import SkeletonDemo from "@/components/SkeletonDemo";

const Loading = () => <div>Loading...</div>;
const ErrorComponent = ({ error }) => <div>Error: {error?.message || "An error occurred"}</div>;

const Page = ({ params }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: myTask, isLoading, error } = useGetMyTaskQuery(session?.user?.email, params.listId);
  const { data: listData, isLoading: listLoading, error: listError } = useGetListQuery(session?.user?.email);
  const deleteTaskMutation = useDeleteMyTaskMutation();

  const [task, setTask] = useState(null);

  useEffect(() => {
    if (myTask?.newTask) {
      const currentTask = myTask.newTask.find(item => item.task_id === parseInt(params.taskId, 10));
      setTask(currentTask);
    }
  }, [myTask, params.taskId]); // Update task whenever myTask or taskId changes

  if (isLoading || listLoading) return <SkeletonDemo />;
  if (error || listError) return <ErrorComponent error={error || listError} />;

  const handleRoute = (name, taskId) => {
    router.push(`/mypage/${name}/task/25`);
  };

  const handleDelete = async () => {
    if (!task) return; // Prevent deletion if task is not set
    try {
      await deleteTaskMutation.mutateAsync({
        userMail: session?.user?.email,
        task_id: task.task_id, // or use task_id if your mutation supports it
      });
      console.log("Task deleted successfully"); // Redirect or refresh as needed
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  console.log("kekekekke",myTask?.newTask)
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
                // const firstTaskId = myTask?.newTask.find(task => task.listId === item.id)?.task_id;

                return (
                  <List 
                    key={index} 
                    listName={item.name} 
                    handleClick={() => handleRoute(item.name)} 
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
      <div className='h-auto w-auto bg-#09090b m-2 flex flex-col items-start gap-6 pt-[50px]'>
  {Array.isArray(myTask?.newTask) && myTask.newTask.length > 0 ? (
    myTask.newTask.map((item, index) => (
      <Cards myTask={myTask} keye={index} key={index} listName={params.listId} handleClick={() => handleRoute(item.name)} />
    ))
  ) : (
    <EmptyCard/>
  )}
</div>

      </div>

      {/* Task Detail */}
      <div className='h-[90.8vh] w-[35vw] rounded-md bg-#09090b top-[55px] left-[10px] sticky m-2 flex flex-col border border-zinc-800'>
        <div onClick={handleDelete} className='text-white flex justify-between m-1 p-3 cursor-pointer'>
          <Trash2 />
          <Menu />
        </div>
        <div className='h-[1px] w-full bg-zinc-800'></div>
        {task && (
          <>
            <div className='flex flex-row p-1 justify-between'>
              <div className='flex flex-row p-0'>
                {/* <img src={session?.user?.image || "default-image.jpg"} alt="User" className='cardimg m-2 rounded-full' /> */}
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
            <div className='p-3 text-white flex flex-row'>
              <div className='w-auto flex flex-row gap-5 justify-center text-white'>
                {task.priority === 1 && <span className="flex flex-row">Priority : Low <ArrowDown /></span>}
                {task.priority === 2 && <span className="flex flex-row">Priority : Mid <ArrowRight /></span>}
                {task.priority === 3 && <span className="flex flex-row">Priority : High <ArrowUp /></span>}
              </div>
            </div>
            <div className='h-[1px] w-full bg-zinc-800'></div>
            <div className='p-3 text-white flex flex-col items-center'>
              <p>Assigned To</p>
              <div className='h-[1px] w-[50%] bg-zinc-800'></div>
            </div>
          </>
        )}
      </div>
      <Create userMail={session?.user?.email} listId={params.listId} />
    </>
  );
}

export default Page;
