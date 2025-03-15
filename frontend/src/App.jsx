import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from '../components/Header'
import Contact from '../pages/Contact'
import Register from '../pages/register'
import ScrollUp from '../components/ScrollUp'
import SignIn from '../pages/SignIn'
import Home from '../pages/Home'
import AdminDashboard from '../pages/AdminDashboard'
import UserProfile from '../pages/UserProfile'
import PrivateRoute from '../components/PrivateRoute'



const App = () => {
  return (
    <BrowserRouter>
    <div className='w-full overflow-hidden'>
    <Routes>
      <Route path='/' element={<Header/>}/>
      <Route path='/contact' element={<Contact/>}/>
      <Route path='/sign-up' element={<Register />}/>
      <Route path='/sign-in' element={<SignIn/>}/>
      <Route path='/Home' element={<Home/>} />
      <Route path='/Admin' element={<AdminDashboard/>} />
      <Route element={<PrivateRoute/>}>
         <Route path='/profile' element={<UserProfile/>}/>
      </Route>
      
      

      

    </Routes>  
    <ScrollUp/>
   
    </div>
    </BrowserRouter>
    
  )
}

export default App;