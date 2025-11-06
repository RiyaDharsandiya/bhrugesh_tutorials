import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import auth from "../assets/auth.jpg";
import Loader from "../components/Loader";

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", standard: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggle = () => setIsSignup((s) => !s);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        const res = await axios.post(`${API_URL}/api/auth/signup`, form);
        toast.success(res.data.message || "Verification code sent to your email!");
        sessionStorage.setItem("pendingEmail", form.email);
        navigate("/verify-email");
        setForm({ name: "", email: "", password: "", standard: "" });
        return;
      }

      // LOGIN FLOW
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: form.email,
        password: form.password,
      });

      toast.success(res.data.message || "Login successful!");
      if (res.data.user && res.data.token) {
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
        sessionStorage.setItem("token", res.data.token);
        navigate("/lecture");
      } else {
        toast.error("Login failed. Try again.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
  {loading?<Loader/>:
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${auth})` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-10"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-black flex items-center gap-3 drop-shadow-md">
            {isSignup ? <FaUserPlus /> : <FaSignInAlt />}{" "}
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
          <button
            onClick={toggle}
            className="text-sm text-black hover:text-indigo-600 underline transition"
          >
            {isSignup ? "Already have an account?" : "New here? Sign up"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          {isSignup && (
            <>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="px-4 py-3 border border-indigo-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-indigo-300 outline-none"
                required
              />
              <select
                name="standard"
                value={form.standard}
                onChange={handleChange}
                className="px-4 py-3 border border-indigo-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-indigo-300 outline-none"
                required
              >
                <option value="">Select Standard</option>
                <option value="Std8">Std 8</option>
                <option value="Std9">Std 9</option>
                <option value="Std10">Std 10</option>
                <option value="Std11">Std 11</option>
                <option value="Std12">Std 12</option>
              </select>
            </>
          )}

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            className="px-4 py-3 border border-indigo-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-indigo-300 outline-none"
            required
          />

          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className="px-4 py-3 border border-indigo-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-indigo-300 outline-none"
            required
          />
          <div className="text-right">
            {!isSignup && (
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-indigo-700 hover:underline"
              >
                Forgot Password?
              </button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg hover:from-indigo-700 hover:to-violet-700 transition-all duration-300"
          >
            {isSignup ? (loading ? "Sending Code..." : "Sign Up") : loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

        <p className="text-center text-black text-xs mt-6 font-medium">
          © 2025 Bhrugesh Tutorials — Learn • Practice • Succeed
        </p>
      </motion.div>

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
}
    </>
  );
}
