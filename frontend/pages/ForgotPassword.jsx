import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const sendLink = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (email === "") {
      setError("Email is required!");
      return;
    }
    if (!email.includes("@")) {
      setError("Please include @ in your email!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/forgetpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.status === 201) {
        setEmail("");
        setMessage("Password reset link sent successfully!");
      } else {
        setError("Invalid User");
      }
    } catch (error) {
      setError(error.message);
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

          <form onSubmit={sendLink} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="block w-full p-3 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-3 rounded">
                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="bg-green-900/30 border border-green-500/50 text-green-300 p-3 rounded">
                <p>{message}</p>
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
