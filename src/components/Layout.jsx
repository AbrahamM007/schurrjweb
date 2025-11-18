import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const sections = [
  { to: "/gallery", label: "Gallery" },
  { to: "/opinions", label: "Opinions" },
  { to: "/weekly", label: "News" }
];

export default function Layout() {
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <div className="app-shell">
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
