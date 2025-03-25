import React from 'react'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from '../components/Header'
import Contact from '../pages/Contact'
import ScrollUp from '../components/ScrollUp'
import Pack from '../pages/Pack'
import Promo from '../pages/Promo'
import Standard from '../pages/Standard'
import Promoadd from '../pages/Promoadd'
import Editpromo from '../pages/Editpromo'




const App = () => {
  return (
    <BrowserRouter>
    <div className='w-full overflow-hidden'>
    <Routes>
      <Route path='/' element={<Header/>}/>
      <Route path='/contact' element={<Contact />}/>
      <Route path='/package' element={<Pack/>}/>
      <Route path='/Promo' element={<Promo/>}/>
      <Route path='/Standard' element={<Standard/>}/>
      <Route path='/Promoadd' element={<Promoadd/>}/>
      <Route path='/Editpromo' element={<Editpromo/>}/>
     
      

      
   </Routes>
    <ScrollUp/>
    
   
    </div>
    </BrowserRouter>
    
  )
}

export default App;