import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // State to manage form data
  const [formData, setFormData] = useState({
    email: '',
  });

  // Handles input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handles form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    axios.post('/api/auth/forgot-password', { email: formData.email })
      .then(res => {
        if (res.data.Status === "Success") {
          setSuccess('Password reset link sent! Redirecting...');
          setTimeout(() => navigate('/sign-in'), 2000); // Redirect after 2 sec
        }
      })
      .catch(err => {
        setError('Failed to send reset link. Please try again.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-amber-700 p-4 relative">
          <h1 className="text-3xl font-bold text-white text-center">Reset Your Password</h1>
        </div>

        {/* Form Section */}
        <div className="p-8">
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

            {/* Error/Success Messages */}
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 rounded-lg text-white bg-amber-700 hover:bg-amber-600"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Reset'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
