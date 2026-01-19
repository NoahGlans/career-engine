import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/loginForm";

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="login-card">
        <h2>Login</h2>
        <LoginForm
          onLoginSuccess={(userId) => {
            // Safely call onLoginSuccess if it exists
            onLoginSuccess?.(userId);
            // Navigate to dashboard
            navigate("/dashboard");
          }}
        />
        <div className="register-link">
          <span>Don't have an account?</span>
          <button onClick={() => navigate("/register")}>Register</button>
        </div>
      </div>
    </div>
  );
}
