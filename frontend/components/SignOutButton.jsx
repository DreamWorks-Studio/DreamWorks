import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice'; // Assuming you have a logout action in your Redux slice

const SignOutButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignOut = () => {
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('role');

    // Optionally, dispatch a logout action in Redux (if you're using Redux for user state management)
    dispatch(logout());

    // Redirect to the home page
    navigate('/');
  };

  return (
    <button onClick={handleSignOut} className="text-red-500 hover:text-red-700">
      Sign Out
    </button>
  );
};

export default SignOutButton;
