import React, { Suspense, lazy } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PageNotFound from "./pages/PageNotFound";

// Lazy Pages
const HomePage = lazy(() =>
  import("./pages/HomePage")
);

const AuthPage = lazy(() =>
  import("./pages/AuthPage")
);

const LecturePage = lazy(() =>
  import("./pages/LecturePage")
);

const NotesPage = lazy(() =>
  import("./pages/NotesPage")
);

const ChapterPage = lazy(() =>
  import("./pages/ChapterPage")
);

const VerifyEmail = lazy(() =>
  import("./pages/VerifyEmail")
);

function App() {
  // email stored during signup
  const verifyEmail =
    sessionStorage.getItem("verifyEmail");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-grow">
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* ---------- PUBLIC ROUTES ---------- */}

            <Route
              path="/"
              element={<HomePage />}
            />

            <Route
              path="/auth"
              element={<AuthPage />}
            />

            {/* Forgot Password */}
            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            {/* Reset Password */}
            <Route
              path="/reset-password/:token"
              element={<ResetPassword />}
            />

            {/* ---------- VERIFY EMAIL ---------- */}

            <Route
              path="/verify-email"
              element={<VerifyEmail />}
            />

            {/* ---------- PROTECTED ROUTES ---------- */}

            <Route
              path="/lecture"
              element={
                <ProtectedRoute>
                  <LecturePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notes"
              element={
                <ProtectedRoute>
                  <NotesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/lecture/:chapterName"
              element={
                <ProtectedRoute>
                  <ChapterPage />
                </ProtectedRoute>
              }
            />

            {/* ---------- 404 PAGE ---------- */}

            <Route
              path="*"
              element={<PageNotFound />}
            />
          </Routes>
        </Suspense>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;