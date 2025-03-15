import React from 'react'
import Navbar from './Navbar'
import Carousel from './Carousel'
import About from '../pages/About'
import { useSelector } from 'react-redux'
import PrivateRoute from './PrivateRoute'

const Header = () => {
  return (
    <div className='min-h-screen mb-4 bg-cover bg-center w-full overflow-hidden bg-black'>
        <Navbar/>
        <Carousel/>
        <About/>
        <PrivateRoute/>
    </div>
  )
}

export default Header