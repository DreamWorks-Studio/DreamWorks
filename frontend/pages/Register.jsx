import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmpassword: '',
  });

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
      isValid = false;
    } else {
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

      if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
        newErrors.password =
          'Password must include uppercase, lowercase, number, and special character';
        isValid = false;
      }
    }

    if (formData.confirmpassword !== formData.password) {
      newErrors.confirmpassword = 'Passwords do not match';
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError({});

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log('API Response:', data);

      navigate('/sign-in');
      setLoading(false);

      if (!data.success) {
        setError({ api: data.message || 'An error occurred while signing up' });
        return;
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
      setError({ api: 'Something went wrong. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Photography-themed header */}
        <div className="bg-gradient-to-r from-black/90 to-black/80 p-8 text-center">
          <h1 className="text-3xl font-bold text-white">Create Your Account</h1>
          <p className="text-amber-400 text-sm mt-2">Start capturing your memories</p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input with user icon */}
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-medium">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 p-3 rounded-lg bg-white border border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-gray-900 transition-colors"
                  placeholder='Enter your username'
                  required
                />
              </div>
              {error.username && <p className="text-red-500 text-sm mt-1">{error.username}</p>}
            </div>

            {/* Email Input with email icon */}
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
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 p-3 rounded-lg bg-white border border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-gray-900 transition-colors"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
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
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 p-3 rounded-lg bg-white border border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-gray-900 transition-colors"
                  placeholder='Enter your password'
                  required
                />
              </div>
              {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
            </div>

            {/* Confirm Password Input with lock icon */}
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="confirmpassword"
                  value={formData.confirmpassword}
                  onChange={handleChange}
                  className="block w-full pl-10 p-3 rounded-lg bg-white border border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-gray-900 transition-colors"
                  placeholder='Confirm your password'
                  required
                />
              </div>
              {error.confirmpassword && <p className="text-red-500 text-sm mt-1">{error.confirmpassword}</p>}
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
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12zm0-8a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Sign Up
                </span>
              )}
            </button>

            {/* API Error Message */}
            {error.api && <p className="text-red-500 text-center mt-2">{error.api}</p>}

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
            
            {/* OAuth Sign-up */}
            <OAuth />
          </form>

          {/* Sign-In Redirect - Enhanced */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? 
              <Link to="/sign-in" className="ml-1 font-medium text-amber-600 hover:text-amber-800 transition-colors"> Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}