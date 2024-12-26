'use client'

import { useSession } from "next-auth/react"
import React from 'react'
import Sidebar from '@/components/Sidebar'
import Create from '@/components/Create'
import Cards from '@/components/Cards'
import { ArrowUp, Menu, Trash2 } from 'lucide-react'
import SkeletonDemo from "@/components/SkeletonDemo"
import DialogDemo from '@/components/DialogDemo'
import List from "@/components/List";
import { useRouter } from "next/navigation";
import { useGetMyTaskQuery, useGetUserQuery, useGetListQuery } from "@/services/queries";


const Page = ({params}) => {

  const { data: session } = useSession()
  const router = useRouter()
  const { data, isLoading, error } = useGetMyTaskQuery(
    `${session?.user?.email}`,
    `${params.listId}`
  );
  const { data: listData, isLoading: listLoading, error: listError } = useGetListQuery(
    `${session?.user?.email}`
  );
  const { data: taskData } = useGetMyTaskQuery(session?.user?.email, name);
  if (listLoading) return <div><SkeletonDemo /></div>;
  if (listError) return <div>Error: {error.message}</div>;


//   console.log(data)
  // console.log(listData)

  const handleClick = () => {

    router.push(`/mypage/${listData.newList[0]}/task/`)
  }

  const handleRoute = async (name) => {
        router.push(`/mypage/${name}/task/0`);
  };
  
  

  return (
    <>
      {/* Sidebar */}
      <div className='w-[25vw] h-[90.8vh] bg-#09090b top-[55px] sticky rounded-md m-1 flex flex-col items-center gap-3 p-1 border-zinc-800 border-[0.5px] '>
        <div className='h-auto px-[1px] py-[10px] bg-#18181b w-[90%] rounded-md flex flex-col gap-2 justify-center items-center '>
          <h3 className='text-2xl font-bold text-white'> My List </h3>
          <div className='w-[21vw] h-[0.5px] bg-zinc-700'></div>
          <div className="h-[71vh] overflow-y-scroll bg-#09090b ">
          {(Array.isArray(listData?.newList) ? listData.newList : []).map((item, index) => (
            <List 
                key={index} 
                listName={item.name} 
                handleClick={() => handleRoute(item.name)} // Changed to handleClick prop
            />
            ))}
          </div>
        </div>
        <div className=' fixed bottom-4'>
          <DialogDemo />
        </div>
      </div>
      {/* Mypage */}
      
    </>
  )
}

export default Page