import React from 'react'
import Navbar from './Navbar'
import Carousel from './Carousel'
import About from '../pages/About'
import Footer from './Footer'

const Header = () => {
  return (
    <div className='min-h-screen bg-cover bg-center w-full overflow-hidden bg-black'>
        <Navbar/>
        <Carousel/>
        <About/>
        <Footer/>
    </div>
  )
}

export default Header