import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../src/redux/user/userSlice';
import OAuth from '../components/OAuth';
import { Link } from 'react-router-dom';

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State to manage form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Handles input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(signInStart());
  
    try {
      // Make API request to authenticate user
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.message || 'Failed to sign in');
  
      // Store token and admin status
      localStorage.setItem('token', data.token);
      localStorage.setItem('isAdmin', data.isAdmin); // Fix: store isAdmin correctly
  
      dispatch(signInSuccess(data));
  
      // Role-Based Navigation
      if (data.isAdmin) {
        navigate('/admin'); // Redirect admin to dashboard
      } else {
        navigate('/profile'); // Redirect normal users to profile
      }
  
    } catch (error) {
      dispatch(signInFailure(error.message));
      console.error('Sign-in error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-amber-700 p-4 relative">
          <h1 className="text-3xl font-bold text-white text-center">Welcome Back</h1>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <p className="text-center text-gray-400 mb-8">
            Sign in to access your account and continue your journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-400 text-white"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-400 text-white"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 rounded-lg text-white bg-amber-700 hover:bg-amber-600"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Log in'}
            </button>
             <Link to = "/forgot-password"><div className='text-white'>Forgot your password?</div></Link>
            {/* OAuth Sign-in (Google, Facebook, etc.) */}
            <OAuth />
          </form>
           
          {/* Sign-Up Redirect */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account? 
              <Link to="/sign-up" className="font-medium text-amber-500 hover:text-amber-400"> Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
