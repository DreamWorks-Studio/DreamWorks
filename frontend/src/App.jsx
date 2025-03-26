

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Pack from '../pages/Pack'
import Promo from '../pages/Promo'
import Standard from '../pages/Standard'
import Promoadd from '../pages/Promoadd'
import Editpromo from '../pages/Editpromo'
import AdminDashboard from '../pages/AdminDashboard'
import AdminPackages from '../components/AdminPackages'
import ViewPackages from '../pages/ViewPackages'
import Header from '../components/Header';
import Contact from '../pages/Contact';
import Register from '../pages/Register';
import ScrollUp from '../components/ScrollUp';
import SignIn from '../pages/SignIn';
import Home from '../pages/Home';
import AdminDashboard from '../pages/AdminDashboard';
import UserProfile from '../pages/UserProfile';
import PrivateRoute from '../components/PrivateRoute';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import AdminFinance from '../components/AdminFinance';
import Prehome from '../pages/Prehome';
import BookingPage from '../pages/BookingPage'
import BookingSummary from '../pages/BookingSummary'
import CategoryDetail from '../pages/CategoryDetail'
import Portfolio from '../pages/Portfolio'
import UpdatePortfolio from '../pages/UpdatePortfolio'


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
      <Route path='/admin' element={<AdminDashboard />} />
      <Route path='/adminPack' element={<AdminPackages/>}/>
      <Route path="/update-package/:id" element={<Pack />} />
      <Route path="/packages" element={<ViewPackages />}/>
      <Route path='/sign-up' element={<Register />} />
      <Route path='/sign-in' element={<SignIn />} />
      <Route path='/home' element={<Home />} />
      <Route path='/forgot-password' element={<ForgotPassword/>}/>
      <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
          <Route path = "/prehome" element = {<Prehome/>}/>
          {/* Private route for authenticated users */}
          <Route element={<PrivateRoute />}>
            <Route path='/profile' element={<UserProfile />} />
          </Route>
          <Route path='/admin' element={<AdminDashboard />} />
          {/* Role-based protected route for Admin */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          </Route>
          <Route path='/booking' element={<BookingPage/>}/>
          <Route path='/booking-summary' element={<BookingSummary/>}/>
          <Route path='/gallery' element={<Portfolio />}/>
          <Route path="/portfolio/:id" element={<CategoryDetail />} />
          <Route path='/viewGallery' element={<UpdatePortfolio/>}/>
      
   </Routes>
    <ScrollUp/>
    
   
    </div>
    
          

      
    </BrowserRouter>
  );
};


export default App;


