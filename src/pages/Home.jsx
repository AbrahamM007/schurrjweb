import React from "react";
import { NavLink } from "react-router-dom";
import hero from "../assets/images/hero.png";

// Reordering links to match the image: NEWS, SPORTS, OPINIONS, GALLERY
const navLinks = [
  { to: "/weekly", label: "NEWS" },
  { to: "/chronicles", label: "CHRONICLES" },
  { to: "/gallery", label: "GALLERY" },
];

export default function Home() {
  return (
    <section className="hero">
      <div
        className="hero-media"
        style={{
          backgroundImage: `url(${hero})`,
        }}
      />
      <div className="hero-content">
        <div className="hero-left">SCHURR</div>

        <nav className="hero-right-rail">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hero-center">
          <div className="hero-title">
            <span>JOURNALISM</span>
          </div>
        </div>

        <div className="bottom-strip">
          <div className="bottom-strip-inner">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}