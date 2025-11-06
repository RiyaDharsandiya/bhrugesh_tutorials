import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader"; // Adjust the import path as needed

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      toast.success(res.data.message);
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-indigo-50">
      {/* Loader overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Loader />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`bg-white p-10 rounded-2xl shadow-lg w-full max-w-md ${loading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">
          Forgot Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your registered email"
            className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none"
            disabled={loading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </motion.button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Remember password?{" "}
          <button
            onClick={() => navigate("/auth")}
            className="text-indigo-600 hover:underline"
            disabled={loading}
          >
            Login
          </button>
        </p>
      </motion.div>

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
