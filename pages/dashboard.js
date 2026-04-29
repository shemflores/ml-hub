import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login"); // ✅ better than window.location
      } else {
        setUser(data.user);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // ✅ better navigation
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Dashboard</h1>

        {user && (
          <p style={styles.email}>
            Signed in as <strong>{user.email}</strong>
          </p>
        )}

        <div style={styles.actions}>
          {/* ✅ FIXED: goes to create.js */}
          <Link href="/create">
            <button style={styles.primary}>Create Article</button>
          </Link>

          {/* ✅ FIXED: goes to articles.js */}
          <Link href="/articles">
            <button style={styles.secondary}>Read Articles</button>
          </Link>
        </div>

        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "320px",
  },
  title: {
    marginBottom: "10px",
  },
  email: {
    color: "#555",
    fontSize: "14px",
    marginBottom: "30px",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  primary: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "black",
    color: "white",
    cursor: "pointer",
  },
  secondary: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
  },
  logout: {
    marginTop: "20px",
    fontSize: "12px",
    background: "none",
    border: "none",
    color: "#888",
    cursor: "pointer",
  },
};