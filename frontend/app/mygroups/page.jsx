'use client'

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useGetMyTeamQuery, useGetDueTeamTasksQuery } from "@/services/queries";
import { useDeleteTeamMutation } from "@/services/mutations";
import { toast } from "@/hooks/use-toast";
import TeamList from '@/components/TeamList';
import DialogDemoTeam from '@/components/DialogDemoTeam';
import SkeletonDemo from "@/components/SkeletonDemo";
import MyTeamCard from '@/components/MyTeamCard';

const ErrorComponent = ({ error }) => <div className="text-red-500 p-4">Error: {error?.message || "An error occurred"}</div>;

const Page = ({ params }) => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [selectedTeam, setSelectedTeam] = useState(params.teamId);

    const deleteTeamMutation = useDeleteTeamMutation();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/api/auth/signin');
        }
    }, [status, router]);

    // Queries
    const { data: teamData, isLoading: teamLoading, error: teamError } = useGetMyTeamQuery(session?.user?.email);
    const { data: dueData, isLoading: dueLoading } = useGetDueTeamTasksQuery(session?.user?.email);

    if (teamLoading || dueLoading) return <SkeletonDemo />;
    if (teamError) return <ErrorComponent error={teamError} />;

    // Handlers
    const handleRoute = (teamTitle, taskId = 10) => {
        setSelectedTeam(teamTitle);
        router.push(`/mygroups/${teamTitle}/task/${taskId}`);
    };

    const handleTeamDelete = async (teamName) => {
        try {
          await deleteTeamMutation.mutateAsync({
            userMail: session?.user?.email,
            teamName: teamName,
          });
          toast({
            title: "Team deleted",
            description: `Team "${teamName}" has been removed successfully.`,
            variant: "default",
          });
          router.push("/mygroups");
        } catch (error) {
          console.error("Error deleting task:", error);
          toast({
            title: "Error",
            description: "Failed to delete team. Please try again.",
            variant: "destructive",
          });
        }
    };

    const getTeamNameById = (teamId) => {
        const found = teamData?.teamTitle?.find(t => t.team_id === teamId);
        return found ? found.team_title : '';
    };

    const dueTasks = dueData?.tasks || [];

    return (
        <div className="flex flex-col lg:flex-row flex-1 w-full min-w-0 bg-[#09090b]">
            {/* Sidebar */}
            <div className="w-full lg:w-[320px] shrink-0 h-auto lg:h-[90.8vh] bg-[#09090b]/80 backdrop-blur-xl lg:sticky lg:top-[55px] rounded-2xl m-1.5 flex flex-col items-center gap-3 p-3 border-zinc-800 border-[0.5px] shadow-lg shadow-black/20">
                <div className='h-auto px-1 py-3 bg-[#09090b]/40 w-full rounded-xl flex flex-col gap-2.5 justify-center items-center'>
                    <h3 className='text-lg font-bold text-white tracking-tight uppercase text-zinc-400 text-[10px] tracking-widest'>Collaborative Groups</h3>
                    <div className='w-[90%] h-[0.5px] bg-zinc-800'></div>
                    <div className="w-full h-[50vh] lg:h-[68vh] overflow-y-scroll px-1">
                        <div className="flex flex-col w-full gap-1">
                        {Array.isArray(teamData?.teamTitle) && teamData.teamTitle.length > 0 ? (
                            teamData.teamTitle.map((item, index) => (
                                <TeamList
                                    key={index}
                                    teamName={item.team_title}
                                    handleClick={() => handleRoute(item.team_title)}
                                    isSelected={selectedTeam === item.team_title}
                                    handleTeamDelete={() => handleTeamDelete(item.team_title)}
                                    isAdmin={item.role === 'admin'}
                                />
                            ))
                        ) : (
                            <div className="text-zinc-500 text-xs py-4 text-center">No groups available</div>
                        )}
                        </div>
                    </div>
                </div>
                <div className='mt-auto py-2 w-full flex justify-center'>
                    <DialogDemoTeam email={session?.user?.email} username={session?.user?.name}/>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 lg:p-6 flex flex-col min-w-0">
              <div className="mb-6 text-left">
                <h1 className="text-2xl font-bold text-white tracking-tight">Group Tasks Overview</h1>
                <p className="text-zinc-500 mt-1 text-xs">Select a group workspace from the sidebar or view active deadlines below.</p>
              </div>
              
              <div className="flex-grow bg-gradient-to-br from-zinc-900/10 to-zinc-950/30 border border-zinc-900 rounded-2xl p-6 min-w-0 shadow-xl shadow-black/10">
                <h2 className="text-sm font-semibold text-zinc-300 tracking-wider uppercase text-[10px] tracking-widest border-b border-zinc-900 pb-3 mb-6">
                  Active Group Deadlines
                </h2>

                {dueTasks.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {dueTasks.map((task, idx) => {
                      const teamName = getTeamNameById(task.team_id);
                      return (
                        <MyTeamCard
                          key={task.task_id}
                          myTeamTask={dueTasks}
                          keye={idx}
                          teamName={teamName}
                          handleClick={() => handleRoute(teamName, task.task_id)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="text-center space-y-1">
                      <h3 className="text-xs font-semibold text-zinc-300">All caught up!</h3>
                      <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">No pending group deadlines. Create a task in a group to coordinate.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
    );
};

export default Page;