import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Chronicles from "./pages/Chronicles";
import About from "./pages/About";
import Weekly from "./pages/Weekly";
import Submit from "./pages/Submit";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { auth, db } from "./lib/firebase";
import SetupRequired from "./components/ui/SetupRequired";

export default function App() {
  if (!auth || !db) {
    return <SetupRequired />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      } />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/chronicles" element={<Chronicles />} />
        <Route path="/about" element={<About />} />
        <Route path="/weekly" element={<Weekly />} />
        <Route path="/submit" element={<Submit />} />
      </Route>
    </Routes>
  );
}
