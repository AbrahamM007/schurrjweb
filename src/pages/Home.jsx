import React from "react";
import { NavLink } from "react-router-dom";
import hero from "../assets/images/hero.png";

// Reordering links to match the image: NEWS, SPORTS, OPINIONS, GALLERY
const navLinks = [
  { to: "/weekly", label: "NEWS" },
  { to: "/opinions", label: "OPINIONS" },
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
      {/* Remove hero-overlay for a darker image blend instead of a pure color overlay */}
      <div className="hero-content">
        {/* Vertical text on the left */}
        <div className="hero-left">SCHURR</div>

        {/* Vertical navigation rail on the right */}
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

        {/* Large "JOURNALISM" text at the bottom */}
        <div className="hero-center">
          <div className="hero-title">
            <span>JOURNALISM</span>
          </div>
        </div>
      </div>
    </section>
  );
}