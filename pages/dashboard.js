"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState(null);

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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Dashboard</h1>

      <p>Welcome, {user?.email}</p>

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => (window.location.href = "/create-article")}>
          📝 My Articles
        </button>

        <br /><br />

        <button onClick={() => (window.location.href = "/articles")}>
          🌍 View All Articles
        </button>

        <br /><br />

        <button onClick={logout} style={{ color: "red" }}>
          Logout
        </button>
      </div>
    </div>
  );
}