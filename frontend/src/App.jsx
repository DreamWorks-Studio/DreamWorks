import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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

const App = () => {

  return (
    <BrowserRouter>
      <div className='w-full overflow-hidden'>
        <Routes>
          <Route path='/' element={<Header />} />
          <Route path='/contact' element={<Contact />} />
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
         

        
        </Routes>
        <ScrollUp />
      </div>
    </BrowserRouter>
  );
};

export default App;
