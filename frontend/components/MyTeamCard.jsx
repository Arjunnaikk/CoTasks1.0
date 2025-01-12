'use client'

import { Badge } from 'lucide-react';
import { CircleAlert } from 'lucide-react';
import { CheckCheck } from 'lucide-react';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MyTeamCard = ({ myTeamTask, keye, teamName }) => {
    const router = useRouter();
    // console.log("lol",myTeamTask)
    
    // Check if myTeamTask and newTask are defined
    if (!myTeamTask || !myTeamTask || myTeamTask.length <= keye) {
        return null; // Return null or a fallback UI if data is not available
    }
    
    

    const task = myTeamTask[keye]; // Retrieve the task

    const handleClick = () => {
        const taskId = task.task_id; // Retrieve the task_id
        router.push(`/mygroups/${teamName}/task/${taskId}`);
    };

    const STATUS_COLORS = {
        'missed': 'bg-[#ff2828]',
        'ongoing': 'bg-[#ffd630]',
        'completed': 'bg-[#53fa31]',
        'default': 'bg-gray-500',
    };
    
    // Function to get the appropriate status color
    const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.default;

    return (
        <div onClick={handleClick} className='bg-#09090b border border-zinc-800 border-1 w-[35vw] h-[22vh] rounded-lg flex flex-col relative hover:bg-zinc-800 transition-colors cursor-pointer'>
            <div className='flex flex-row'>
                <img className='mx-3 my-2 w-[50px] h-[50px]' src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${task.assigner_id}`} alt="" />
                
                <h1 className='text-2xl font-semibold text-white flex p-2 items-center'>{task.title}</h1>
            </div>
            <div className='text-sm font-inter font-poppins text-white flex pl-10 pr-1 py-1 overflow-hidden w-[70%] h-[auto]'>
                <span>{task.descrption}</span>
            </div>
            <div className='absolute right-10 top-2 w-auto flex flex-row gap-5 justify-center text-white'>
            {task.priority === 0 && task.status =='completed' && <CheckCheck />}
            {task.priority === 0 && task.status =='missed' && <CircleAlert />}
                {task.priority === 1 && <ArrowDown />}
                {task.priority === 2 && <ArrowRight />}
                {task.priority === 3 && <ArrowUp />}
            </div>
            <div className='absolute right-7 bottom-3 text-white font-thin text-xs'>
                {task.start_d.split(' ')[0]}
            </div>
            <div className='absolute bottom-0 w-full'> 
            <Badge className={`${getStatusColor(task.status)} flex justify-center w-full h-[2px]`}>
              </Badge>
              </div>
        </div>
    );
}

export default MyTeamCard;
