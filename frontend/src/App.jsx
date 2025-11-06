import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer"; 
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PageNotFound from "./pages/PageNotFound"; // ✅ new import

const HomePage = lazy(() => import("./pages/HomePage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const LecturePage = lazy(() => import("./pages/LecturePage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const ChapterPage = lazy(() => import("./pages/ChapterPage"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));

function App() {
  const pendingEmail = sessionStorage.getItem("pendingEmail");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow">
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Forgot/Reset Password routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Verify Email - accessible only if email pending */}
            <Route
            path="/verify-email"
            element={
              sessionStorage.getItem("pendingEmail") ? <VerifyEmail /> : <Navigate to="/auth" replace />
            }
          />

            {/* ✅ Protected routes */}
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

            {/* ✅ 404 Page */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

export default App;
