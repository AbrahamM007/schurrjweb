import React from "react";
import { NavLink } from "react-router-dom";
import hero from "../assets/images/hero.png";

const navLinks = [
  {
    to: "/weekly",
    label: "NEWS",
    emoji: "📰",
    description: "Latest updates"
  },
  {
    to: "/chronicles",
    label: "CHRONICLES",
    emoji: "📖",
    description: "Stories & features"
  },
  {
    to: "/gallery",
    label: "GALLERY",
    emoji: "📸",
    description: "Visual stories"
  },
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
            <span>SCHURR</span>
            <br />
            <span>JOURNALISM</span>
          </div>
        </div>

        <div className="mobile-hero-cards">
          {navLinks.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="mobile-hero-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mobile-hero-card-emoji">{link.emoji}</div>
              <div className="mobile-hero-card-content">
                <div className="mobile-hero-card-label">{link.label}</div>
                <div className="mobile-hero-card-desc">{link.description}</div>
              </div>
              <div className="mobile-hero-card-arrow">→</div>
            </NavLink>
          ))}
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