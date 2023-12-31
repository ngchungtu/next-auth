"use client"
import Link from 'next/link'
import React from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'

const Navbar = () => {
    const { status, data: session } = useSession()
    return (
        <div className='p-2 m-2 rounded flex justify-between items-center shadow-xl' style={{ backgroundColor: 'rgb(139 172 225 / 49%)' }}>
            <Link className='font-bold text-lg text-blue-700 shadow-xl' href={'/'}>
                <Image src="https://www.icegif.com/wp-content/uploads/2023/04/icegif-1428.gif" width={100} height={100} alt="logo duck" />
            </Link>
            <div className='flex flex-row p-2 items-center shadow-xl rounded-md'>
                <Image className='rounded-full m-2' src={session?.user?.image ? session?.user?.image : "/giphy.gif"} width={60} height={60} alt="user img" />
                <span className="text-purple-600 font-bold">{session?.user?.name}</span>
            </div>
            {
                status === 'authenticated'
                    ? (<button onClick={() => signOut()} className='bg-slate-500 text-white px-6 py-2 rounded-md'>Đăng xuất</button>)
                    : <span className='text-pink-500 font-bold border-4 border-pink-200 p-3 rounded shadow-xl'>Hi! Bro</span>
                // (<button onClick={() => signIn('google')} className='bg-slate-900 text-white px-6 py-2 rounded-md'>Đăng nhập</button>)
            }
        </div>
    )
}

export default Navbar