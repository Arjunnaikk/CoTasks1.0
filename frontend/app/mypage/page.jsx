'use client'

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useGetListQuery, useGetDueTasksQuery } from "@/services/queries";
import { useDeleteListMutation } from "@/services/mutations";
import DialogDemo from '@/components/DialogDemo';
import List from "@/components/List";
import SkeletonDemo from "@/components/SkeletonDemo";
import Cards from '@/components/Cards';

const ErrorComponent = ({ error }) => <div className="text-red-500 p-4">Error: {error?.message || "An error occurred"}</div>;

const Page = ({ params }) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [pageState, setPageState] = useState({
    sortDirection: 'desc',
    selectedList: params.listId,
  });

  const handleRoute = (name, taskId) => {
    setPageState(prev => ({ ...prev, selectedList: name }));
    router.push(`/mypage/${name}/task/${taskId}`);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  const { data: listData, isLoading: listLoading, error: listError } = useGetListQuery(session?.user?.email);
  const { data: dueData, isLoading: dueLoading } = useGetDueTasksQuery(session?.user?.email);
  const deleteListMutation = useDeleteListMutation();

  const handleListDelete = async (listName) => {
    try {
      await deleteListMutation.mutateAsync({
        userMail: session?.user?.email,
        name: listName,
      });
      router.push('/mypage');
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getListNameById = (listId) => {
    const found = listData?.newList?.find(l => l.list_id === listId);
    return found ? found.name : '';
  };

  if (listLoading || dueLoading) return <SkeletonDemo />;
  if (listError) return <ErrorComponent error={listError} />;

  const dueTasks = dueData?.tasks || [];

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

      {/* Main Content Area */}
      <div className="flex-1 p-8 flex flex-col min-w-0 overflow-y-auto bg-zinc-950/10 h-full">
        <div className="mb-6 text-left">
          <h1 className="text-2xl font-bold text-white tracking-tight">Personal Tasks Overview</h1>
          <p className="text-zinc-500 mt-1 text-xs">Select a list workspace from the sidebar or view your active tasks below.</p>
        </div>
        
        <div className="bg-gradient-to-br from-zinc-900/10 to-zinc-950/30 border border-zinc-900 rounded-2xl p-6 min-w-0 shadow-lg">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-900 pb-3 mb-6">
            Active Due Tasks
          </h2>
          
          {dueTasks.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {dueTasks.map((task, idx) => {
                const listName = getListNameById(task.list_id);
                return (
                  <Cards 
                    key={task.task_id}
                    myTask={{ newTask: dueTasks }}
                    keye={idx}
                    listName={listName}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div className="text-center space-y-1">
                <h3 className="text-xs font-semibold text-zinc-300">All caught up!</h3>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">No personal tasks are currently due. Select a list to create a task.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
