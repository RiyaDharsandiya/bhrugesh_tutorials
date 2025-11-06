import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaChalkboardTeacher,
  FaPlayCircle,
  FaUserPlus,
  FaBookOpen
} from "react-icons/fa";
import Loader from "../components/Loader";

export default function HomePage() {
  const user = JSON.parse(sessionStorage.getItem("user")); // ✅ Check if user is logged in

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      {loading && <Loader />}
      <section className="flex-grow flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 leading-tight flex items-center gap-3">
              <FaChalkboardTeacher className="text-indigo-600" />
              <span>Bhrugesh Tutorials</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              Learn Mathematics the smart way! Interactive lectures, insightful notes, and problem-solving techniques — all at one place.
            </p>

            <div className="flex flex-wrap gap-5 pt-4">
              {/* ✅ Show different button based on login status */}
              {user ? (
                <Link
                  to="/notes"
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 hover:scale-105 transform transition-all duration-300"
                  aria-label="Go to Notes"
                >
                  <FaBookOpen /> Go to Notes
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 hover:scale-105 transform transition-all duration-300"
                  aria-label="Join Now"
                >
                  <FaUserPlus /> Join Now
                </Link>
              )}

              <Link
                to="/lecture"
                className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-indigo-300 text-indigo-700 font-semibold hover:bg-indigo-50 hover:scale-105 transform transition-all duration-300"
                aria-label="Watch Lecture"
              >
                <FaPlayCircle /> Watch Lecture
              </Link>
            </div>
          </div>

          {/* Right Illustration */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-sm bg-gradient-to-tr from-indigo-100 to-indigo-50 rounded-3xl p-8 shadow-lg text-center">
              <FaBookOpen className="mx-auto text-indigo-600 text-7xl mb-6 animate-pulse" />
              <p className="text-2xl font-semibold text-indigo-700 mb-2">
                Practice Makes Perfect
              </p>
              <p className="text-gray-500">
                Watch, learn, and practice with confidence.
              </p>

              <div className="absolute -bottom-8 -right-8 bg-indigo-200 w-20 h-20 rounded-full opacity-40 blur-2xl"></div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
