import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./modules/context/AuthContext";
import { NotificationProvider } from "./modules/context/NotificationContext";
import { ThemeProvider } from "./modules/context/ThemeContext";

import LayoutComponent from "./modules/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Workspaces from "./pages/Workspaces";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Landing from "./pages/Landing";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>

      {/* Landing Page */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" /> : <Landing />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected App */}
      <Route
        element={
          <ProtectedRoute>
            <LayoutComponent />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workspaces" element={<Workspaces />} />
        <Route path="/workspaces/:workspaceId" element={<Projects />} />
        <Route path="/projects/:projectId" element={<Tasks />} />
      </Route>

    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
  <ThemeProvider>
    <NotificationProvider>
      <AppRoutes />
    </NotificationProvider>
  </ThemeProvider>
</AuthProvider>

  );
}

