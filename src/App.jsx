import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Opinions from "./pages/Opinions";
import Weekly from "./pages/Weekly";
import Submit from "./pages/Submit";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./hooks/useAuth";

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <div className="center-message">You are not an admin.</div>;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/opinions" element={<Opinions />} />
          <Route path="/weekly" element={<Weekly />} />
          <Route path="/submit" element={<Submit />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
