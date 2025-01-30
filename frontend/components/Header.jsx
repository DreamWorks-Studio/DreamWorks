import React from 'react'
import Navbar from './Navbar'
import Carousel from './Carousel'

const Header = () => {
  return (
    <div className='min-h-screen mb-4 bg-cover bg-center flex items-center w-full overflow-hidden bg-black'>
        <Navbar/>
        <Carousel/>
    </div>
  )
}

export default Header