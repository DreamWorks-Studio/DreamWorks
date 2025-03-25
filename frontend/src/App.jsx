import React from 'react'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from '../components/Header'
import Contact from '../pages/Contact'
import ScrollUp from '../components/ScrollUp'
import PaymentSummary from '../pages/PaymentSummary'
import PaymentGateway from '../pages/PaymentGateway'
import AdminDashboard from '../pages/AdminDashboard'

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
      <Route path='/payment'element={<PaymentSummary/>}/>
    </Routes>
    <ScrollUp/>
    </div>
    </BrowserRouter>
    
  )
}

export default App