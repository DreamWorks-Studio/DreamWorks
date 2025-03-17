import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { signInStart, signInSuccess, signInFailure } from '../src/redux/user/userSlice'; 
import OAuth from '../components/OAuth'; 
import { Link } from 'react-router-dom'; 

const SignIn = () => {
  const [loading, setLoading] = useState(false); // State for managing loading status
  const dispatch = useDispatch(); // Redux dispatch function
  const navigate = useNavigate(); // Hook for navigation

  // State to manage form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Handles input changes for all fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // Ensure correct field mapping
    });
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior
    setLoading(true); // Set loading state to true

    try {
      dispatch(signInStart()); // Dispatch action to start sign-in process

      const res = await fetch('/api/auth/signin', { // Ensure correct backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Send form data as JSON
      });

      const data = await res.json(); // Parse response JSON

      if (!res.ok) { // If the response is not OK, handle error
        throw new Error(data.message || 'Failed to sign in');
      }

      dispatch(signInSuccess(data)); // Dispatch success action with user data
      navigate('/'); // Redirect to homepage after successful login
    } catch (error) {
      dispatch(signInFailure(error.message)); // Dispatch failure action with error message
      console.error('Sign-in error:', error.message); // Log error for debugging
    } finally {
      setLoading(false); // Reset loading state
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
                name="email" // Fixed: Ensure this matches state keys
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
                name="password" // Fixed: Ensure this matches state keys
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
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Loading...' : 'Log in'}
            </button>

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
