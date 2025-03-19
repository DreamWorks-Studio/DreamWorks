import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // State to manage form data
  const [formData, setFormData] = useState({ email: "" });

  // Handles input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
    if (success) setSuccess("");
  };

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Make API request to backend forgot-password route
      const res = await axios.post("/api/auth/forgot-password", { email: formData.email });

      setSuccess(res.data.message || "Reset link has been sent to your email");
      toast.success("Reset link sent successfully!");

      // Redirect to sign-in page after 5 seconds
      setTimeout(() => navigate("/sign-in"), 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to send reset link. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-amber-700 p-4">
          <h1 className="text-3xl font-bold text-white text-center">Reset Your Password</h1>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <p className="text-gray-300 mb-6">
            Enter your email address and we'll send you a link to reset your password.
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
                className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-3 rounded">
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-900/30 border border-green-500/50 text-green-300 p-3 rounded">
                <p>{success}</p>
                <p className="text-xs mt-1">Redirecting to login page in a few seconds...</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 rounded-lg text-white bg-amber-700 hover:bg-amber-600 transition duration-200 font-medium disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            {/* Back to Login */}
            <div className="text-center mt-4">
              <Link to="/sign-in" className="text-amber-500 hover:text-amber-400 text-sm">
                Remember your password? Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
