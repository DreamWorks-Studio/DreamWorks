import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const ResetPassword = () => {
  const { id, token } = useParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const userValid = async () => {
    try {
      const res = await fetch(`/api/user/updateResetPassword/${id}/${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (data.status === 201) {
        console.log("User is valid");
      } else {
        setError("Invalid user or token.");
      }
    } catch (error) {
      //setError("An error occurred while checking user validity.");
    }
  };

  useEffect(() => {
    userValid();
  }, []);

  const handleChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{5,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain at least one uppercase letter, one number, one symbol, and be at least 5 characters long."
      );
      return;
    }

    try {
      const res = await fetch(`/api/user/updateResetPassword/${id}/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.status === 201) {
        setPassword("");
        setMessage("Password updated successfully.");
      } else {
        setError("Token expired. Please generate a new link.");
      }
    } catch (error) {
      setError("An error occurred while updating password.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-96">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-center bg-orange-600 py-3 rounded-t-lg">
          Reset Your Password
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-gray-300 text-center mt-3">
          Enter your new password to reset your account.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          {/* Password Input */}
          <div>
            <label htmlFor="password" className="text-sm font-medium">
              New Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter new password"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute top-2 right-3 text-gray-400"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94a10 10 0 01-5.94 2 10 10 0 01-5.94-2"></path>
                    <path d="M3 3l18 18"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="bg-red-600 text-white text-sm p-2 rounded text-center">
              {error}
            </p>
          )}

          {/* Success Message */}
          {message && (
            <p className="bg-green-600 text-white text-sm p-2 rounded text-center">
              {message}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            Submit
          </button>
        </form>

        {/* Back to Login */}
        <div className="text-center mt-4">
          <Link
            to="/sign-in"
            className="text-orange-400 hover:text-orange-500 text-sm"
          >
            Remember your password? Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
