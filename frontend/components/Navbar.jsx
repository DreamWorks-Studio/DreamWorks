import React, { useEffect, useState } from 'react'
import { FaAlignRight, FaTimes } from 'react-icons/fa'
import { Link, NavLink, useLocation } from 'react-router-dom'

const Navbar = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false)

    const location = useLocation();

useEffect(()=> {
    if(showMobileMenu) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = 'auto'
    }
    return ()=> {
        document.body.style.overflow = 'auto' 
    }
}, [showMobileMenu])

const navbarColor = location.pathname === '/' ? 'bg-transparent' : 'bg-black';

  return (
    <div className = {`absolute top-0 left-0 w-full z-50 ${navbarColor}`}>
      <div className='container mx-auto flex justify-between items-center py-2 px-6 md:px-20 lg:px-32'>
        <img src="src/assets/web_logo.png" alt="logo" className='w-24'/>
        <ul className='hidden md:flex gap-7 text-white'>
          <Link to="/" className=' text-white hover:text-amber-500'>Home</Link>
          
          
          <Link to='/gallery' className=' text-white hover:text-amber-500'>Gallery</Link>
          {/*<a href='#Gallery' className=' text-white hover:text-amber-500'>Gallery</a>*/}
          <Link to="/contact" className=' text-white hover:text-amber-500'>Contact</Link>
        </ul>
        <Link to="/signup" className='hidden md:block bg-transparent text-amber-500 hover:text-white px-5 py-2
        border-2 border-amber-500 hover:border-white rounded-full'>SignUp</Link>

        <FaAlignRight onClick={()=> setShowMobileMenu(true)} 
        className='md:hidden h-10 w-10 cursor-pointer text-white fixed top-11 right-10 p-2 rounded-2xl bg-amber-600
        shadow-lg transition-transform duration-300 ease-in-out hover:bg-gray-100 hover:text-amber-600 hover:scale-110'/>
      </div>

      {/*----mobile-menu---*/}

      <div className={`md:hidden fixed right-0 top-0 bottom-0 overflow-hidden bg-neutral-800 transition-all duration-450 ease-in-out
        ${showMobileMenu ? 'opacity-100' : 'opacity-0'} ${showMobileMenu ? 'w-full' : 'w-0'}`}>
        <div className='flex justify-end p-6'>
            <FaTimes onClick={()=> setShowMobileMenu(false)} className={`md:hidden h-6 w-12 mt-7 mr-3 cursor-pointer text-amber-600 
               transition-transform duration-300 ease-in-out ${showMobileMenu ? 'rotate-0' : 'rotate-270 opacity-0'}`}/>
        </div>
        <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
            <Link onClick={()=> setShowMobileMenu(false)} to="/" className='px-4 py-2 text-white rounded-full inline-block'>Home</Link>
            <Link onClick={()=> setShowMobileMenu(false)} to="/about" className='px-4 py-2 text-white rounded-full inline-block'>About</Link>
            <Link onClick={()=> setShowMobileMenu(false)} to="/gallery" className='px-4 py-2 text-white rounded-full inline-block'>Gallery</Link>
            {/*<Link onClick={()=> setShowMobileMenu(false)} to="/gallery" className='px-4 py-2 text-white rounded-full inline-block'>Gallery</Link>*/}
            <Link onClick={()=> setShowMobileMenu(false)} to="/contact" className='px-4 py-2 text-white rounded-full inline-block'>Contact</Link>
        </ul>
      </div>
    </div>
  )
}

export default Navbar