'use client'

import { useSession } from "next-auth/react";
import React from 'react';
import { useRouter } from "next/navigation";
import { useGetMyTeamQuery } from "@/services/queries";
import TeamList from '@/components/TeamList';
import DialogDemoTeam from '@/components/DialogDemoTeam';
import SkeletonDemo from "@/components/SkeletonDemo";

const ErrorComponent = ({ error }) => <div>Error: {error?.message || "An error occurred"}</div>;

const Page = ({ params }) => {
    const router = useRouter();
    const { data: session } = useSession();
    //if(session === null) return;
    if(!session) {
        router.push('/api/auth/signin');   
    }
    // Queries
    const { data: teamData, isLoading: teamLoading, error: teamError } = useGetMyTeamQuery(session?.user?.email);

    if ( teamLoading ) return <SkeletonDemo />;
    if ( teamError) return <ErrorComponent error={ teamError} />;

    // Handlers
    const handleRoute = (teamTitle, taskId = 10) => {
        router.push(`/mygroups/${teamTitle}/task/${taskId}`);
    };

    return (
        <>
            {/* Sidebar */}
            <div className='w-[25vw] h-[90.8vh] bg-[#09090b] top-[55px] sticky rounded-md m-1 flex flex-col items-center gap-3 p-1 border-zinc-800 border-[0.5px]'>
                <div className='h-auto px-[1px] py-[10px] bg-[#09090b] w-[90%] rounded-md flex flex-col gap-2 justify-center items-center'>
                    <h3 className='text-2xl font-bold bg-zinc-900 text-white'>Groups</h3>
                    <div className='w-[21vw] h-[0.5px] bg-zinc-700'></div>
                    <div className="h-[71vh] overflow-y-scroll bg-[#09090b]">
                        <div className="flex flex-col">
                        {Array.isArray(teamData?.teamTitle) && teamData.teamTitle.length > 0 ? (
                            teamData.teamTitle.map((item, index) => (
                                <TeamList
                                    key={index}
                                    listName={item.team_title}
                                    handleClick={() => handleRoute(item.team_title)}
                                />
                            ))
                        ) : (
                            <div className="text-white">No lists available</div>
                        )}
                        </div>
                    </div>
                </div>
                <div className='fixed bottom-4'>
                    <DialogDemoTeam email={session?.user?.email} />
                </div>
            </div>

            {/* My Page */}
            
        </>
    );
};

export default Page;