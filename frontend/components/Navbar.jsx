"use client"
import React, { useState } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import Link from 'next/link'
import { useEffect } from 'react'
import { Menu } from 'lucide-react'
import { useGetUserQuery } from '@/services/queries'

const Navbar = () => {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const { data: userData, isLoading, error } = useGetUserQuery()
    const user = userData?.user?.find((user) =>
      user.name === session?.user?.name
  );

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('nav')
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled')
      } else {
        navbar.classList.remove('scrolled')
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  console.log(session?.user?.name)
  return (
    <>
      <nav className='navbar bg-gradient-to-r from-bg-#09090b text-white flex justify-between px-5 h-12 sticky top-0 z-10 items-center'>
        <Link href="/" >
          <div className="logo font-bold text-lg flex justify-center items-center z-50">
            CoTask
          </div>
        </Link>
        <div className='relative'>
          {session && <>
          <div className='text-white hover:opacity-80 rounded-full font-medium rounded-full p-2'>
              <img className='w-full ' 
              onClick={() => { setShowDropdown(!showDropdown) }}
              onBlur={() => {
                setTimeout(() => { setShowDropdown(false) }, 500)
              }}
              id="dropdownDividerButton"
              src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${user?.user_id}`} alt="" />
            </div>
            <div id="dropdownDivider" className={`z-10 ${showDropdown ? "" : "hidden"} absolute top-[45px] right-[0px] bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600`}>
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDividerButton">
                <li>
                  <Link href="/mysettings" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{session?.user?.name}</Link>
                </li>
              </ul>
              <div className="py-2">
                <Link onClick={() => signOut()} href={"/"} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-auto dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white" >Log Out</Link>
              </div>
            </div>
          </>}
        </div>
        {!session &&
          // <Link href={"/login"}>

          <button onClick={() => signIn()} type="button" className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2 text-center flex justify-center items-center">Login</button>
          // {/* </Link> */}
        }
      </nav>
    </>
  )
}

export default Navbar





