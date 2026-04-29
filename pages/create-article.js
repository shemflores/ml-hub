

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CreateArticle() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    init();
  }, []);

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(time).toLocaleString();
  };

  const init = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    setUser(data.user);
    fetchMyArticles(data.user.id);
  };

  const fetchMyArticles = async (userId) => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return alert(error.message);

    setArticles(data || []);
  };

  const createArticle = async () => {
    if (!title || !content) return;

    const { error } = await supabase.from("articles").insert([
      {
        title,
        content,
        user_id: user.id,
      },
    ]);

    if (error) return alert(error.message);

    setTitle("");
    setContent("");
    fetchMyArticles(user.id);
  };

  const deleteArticle = async (id) => {
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) return alert(error.message);

    fetchMyArticles(user.id);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button
          onClick={() => (window.location.href = "/dashboard")}
          style={styles.back}
        >
          ← Back
        </button>

        <h1>Create Article</h1>

        <div style={styles.card}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />

          <textarea
            placeholder="Write something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={styles.textarea}
          />

          <button onClick={createArticle} style={styles.button}>
            Post Article
          </button>
        </div>

        <h2>My Articles</h2>

        {articles.map((a) => (
          <div key={a.id} style={styles.post}>
            <h3>{a.title}</h3>

            <p style={styles.time}>
              🕒 {formatTime(a.created_at)}
            </p>

            <p>{a.content}</p>

            <button
              onClick={() => deleteArticle(a.id)}
              style={styles.delete}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#f5f5f5", minHeight: "100vh", padding: "30px" },
  container: { maxWidth: "600px", margin: "auto" },
  back: { marginBottom: "15px", cursor: "pointer" },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  input: { width: "100%", padding: "10px", marginBottom: "10px" },
  textarea: { width: "100%", padding: "10px", marginBottom: "10px" },
  button: {
    width: "100%",
    padding: "10px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
  },
  post: {
    background: "white",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "10px",
  },
  time: { fontSize: "12px", color: "gray" },
  delete: {
    color: "red",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};