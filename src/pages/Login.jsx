import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignUp) {
        const role = adminPassword === "schurrjw" ? "admin" : "writer";

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: displayName || email.split('@')[0],
              role: role
            }
          }
        });

        if (signUpError) throw signUpError;

        navigate("/admin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        navigate("/admin");
      }
    } catch (err) {
      console.error("Auth error:", err);
      let errorMsg = isSignUp ? "Sign up failed. " : "Login failed. ";

      if (err.message?.includes('already registered')) {
        errorMsg += "This email is already registered. Try logging in instead.";
      } else if (err.message?.includes('Password')) {
        errorMsg += "Password should be at least 6 characters.";
      } else if (err.message?.includes('Invalid')) {
        errorMsg += "Invalid email or password.";
      } else {
        errorMsg += err.message || "Please try again.";
      }

      alert(errorMsg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-box">
        <div className="login-title">{isSignUp ? "Create Account" : "Admin Login"}</div>
        <p className="login-summary">
          {isSignUp
            ? "Create a staff account. Enter admin password to get admin access."
            : "Sign in with your staff account to manage content."}
        </p>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div style={{ marginBottom: "0.9rem" }}>
              <div className="field-label">Display Name</div>
              <input
                className="field-input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}
          <div style={{ marginBottom: "0.9rem" }}>
            <div className="field-label">Email</div>
            <input
              className="field-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: "0.9rem" }}>
            <div className="field-label">Password</div>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {isSignUp && (
            <div style={{ marginBottom: "0.9rem" }}>
              <div className="field-label">Admin Password (optional)</div>
              <input
                className="field-input"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Leave blank for regular user"
              />
            </div>
          )}
          <button className="primary-btn" disabled={busy} style={{ marginBottom: "0.8rem" }}>
            {busy ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Create account" : "Sign in")}
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ width: "100%" }}
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}
