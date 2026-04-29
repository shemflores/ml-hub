"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom right, #f3f4f6, #ffffff)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          width: "320px",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "10px" }}>Dashboard</h1>

        <p style={{ color: "#555", marginBottom: "20px" }}>
          Welcome, <strong>{user?.email}</strong>
        </p>

        <button
          onClick={() => (window.location.href = "/create-article")}
          style={buttonPrimary}
        >
          📝 My Articles
        </button>

        <button
          onClick={() => (window.location.href = "/articles")}
          style={buttonSecondary}
        >
          🌍 View All Articles
        </button>

        <button onClick={logout} style={buttonDanger}>
          Logout
        </button>
      </div>
    </div>
  );
}

// ✨ Button styles (clean + reusable)
const buttonPrimary = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};

const buttonSecondary = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  background: "#f9f9f9",
  cursor: "pointer",
};

const buttonDanger = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#ef4444",
  color: "#fff",
  cursor: "pointer",
};