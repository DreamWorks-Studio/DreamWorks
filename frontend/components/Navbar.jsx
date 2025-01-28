import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className= 'flex items-center justify-between py-5 font-medium'>
        {/*<img src={} className='w-36' alt=""/>*/}
        <ul className='hidden sm:flex gap-5 text-base text-gray-800'>
            <NavLink to='/' className='flex flex-col items-center gap-1'>
                <p>Home</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-blue-600 hidden'/>
            </NavLink>
            <NavLink to='/aboutUs' className='flex flex-col items-center gap-1'>
                <p>About us</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-blue-600 hidden'/>
            </NavLink>
            <NavLink to='/gallery' className='flex flex-col items-center gap-1'>
                <p>Gallery</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-blue-600 hidden'/>
            </NavLink>
        </ul>
    </div>
  )
}

export default Navbar