import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Login failed. Check email/password or Firebase settings.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-box">
        <div className="login-title">Admin Login</div>
        <p className="login-summary">
          Sign in with your staff account to manage Spartan Weekly, gallery
          images, and opinions.
        </p>
        <form onSubmit={handleSubmit}>
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
          <div style={{ marginBottom: "1.2rem" }}>
            <div className="field-label">Password</div>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="primary-btn" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
