import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Chronicles from "./pages/Chronicles";
import About from "./pages/About";
import Weekly from "./pages/Weekly";
import Submit from "./pages/Submit";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./hooks/useAuth";

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  // For demo purposes, we might want to bypass this or make it easier
  // if (!user) return <Navigate to="/login" />;
  // if (!isAdmin) return <div className="p-8 text-center font-bold text-xl">Access Denied</div>;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/chronicles" element={<Chronicles />} />
          <Route path="/about" element={<About />} />
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
