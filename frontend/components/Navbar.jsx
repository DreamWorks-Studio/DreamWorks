import React, { useEffect, useState } from 'react'
import { FaAlignRight, FaTimes } from 'react-icons/fa'

const Navbar = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false)

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

  return (
    <div className='absolute top-0 left-0 w-full z-50'>
      <div className='container mx-auto flex justify-between items-center py-4 px-6 md:px-20 lg:px-32 bg-transparent'>
        <img src="src/assets/web_logo.png" alt="logo" className='w-24'/>
        <ul className='hidden md:flex gap-7 text-white'>
          <a href="#Header" className=' text-white hover:text-amber-500'>Home</a>
          <a href="#About" className=' text-white hover:text-amber-500'>About</a>
          <a href="#Gallery" className=' text-white hover:text-amber-500'>Gallery</a>
          <a href="#Contact" className=' text-white hover:text-amber-500'>Contact</a>
        </ul>
        <a href="#signUp" className='hidden md:block bg-transparent text-amber-500 hover:text-white px-5 py-2
        border-2 border-amber-500 hover:border-white rounded-full'>SignUp</a>

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
            <a onClick={()=> setShowMobileMenu(false)} href="#Header" className='px-4 py-2 text-white rounded-full inline-block'>Home</a>
            <a onClick={()=> setShowMobileMenu(false)} href="#About" className='px-4 py-2 text-white rounded-full inline-block'>About</a>
            <a onClick={()=> setShowMobileMenu(false)} href="#Gallery" className='px-4 py-2 text-white rounded-full inline-block'>Gallery</a>
            <a onClick={()=> setShowMobileMenu(false)} href="#Contact" className='px-4 py-2 text-white rounded-full inline-block'>Contact</a>
        </ul>
      </div>
    </div>
  )
}

export default Navbar