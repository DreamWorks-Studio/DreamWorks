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
    rememberMe: false, // Checkbox for "Remember Me" (if needed)
  });

  // Handles input changes for all fields, including checkbox
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior
    setLoading(true); // Set loading state to true

    try {
      dispatch(signInStart()); // Dispatch action to start sign-in process

      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Send form data as JSON
      });

      const data = await res.json(); // Parse response JSON

      if (data.success === false) { // Check if the response indicates failure
        dispatch(signInFailure(data.message)); // Dispatch failure action with error message
        setLoading(false);
        return;
      }

      dispatch(signInSuccess(data)); // Dispatch success action with user data
      navigate('/profile'); // Redirect to profile page after successful login
    } catch (error) {
      setLoading(false);
      dispatch(signInFailure(error.message)); // Dispatch failure action with error message
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
                id="email"
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
                id="password"
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
