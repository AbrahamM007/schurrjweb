import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const isAdmin = adminPassword === "schurrjw";

        await supabase.from('users').insert({
          id: userCredential.user.uid,
          email: email,
          display_name: displayName || email.split('@')[0],
          is_admin: isAdmin
        });

        navigate("/admin");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/admin");
      }
    } catch (err) {
      console.error(err);
      alert(isSignUp ? "Sign up failed. User may already exist." : "Login failed. Check email/password.");
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
