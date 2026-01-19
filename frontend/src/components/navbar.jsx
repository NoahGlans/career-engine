import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="navbar-left" onClick={() => navigate("/dashboard")}>
        <img src="/favicon.png" alt="Career Engine Logo" className="navbar-logo" />
        <h1 className="navbar-title">Career Engine</h1>
      </div>
      </div>
  );
}

export default Navbar;
