"use client"
import React, { useState } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import Link from 'next/link'
import { useEffect } from 'react'
import { Menu } from 'lucide-react'

const Navbar = () => {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)

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

  return (
    <>
      <nav className='navbar bg-gradient-to-r from-bg-#09090b text-white flex justify-between px-5 h-12 sticky top-0 z-10 items-center'>
        <Link href="/" >
          <div className="logo font-bold text-lg flex justify-center items-center z-50">
            CoTask 
          </div>
        </Link>
        
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





