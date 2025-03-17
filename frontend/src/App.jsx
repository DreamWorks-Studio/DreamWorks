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


const App = () => {

  const isLoggedIn = window.localStorage.getItem("loggedIn");
  const userType = window.localStorage.getItem("userType")
  return (
    
    <BrowserRouter>
      <div className='w-full overflow-hidden'>
        <Routes>
          <Route path='/' element={<Header />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/sign-up' element={<Register />} />
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/home' element={<Home />} />

          {/* Private route for authenticated users */}
          <Route element={<PrivateRoute />}>
            <Route path='/profile' element={<UserProfile />} />
          </Route>

          {/* Role-based protected route for Admin */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path='/admin' element={<AdminDashboard />} />
          </Route>
        </Routes>
        <ScrollUp />
      </div>
    </BrowserRouter>
  );
};

export default App;
