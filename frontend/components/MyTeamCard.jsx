'use client'

import { ArrowDown, ArrowRight, ArrowUp, CheckCheck, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { CircleAlert } from 'lucide-react';

const MyTeamCard = ({ myTeamTask, keye, teamName }) => {
    const router = useRouter();
    
    if (!myTeamTask || myTeamTask.length <= keye) {
        return null;
    }
    
    const task = myTeamTask[keye];

    const STATUS_COLORS = {
        'missed': 'bg-rose-500',
        'ongoing': 'bg-amber-500',
        'completed': 'bg-emerald-500',
        'default': 'bg-zinc-500',
    };
    
    const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.default;

    const handleClick = () => {
        const taskId = task.task_id;
        router.push(`/mygroups/${teamName}/task/${taskId}`);
    };

    return (
        <div 
            onClick={handleClick} 
            className="group w-[35vw] min-h-[160px] bg-zinc-950/30 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/10 rounded-xl flex flex-col justify-between p-5 transition-all duration-300 cursor-pointer relative overflow-hidden"
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3 min-w-0">
                    <img 
                        className="w-10 h-10 rounded-full border border-zinc-800 shrink-0 bg-zinc-900 object-cover ring-1 ring-zinc-700/20" 
                        src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${task.assigner_id}`} 
                        alt="Assigner" 
                    />
                    <div className="space-y-1 min-w-0">
                        <h2 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors truncate tracking-tight">
                            {task.title}
                        </h2>
                        <p className="text-xs text-zinc-400 font-normal leading-relaxed line-clamp-2">
                            {task.descrption}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 bg-zinc-900 border border-zinc-850 p-1.5 rounded-lg text-zinc-400">
                    {task.priority === 0 && task.status === 'completed' && <CheckCheck className="h-4 w-4 text-emerald-500" />}
                    {task.priority === 0 && task.status === 'missed' && <CircleAlert className="h-4 w-4 text-rose-500" />}
                    {task.priority === 1 && <ArrowDown className="h-4 w-4 text-blue-400" />}
                    {task.priority === 2 && <ArrowRight className="h-4 w-4 text-amber-500" />}
                    {task.priority === 3 && <ArrowUp className="h-4 w-4 text-purple-400" />}
                </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-zinc-900/50">
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 text-zinc-500 text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{task.start_d ? task.start_d.split(' ')[0] : 'N/A'}</span>
                    </div>
                    {(() => {
                        if (!task.end_d || task.status === 'completed') return null;
                        const diff = new Date(task.end_d).getTime() - new Date().getTime();
                        if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
                            return (
                                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 font-medium animate-pulse select-none">
                                    <CircleAlert className="w-2.5 h-2.5 shrink-0" />
                                    Due soon
                                </span>
                            );
                        }
                        return null;
                    })()}
                </div>
            </div>

            {/* Subtle bottom indicator badge */}
            <div className="absolute bottom-0 left-0 w-full h-[3px]">
                <div className={`w-full h-full ${getStatusColor(task.status)} opacity-80`} />
            </div>
        </div>
    );
}

export default MyTeamCard;
