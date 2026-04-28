import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        // ❌ Not logged in → redirect
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
    <div style={styles.container}>
      <h1>Welcome 🎉</h1>

      {user && <p>{user.email}</p>}

      <button onClick={handleLogout} style={styles.button}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    background: "black",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};