"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Welcome back, <span className="font-medium">{user?.email}</span>
        </p>

        <div className="space-y-4">
          <button
            onClick={() => (window.location.href = "/create-article")}
            className="w-full py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            📝 My Articles
          </button>

          <button
            onClick={() => (window.location.href = "/articles")}
            className="w-full py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition"
          >
            🌍 View All Articles
          </button>

          <button
            onClick={logout}
            className="w-full py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}