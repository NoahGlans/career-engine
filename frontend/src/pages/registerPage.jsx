import React from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/registerForm";

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="login-card">
        <h2>Register</h2>

        <RegisterForm
          onRegisterSuccess={() => navigate("/")}
        />

        <div className="register-link">
          <span>Already have an account?</span>
          <button onClick={() => navigate("/")}>Return to Login</button>
        </div>
      </div>
    </div>
  );
}
