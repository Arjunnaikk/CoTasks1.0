'use client'

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useGetMyTaskQuery, useGetListQuery } from "@/services/queries";
import { useDeleteListMutation } from "@/services/mutations";
import DialogDemo from '@/components/DialogDemo';
import List from "@/components/List";
import SkeletonDemo from "@/components/SkeletonDemo";

const ErrorComponent = ({ error }) => <div>Error: {error?.message || "An error occurred"}</div>;

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

  if (listLoading) return <SkeletonDemo />;
  if (listError) return <ErrorComponent error={listError} />;

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
<div className="flex-1 p-8 flex flex-col">
  <div className="mb-8 text-center">
    <h1 className="text-3xl font-bold text-white">Create Your List Of Tasks</h1>
    <div className="h-[1px] bg-zinc-700 mt-2 w-[50%]m-auto"></div>
    <p className="text-zinc-400 mt-4">Select a list from the sidebar or create a new one to get started.</p>
  </div>
  
  <div className="flex items-center justify-center flex-1">
    <div className="text-center p-8 border border-dashed border-zinc-700 rounded-lg max-w-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 className="text-xl font-medium text-white mb-2">No list selected</h3>
      <p className="text-zinc-400 mb-6">Choose a list from the sidebar or create a new one to start organizing your tasks.</p>
      <div className=''>
          <DialogDemo email={session?.user?.email} />
        </div>
    </div>
  </div>
</div>
</>
  );
};

export default Page;
