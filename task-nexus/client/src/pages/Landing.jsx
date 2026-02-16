import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../modules/context/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  if (user) return <Navigate to="/dashboard" />;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{ textAlign: "center" }}>

        <h1>Plan. Track. Succeed.</h1>

        <p>Task Nexus helps teams manage projects.</p>

        <Link to="/login">
          <button className="auth-btn">Login</button>
        </Link>

        <Link to="/register">
          <button className="auth-btn">Register</button>
        </Link>

      </div>
    </div>
  );
}
