import React from 'react'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from '../components/Header'
import Contact from '../pages/Contact'
import ScrollUp from '../components/ScrollUp'
import Footer from '../components/Footer'
import BookingPage from '../pages/BookingPage'
import AdminDashboard from '../pages/AdminDashboard'
import { BookingEdit } from '../pages/BookingEdit'
import BookingSummary from '../pages/BookingSummary'



const App = () => {
  return (
    <BrowserRouter>
    <div className='w-full overflow-hidden'>
    <Routes>
      <Route path='/' element={<Header/>}/>
      <Route path='/contact' element={<Contact />}/>
      <Route path='/booking' element={<BookingPage/>}/>
      <Route path='/dashboard' element={<AdminDashboard/>}/>
      <Route path='/booking-summary' element={<BookingSummary/>}/>
      <Route path='/bookingedit' element={<BookingEdit/>}/>
    </Routes>
    <ScrollUp/>
    </div>
    </BrowserRouter>
    
  )
}

export default App