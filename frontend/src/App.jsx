import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from '../components/Header'
import Contact from '../pages/Contact'
import Register from '../pages/register'
import ScrollUp from '../components/ScrollUp'



const App = () => {
  return (
    <BrowserRouter>
    <div className='w-full overflow-hidden'>
    <Routes>
      <Route path='/' element={<Header/>}/>
      <Route path='/contact' element={<Contact/>}/>
      <Route path='/sign-up' element={<Register />}/>
      

      

    </Routes>  
    <ScrollUp/>
   
    </div>
    </BrowserRouter>
    
  )
}

export default App;