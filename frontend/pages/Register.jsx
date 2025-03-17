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
 
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };


  // Function to validate form inputs
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    // Email validation using regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password length validation
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
      isValid = false;
    } else {
      // Password complexity validation
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

    // Confirm password validation
    if (formData.confirmpassword !== formData.password) {
      newErrors.confirmpassword = 'Passwords do not match';
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  // Function to handle input changes
  
  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before sending request
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(false);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        setError(data.message || 'An error occurred while signing up');
        return;
      }
       navigate('/sign-in');
      // Redirect to sign-in page on successful registration
      
    } catch (err) {
      setLoading(false);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        {/* Username input */}
        <input
          type='text'
          placeholder='Username'
          id='username'
          className='bg-slate-100 p-3 rounded-lg'
          value={formData.username}
          onChange={handleChange}
        />
        {error.username && <p className='text-red-500 text-sm'>{error.username}</p>}

        {/* Email input */}
        <input
          type='email'
          placeholder='Email'
          id='email'
          className='bg-slate-100 p-3 rounded-lg'
          value={formData.email}
          onChange={handleChange}
        />
        {error.email && <p className='text-red-500 text-sm'>{error.email}</p>}

        {/* Password input */}
        <input
          type='password'
          placeholder='Password'
          id='password'
          className='bg-slate-100 p-3 rounded-lg'
          value={formData.password}
          onChange={handleChange}
        />
        {error.password && <p className='text-red-500 text-sm'>{error.password}</p>}

        {/* Confirm Password input */}
        <input
          type='password'
          placeholder='Confirm Password'
          id='confirmpassword'
          className='bg-slate-100 p-3 rounded-lg'
          value={formData.confirmpassword}
          onChange={handleChange}
        />
        {error.confirmpassword && <p className='text-red-500 text-sm'>{error.confirmpassword}</p>}

        {/* Submit button */}
        <button
          disabled={loading}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
        <OAuth />
      </form>

      {/* Sign in link */}
      <div className='flex gap-2 mt-5'>
        <p>Have an account?</p>
        <Link to='/sign-in'>
          <span className='text-blue-500'>Sign in</span>
        </Link>
      </div>

      {/* Display error message */}
      {error && <p className='text-red-700 mt-5'>{error}</p>}
    </div>
  );
}
