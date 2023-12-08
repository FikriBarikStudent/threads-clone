'use client'

import React from 'react'
import { sidebarLinks } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'
import { SignInButton, SignOutButton, SignedIn, SignedOut, useAuth } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'

export default function LeftSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { userId } = useAuth()

  return (
    <section className='custom-scrollbar leftsidebar'>
      <div className='flex flex-col w-full flex-1 gap-6 px-6'>
        {
          sidebarLinks.map((link) => {
            const isActive = (pathname.includes(link.route) && link.route.length > 1) || (pathname === link.route && link.route.length === 1)

            if(link.route === '/profiles') link.route = `${link.route}/${userId}`

            return(
            <Link href={link.route}
            key={link.label}
            className={`leftsidebar_link ${isActive && 'bg-primary-500'}`}>
              <Image 
              src={link.imgURL}
              alt={link.label}
              width={24}
              height={24}
              />

              <p className='text-light-1 max-lg:hidden'>{link.label}</p>

            </Link>
          )})
        }
      </div>

      <div className='mt-10 px-6'>
        <SignedIn>
          <SignOutButton signOutCallback={() => router.push('/sign-in')}>
            <div className='flex cursor-pointer gap-4 p-4'>
              <Image src='/assets/logout.svg' alt='logout' width={24} height={24}/>
              <p className='text-light-2 max-lg:hidden'>Logout</p>
            </div>
          </SignOutButton>
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <div className='flex cursor-pointer gap-4 p-4'>
              <Image src='/assets/login.svg' alt='login' width={24} height={24}/>
              <p className='text-light-2 max-lg:hidden'>Login</p>
            </div>
          </SignInButton>
        </SignedOut>
      </div>
    </section>
  )
}
