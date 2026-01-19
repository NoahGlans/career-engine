import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import "./index.css";

import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import DashboardPage from "./pages/dashboardPage";
import ApplicationPage from "./pages/applicationPage";
import CoverLetterPage from "./pages/coverLetterPage";
import ResumePage from "./pages/resumePage";
import Navbar from "./components/navbar";

/* Layout that includes Navbar */
function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth pages (NO navbar) */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* App pages (WITH navbar) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/applications" element={<ApplicationPage />} />
          <Route path="/cover-letters" element={<CoverLetterPage />} />
          <Route path="/resumes" element={<ResumePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
