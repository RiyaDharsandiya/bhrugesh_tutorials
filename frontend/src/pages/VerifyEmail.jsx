import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import auth from "../assets/auth.jpg"; // same background as AuthPage

const API_URL = import.meta.env.VITE_API_URL;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("pendingEmail");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Enter the verification code.");

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-email`, { email, code });
      toast.success("Email verified successfully!");

      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.removeItem("pendingEmail");

      navigate("/lecture");
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${auth})` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md bg-indigo-100/90 backdrop-blur-xl border border-indigo-200 shadow-2xl rounded-3xl p-10 text-center"
      >
        <h2 className="text-3xl font-bold text-indigo-700 mb-4">Verify Your Email</h2>
        <p className="text-gray-700 mb-6">
          Enter the 6-digit verification code sent to <br />
          <span className="font-semibold text-indigo-800">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="flex flex-col gap-5">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Verification Code"
            className="px-4 py-3 rounded-xl text-center bg-white text-black font-semibold border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg hover:from-indigo-700 hover:to-violet-700 transition-all duration-300"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </motion.button>
        </form>

        <p className="text-xs text-gray-600 mt-6 font-medium">
          © 2025 Bhrugesh Tutorials — Learn • Practice • Succeed
        </p>

      </motion.div>
        <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
