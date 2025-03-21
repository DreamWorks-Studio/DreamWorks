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
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-3'>
      <div className=' w-110 max-w-md bg-gray-800 rounded-lg shadow-2xl overflow-hidden '>
      <div className="bg-amber-700 p-1 relative">
        <h1 className='text-3xl text-center font-bold mb-6 text-white'>
         Create An Account
        </h1>
        </div>
        <div className="p-8">
        <form onSubmit={handleSubmit} className='flex flex-col gap-2 space-y-2'>
          {/* Username */}
          <div>
            <label className='block text-sm font-medium text-gray-300'>
              Username
            </label>
            <input
              type='text'
              name='username'
              id='username'
              className='w-full mt-2 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500'
              placeholder='Enter your username'
              value={formData.username}
              onChange={handleChange}
            />
            {error.username && <p className='text-red-500 text-sm'>{error.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className='block text-sm font-medium text-gray-300'>
              Email
            </label>
            <input
              type='email'
              name='email'
              id='email'
              className='w-full mt-2 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500'
              placeholder='Enter your email'
              value={formData.email}
              onChange={handleChange}
            />
            {error.email && <p className='text-red-500 text-sm'>{error.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className='block text-sm font-medium text-gray-300'>
              Password
            </label>
            <input
              type='password'
              name='password'
              id='password'
              className='w-full mt-2 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500'
              placeholder='Enter your password'
              value={formData.password}
              onChange={handleChange}
            />
            {error.password && <p className='text-red-500 text-sm'>{error.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className='block text-sm font-medium text-gray-300'>
              Confirm Password
            </label>
            <input
              type='password'
              name='confirmpassword'
              id='confirmpassword'
              className='w-full mt-2 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500'
              placeholder='Confirm your password'
              value={formData.confirmpassword}
              onChange={handleChange}
            />
            {error.confirmpassword && <p className='text-red-500 text-sm'>{error.confirmpassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            className='w-full bg-amber-700 text-white p-3 rounded-lg uppercase hover:opacity-90 disabled:opacity-70'
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>

          {/* OAuth Login */}
          <OAuth />

          {/* Sign-in link */}
          <div className='text-center mt-4'>
            <p className='text-gray-400'>
              Already have an account?{' '}
              <Link to='/sign-in' className='text-amber-600 hover:underline'>
                Sign in
              </Link>
            </p>
          </div>

          {/* API Error Message */}
          {error.api && <p className='text-red-500 text-center mt-4'>{error.api}</p>}
        </form>
        </div>
      </div>
    </div>
  );
}
