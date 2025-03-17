import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });

  // Check token validity
  useEffect(() => {
    // Optional: Verify token before showing reset form
    // This is just a simple check that token and ID exist
    if (!id || !token) {
      setTokenValid(false);
      setError("Invalid password reset link");
    }
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear any previous errors when typing
    if (error) setError("");
    if (message) setMessage("");

    // Check password strength if newPassword field is being updated
    if (name === "newPassword") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    // Simple password strength checker
    let score = 0;
    let feedback = "";

    if (password.length < 8) {
      feedback = "Password is too short";
    } else {
      score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;
      
      if (score === 1) feedback = "Weak password";
      else if (score === 2) feedback = "Fair password";
      else if (score === 3) feedback = "Good password";
      else if (score === 4) feedback = "Strong password";
    }

    setPasswordStrength({ score, feedback });
  };

  const getStrengthColor = () => {
    switch (passwordStrength.score) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      // Use the correct backend URL
      const res = await axios.post(`/api/auth/reset-password/${id}/${token}`, { 
        newPassword: formData.newPassword 
      });
      
      setMessage(res.data.message || "Password reset successful!");
      setTimeout(() => navigate("/sign-in"), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error resetting password. Please try again.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg text-center">
          <div className="text-red-500 mb-4">Invalid or expired password reset link</div>
          <Link to="/forgot-password" className="text-amber-500 hover:text-amber-400">
            Request a new password reset
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-amber-700 p-4">
          <h2 className="text-white text-2xl font-bold text-center">Create New Password</h2>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">New Password</label>
              <input
                type="password"
                name="newPassword"
                className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:ring-2 focus:ring-amber-500"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength="8"
              />
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-1 rounded-full ${getStrengthColor()}`}></div>
                    <span className="text-xs text-gray-300">{passwordStrength.feedback}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:ring-2 focus:ring-amber-500"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            {message && <p className="text-green-500 text-sm">{message}</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <button 
              className="w-full bg-amber-700 hover:bg-amber-600 p-3 text-white rounded-lg transition duration-200 font-medium" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;