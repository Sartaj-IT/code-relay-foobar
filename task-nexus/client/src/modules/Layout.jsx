import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../modules/context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  LogOut,
  User,
  Bell,
  Moon,
  Sun
} from 'lucide-react';

import { useNotifications } from "../modules/context/NotificationContext";
import { useTheme } from "../modules/context/ThemeContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { notifications, unreadCount, markAsRead, toast } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar glass">
        <div className="sidebar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 className="sidebar-logo">
            Task<span className="text-primary">Nexus</span>
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* 🌙 Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* 🔔 Notification Bell */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: "red",
                      color: "white",
                      borderRadius: "50%",
                      fontSize: "12px",
                      padding: "2px 6px"
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "30px",
                    right: 0,
                    background: "#111",
                    padding: "10px",
                    borderRadius: "8px",
                    width: "220px",
                    zIndex: 1000
                  }}
                >
                  {notifications.length === 0 && <p>No notifications</p>}

                  {notifications.map(n => (
                    <div key={n.id} style={{ marginBottom: "8px" }}>
                      <p style={{ fontSize: "13px" }}>{n.message}</p>

                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          style={{ fontSize: "11px" }}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/workspaces" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Building2 size={20} />
            <span>Workspaces</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar"><User size={18} /></div>
            <div className="user-details">
              <span className="user-name">{user?.username || user?.data?.username || 'User'}</span>
              <span className="user-email">{user?.email || user?.data?.email || ''}</span>
            </div>
          </div>

          <button className="btn-ghost logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      {/* 🔥 Toast Popup */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#222",
            padding: "12px 18px",
            borderRadius: "8px",
            color: "white"
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
