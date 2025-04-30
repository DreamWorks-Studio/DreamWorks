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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Photography-themed header with slight enhancement */}
        <div className="bg-gradient-to-r from-black/90 to-black/80 p-8 text-center">
          <h1 className="text-3xl font-bold text-white">Capture Your Moments</h1>
          <p className="text-amber-400 text-sm mt-2">Sign in to access your memories</p>
        </div>

        {/* Form Section with enhanced UI */}
        <div className="p-8">
          
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input with camera icon */}
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-medium">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 p-3 rounded-lg bg-white border border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-gray-900 transition-colors"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input with lock icon */}
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-medium">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 p-3 rounded-lg bg-white border border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-gray-900 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700">
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button with camera shutter animation on loading */}
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-white bg-black hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Developing...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12zm0-8a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Sign In
                </span>
              )}
            </button>

            {/* Divider with film strip design */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-white px-4 flex items-center">
                  <div className="w-2 h-4 bg-gray-300 mx-1 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-300 mx-1 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-300 mx-1 rounded-sm"></div>
                </div>
              </div>
            </div>
            
            {/* OAuth Sign-in */}
            <OAuth />
          </form>

          {/* Sign-Up Redirect - Enhanced */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? 
              <Link to="/sign-up" className="ml-1 font-medium text-amber-600 hover:text-amber-800 transition-colors"> Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;