import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
      } else {
        setUser(data.user);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Dashboard</h1>

        {user && <p style={styles.email}>{user.email}</p>}

        <div style={styles.actions}>
          <button
            style={styles.primary}
            onClick={() => (window.location.href = "/articles")}
          >
            📄 View Articles
          </button>

          <button
            style={styles.secondary}
            onClick={() => (window.location.href = "/articles")}
          >
            ✍️ Create Article
          </button>

          <button style={styles.logout} onClick={handleLogout}>
            Logout
          </button>
        </div>
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
    background: "#f4f4f4",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "320px",
  },
  title: {
    marginBottom: "10px",
  },
  email: {
    fontSize: "14px",
    color: "gray",
  },
  actions: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  primary: {
    padding: "10px",
    background: "black",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  secondary: {
    padding: "10px",
    background: "#eee",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  logout: {
    padding: "10px",
    background: "#ff4d4d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};