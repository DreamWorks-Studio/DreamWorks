import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import About from './pages/About'
import Contact from './pages/Contact'
import Footer from './components/Footer'
import ScrollUp from './components/ScrollUp'
import Gallery from './pages/Gallery'
import Navbar from './components/Navbar'
import SignUp from './pages/SignUp'

const App = () => {
  return (
    <BrowserRouter>
      <div className='w-full overflow-hidden'>
        <Routes>
          <Route path="/" element={<Header />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/signup' element={<SignUp/>} />
        </Routes>
        <ScrollUp />
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App