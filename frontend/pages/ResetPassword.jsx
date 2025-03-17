import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/auth/reset-password/${id}/${token}`, { newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate("/sign-in"), 2000);
    } catch (err) {
      setError("Error resetting password. Try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg">
        <h2 className="text-white text-2xl mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          {message && <p className="text-green-500">{message}</p>}
          {error && <p className="text-red-500">{error}</p>}
          <button className="w-full bg-amber-700 p-3 text-white rounded-lg" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
