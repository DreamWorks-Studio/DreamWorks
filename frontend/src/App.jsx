import React from 'react'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from '../components/Header'
import Contact from '../pages/Contact'
import ScrollUp from '../components/ScrollUp'
import Footer from '../components/Footer'
import PaymentSummary from '../pages/PaymentSummary'
import PaymentGateway from '../pages/PaymentGateway'
import AdminDashboard from '../pages/AdminDashboard'
import { ToastContainer } from 'react-toastify'

const App = () => {
  return (
    <BrowserRouter>
    <div className='w-full overflow-hidden'>
    <Routes>
      <Route path='/' element={<Header/>}/>
      <Route path='/contact' element={<Contact />}/>
      <Route path='/payment' element={<PaymentSummary/>}/>
      <Route path='/gateway' element={<PaymentGateway/>}/>
      <Route path='/dashboard' element={<AdminDashboard/>}/>
    </Routes>
    <ScrollUp/>
    <ToastContainer/>
    </div>
    </BrowserRouter>
    
  )
}

export default App