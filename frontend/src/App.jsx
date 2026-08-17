import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppProvider } from "./context/AppContext";
import CustomCursor from "./components/ui/CustomCursor";
import CivicSevaLoading from "./components/CivicSevaLoading";

import Home from "./pages/Home";
import Login from "./pages/Login";
import CitizenRegister from "./pages/CitizenRegister";
import Categories from "./pages/Categories";
import Channel from "./pages/Channel";
import ReportForm from "./pages/ReportForm";
import Success from "./pages/Success";
import TrackComplaint from "./pages/TrackComplaint";
import GovLogin from "./pages/GovLogin";
import Dashboard from "./pages/Dashboard";
import IssueDetail from "./pages/IssueDetail";
import CitizenLogin from "./pages/CitizenLogin";

import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [fadeLoading, setFadeLoading] = useState(false);

  const handleLoadingComplete = () => {
    // Start fade-out
    setFadeLoading(true);

    // Remove loading screen after fade completes
    window.setTimeout(() => {
      setShowLoading(false);
    }, 600);
  };

  return (
    <AppProvider>
      <BrowserRouter>

        {/* =========================================
            MAIN APPLICATION
        ========================================= */}

        <div
          style={{
            minHeight: "100vh",
            position: "relative",
          }}
        >
          <CustomCursor />

          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />

            <Route
              path="/citizen-register"
              element={<CitizenRegister />}
            />

            <Route
              path="/categories"
              element={<Categories />}
            />

            <Route
              path="/channel"
              element={<Channel />}
            />

            <Route
              path="/report"
              element={<ReportForm />}
            />

            <Route
              path="/success"
              element={<Success />}
            />

            <Route
              path="/track"
              element={<TrackComplaint />}
            />

            <Route
              path="/gov-login"
              element={<GovLogin />}
            />

            {/* GOVERNMENT SIDE */}
            <Route
              path="/dashboard/:dept"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/issue/:id"
              element={<IssueDetail />}
            />

            <Route
              path="/citizen-login"
              element={<CitizenLogin />}
            />
          </Routes>

          {/* =========================================
              LOADING SCREEN
          ========================================= */}

          {showLoading && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999,

                opacity: fadeLoading ? 0 : 1,

                transition:
                  "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)",

                pointerEvents:
                  fadeLoading ? "none" : "auto",
              }}
            >
              <CivicSevaLoading
                onComplete={handleLoadingComplete}
              />
            </div>
          )}
        </div>

      </BrowserRouter>
    </AppProvider>
  );
}