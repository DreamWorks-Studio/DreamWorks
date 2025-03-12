import React from 'react'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from '../components/Header'
import Contact from '../pages/Contact'
import ScrollUp from '../components/ScrollUp'
import Footer from '../components/Footer'

const App = () => {
  return (
    <BrowserRouter>
    <div className='w-full overflow-hidden'>
    <Routes>
      <Route path='/' element={<Header/>}/>
      <Route path='/contact' element={<Contact />}/>
    </Routes>
    <ScrollUp/>
    <Footer/>
    </div>
    </BrowserRouter>
    
  )
}

export default App