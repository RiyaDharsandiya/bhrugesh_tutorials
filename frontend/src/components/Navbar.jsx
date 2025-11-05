import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBook, FaNotesMedical, FaSignInAlt, FaUserCircle, FaBars, FaTimes, FaChalkboardTeacher } from "react-icons/fa";

export default function Navbar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/auth");
    setMenuOpen(false);
  };

  const linkClass = (path) =>
    `flex items-center gap-1 py-2 px-3 rounded-md font-medium transition ${
      loc.pathname === path ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <nav className="w-full bg-indigo-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          <FaChalkboardTeacher className="text-indigo-700" /> Bhrugesh Tutorials
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5">
          <Link to="/lecture" className={linkClass("/lecture")} aria-label="Lecture">
            <FaBook /> Lecture
          </Link>
          <Link to="/notes" className={linkClass("/notes")} aria-label="Notes">
            <FaNotesMedical /> Notes
          </Link>

          {!user ? (
            <Link
              to="/auth"
              className="flex items-center gap-1 py-2 px-4 bg-indigo-600 text-white rounded-full shadow-sm hover:opacity-95 transition"
              aria-label="Login"
            >
              <FaSignInAlt /> Login
            </Link>
          ) : (
            <div className="flex items-center gap-4 text-gray-700">
              <FaUserCircle className="text-indigo-600 text-xl" />
              <span>Welcome, {user.name.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="py-1 px-3 rounded-md bg-indigo-600 text-white hover:bg-red-50 hover:text-red-600 font-medium transition"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile nav toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-600 hover:text-indigo-600 focus:outline-none"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <FaTimes className="h-8 w-8" /> : <FaBars className="h-8 w-8" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <Link
            to="/lecture"
            onClick={() => setMenuOpen(false)}
            className={` py-3 px-4 flex items-center gap-2 ${
              loc.pathname === "/lecture" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Lecture"
          >
            <FaBook /> Lecture
          </Link>
          <Link
            to="/notes"
            onClick={() => setMenuOpen(false)}
            className={` py-3 px-4 flex items-center gap-2 ${
              loc.pathname === "/notes" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Notes"
          >
            <FaNotesMedical /> Notes
          </Link>
          {!user ? (
            <Link
              to="/auth"
              onClick={() => setMenuOpen(false)}
              className=" py-3 px-4 bg-indigo-600 text-white rounded flex items-center justify-center gap-2"
              aria-label="Login"
            >
              <FaSignInAlt /> Login
            </Link>
          ) : (
            <div className="border-t border-gray-200 py-3 px-4 flex items-center justify-between text-gray-700">
              <span className="flex items-center gap-2">
                <FaUserCircle className="text-indigo-600" />
                Welcome, {user.name.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="py-1 px-3 rounded-md bg-indigo-600 text-white hover:bg-red-50 hover:text-red-600 font-medium transition"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
