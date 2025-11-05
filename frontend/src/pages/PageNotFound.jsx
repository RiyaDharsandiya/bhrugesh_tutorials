import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100 text-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full"
      >
        <FaExclamationTriangle className="text-indigo-600 text-6xl mb-4 mx-auto" />
        <h1 className="text-3xl font-bold text-indigo-700 mb-3">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition-all duration-300"
        >
          Go to Home
        </Link>
      </motion.div>
    </div>
  );
}
