'use client'

import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

const Card = ({ myTask, keye, listName }) => {
    const router = useRouter();
    
    // Check if myTask and newTask are defined
    if (!myTask || !myTask.newTask || myTask.newTask.length <= keye) {
        return null; // Return null or a fallback UI if data is not available
    }

    const task = myTask.newTask[keye]; // Retrieve the task

    const handleClick = () => {
        const taskId = task.task_id; // Retrieve the task_id
        router.push(`/mypage/${listName}/task/${taskId}`);
    };

    return (
        <div onClick={handleClick} className='bg-#09090b border border-zinc-800 border-1 w-[35vw] h-[22vh] rounded-lg flex flex-col relative hover:bg-zinc-800 transition-colors cursor-pointer'>
            <div className='flex flex-row'>
                <h1 className='text-2xl font-semibold text-white flex p-2 ml-7 items-center'>{task.title}</h1>
            </div>
            <div className='text-sm font-inter font-poppins text-white flex pl-10 pr-1 py-1 overflow-hidden w-[70%] h-[auto]'>
                <span>{task.descrption.length > 100 ? `${task.descrption.slice(0,100)}...`: task.descrption}</span>
            </div>
            <div className='absolute right-10 top-2 w-auto flex flex-row gap-5 justify-center text-white'>
                {task.priority === 1 && <ArrowDown />}
                {task.priority === 2 && <ArrowRight />}
                {task.priority === 3 && <ArrowUp />}
            </div>
            <div className='absolute right-7 bottom-3 text-white font-thin text-xs'>
                {task.start_d.split(' ')[0]}
            </div>
        </div>
    );
}

export default Card;
