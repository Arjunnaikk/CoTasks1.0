"use client"
import React, { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import Link from 'next/link'
import { LogOut, Settings, User, LayoutDashboard } from 'lucide-react'
import { useGetUserQuery } from '@/services/queries'

const Navbar = () => {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const { data: userData } = useGetUserQuery()
  
  const user = userData?.user?.find((user) => user.name === session?.user?.name)

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('nav')
      if (navbar) {
        if (window.scrollY > 10) {
          navbar.classList.add('navbar-scrolled')
        } else {
          navbar.classList.remove('navbar-scrolled')
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className='sticky top-0 z-50 w-full h-14 bg-zinc-950/60 border-b border-zinc-900 backdrop-blur-md transition-all duration-300 px-6 flex justify-between items-center text-white'>
      <Link href="/" className="flex items-center gap-2 group">
        <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center font-black text-black group-hover:scale-105 transition-transform duration-200">
          C
        </div>
        <span className="logo font-bold text-lg tracking-tight group-hover:text-zinc-300 transition-colors">
          CoTask
        </span>
      </Link>

      <div className='flex items-center gap-4 relative'>
        {session ? (
          <>
            <Link href="/mygroups/" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <button 
              onClick={() => { setShowDropdown(!showDropdown) }}
              onBlur={() => {
                setTimeout(() => { setShowDropdown(false) }, 200)
              }}
              className="flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-zinc-800 rounded-full p-0.5 hover:bg-zinc-900 transition-colors"
            >
              <img 
                className='w-8 h-8 rounded-full border border-zinc-800 object-cover ring-1 ring-zinc-700/30'
                src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${user?.user_id || 'default'}`} 
                alt="Profile" 
              />
            </button>

            {showDropdown && (
              <div className="absolute top-[45px] right-[0px] w-52 bg-zinc-950 border border-zinc-900 rounded-xl shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-zinc-900">
                  <p className="text-xs text-zinc-500 font-medium">Logged in as</p>
                  <p className="text-sm text-zinc-200 font-semibold truncate">{session?.user?.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{session?.user?.email}</p>
                </div>
                <ul className="py-1">
                  <li>
                    <Link href="/mysettings" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </li>
                </ul>
                <div className="border-t border-zinc-900 pt-1">
                  <button 
                    onClick={() => signOut()} 
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <button 
            onClick={() => signIn()} 
            type="button" 
            className="h-9 px-4 text-xs font-semibold rounded-lg bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all duration-200"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
