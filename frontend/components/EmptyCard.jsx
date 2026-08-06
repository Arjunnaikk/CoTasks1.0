'use client'

import React from 'react';
import { ClipboardList } from 'lucide-react';

const Card = ({ createButton }) => {
    return (
        <div className='bg-gradient-to-br from-zinc-900/30 to-zinc-950/50 border border-zinc-900 border-dashed w-full h-[220px] rounded-2xl flex flex-col justify-center items-center gap-3 p-6 text-zinc-500 hover:text-zinc-400 transition-colors duration-200 select-none'>
            <ClipboardList className='h-8 w-8 text-zinc-700' />
            <div className="text-center space-y-1">
                <h1 className='text-sm font-semibold text-zinc-300'>No tasks found</h1>
                <p className='text-xs text-zinc-500 text-center leading-relaxed max-w-[200px]'>Add a new task to get started on this list workspace.</p>
            </div>
            {createButton && <div className="mt-1">{createButton}</div>}
        </div>
    );
}

export default Card;
