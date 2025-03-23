'use client'

import { useSession } from "next-auth/react";
import React from 'react';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetMyTeamQuery } from "@/services/queries";
import TeamList from '@/components/TeamList';
import DialogDemoTeam from '@/components/DialogDemoTeam';
import SkeletonDemo from "@/components/SkeletonDemo";

const ErrorComponent = ({ error }) => <div>Error: {error?.message || "An error occurred"}</div>;

const Page = ({ params }) => {
    const router = useRouter();
    const { data: session } = useSession();
    const [selectedTeam, setSelectedTeam] = useState(params.teamId)

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
        setSelectedTeam(teamTitle);
        router.push(`/mygroups/${teamTitle}/task/${taskId}`);
    };

    return (
        <>
            {/* Sidebar */}
            <div className='w-[23vw] h-[90.8vh] bg-[#09090b] top-[55px] sticky rounded-md m-1 flex flex-col items-center gap-3 p-1 border-zinc-800 border-[0.5px]'>
                <div className='h-auto px-[1px] py-[10px] bg-[#09090b] w-[90%] rounded-md flex flex-col gap-2 justify-center items-center'>
                    <h3 className='text-2xl font-bold bg-zinc-900 text-white'>Groups</h3>
                    <div className='w-[21vw] h-[0.5px] bg-zinc-700'></div>
                    <div className="h-[71vh] overflow-y-scroll bg-[#09090b]">
                        <div className="flex flex-col">
                        {Array.isArray(teamData?.teamTitle) && teamData.teamTitle.length > 0 ? (
                            teamData.teamTitle.map((item, index) => (
                                <TeamList
                                    key={index}
                                    teamName={item.team_title}
                                    handleClick={() => handleRoute(item.team_title)}
                                    isSelected={selectedTeam === item.team_title}
                                    handleTeamDelete={() => handleTeamDelete(item.team_title)}
                                />
                            ))
                        ) : (
                            <div className="text-white">No lists available</div>
                        )}
                        </div>
                    </div>
                </div>
                <div className='fixed bottom-8'>
                    <DialogDemoTeam email={session?.user?.email} />
                </div>
            </div>

            {/* My Page */}
            <div className="flex-1 p-8 flex flex-col">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white">Create Your Group for Tasks</h1>
                <div className="h-[1px] bg-zinc-700 mt-2 w-[50%]m-auto"></div>
                <p className="text-zinc-400 mt-4">Select a group from the sidebar or create a new one to get started.</p>
              </div>
              
              <div className="flex items-center justify-center flex-1">
                <div className="text-center p-8 border border-dashed border-zinc-700 rounded-lg max-w-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-xl font-medium text-white mb-2">No list selected</h3>
                  <p className="text-zinc-400 mb-6">Choose a list from the sidebar or create a new one to start organizing your tasks.</p>
                  <div className=''>
                    <DialogDemoTeam email={session?.user?.email} />
                </div>
                </div>
              </div>
            </div>
            
        </>
    );
};

export default Page;