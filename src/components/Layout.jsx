import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";

export default function Layout() {
  const location = useLocation();
  // We might want to hide navbar/footer on specific pages like a full-screen login or specific admin views if requested,
  // but for now, we'll keep them consistent.

  return (
    <div className="min-h-screen flex flex-col bg-schurr-white text-schurr-black font-body selection:bg-schurr-green selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
