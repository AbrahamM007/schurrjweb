import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const sections = [
  { to: "/gallery", label: "Gallery" },
  { to: "/chronicles", label: "Chronicles" },
  { to: "/weekly", label: "News" }
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isHome = location.pathname === "/";

  return (
    <div className="app-shell">
      <div className="top-bar">
        {user ? (
          <div className="top-bar-user">
            <button className="admin-link-btn" onClick={() => navigate("/admin")}>
              Admin
            </button>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>
      <main className={isHome ? "main-content" : "main-content with-side-nav"}>
        {isHome ? null : (
          <nav className="side-nav">
            {sections.map((s) => (
              <NavLink key={s.to} to={s.to} className={({ isActive }) => (isActive ? "active" : "")}>
                {s.label}
              </NavLink>
            ))}
          </nav>
        )}
        <Outlet />
      </main>
    </div>
  );
}
