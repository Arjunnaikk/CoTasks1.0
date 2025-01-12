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
    </>
  );
};

export default Page;
