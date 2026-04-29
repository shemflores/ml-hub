"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function CreateArticle() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.push("/login");
    } else {
      setUser(data.user);
      fetchArticles(data.user.id);
    }

    setLoading(false);
  };

  // ✅ Fetch ONLY your own articles
  const fetchArticles = async (userId) => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setArticles(data);
  };

  // ✅ Create Article
  const handleCreate = async () => {
    if (!title || !content) return alert("Fill all fields");

    const { error } = await supabase.from("articles").insert([
      {
        title,
        content,
        user_id: user.id, // VERY IMPORTANT
      },
    ]);

    if (!error) {
      setTitle("");
      setContent("");
      fetchArticles(user.id);
    }
  };

  // ✅ Delete Article (ONLY your own)
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this article?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchArticles(user.id);
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>My Articles</h1>

        {/* CREATE FORM */}
        <div style={styles.form}>
          <input
            type="text"
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />

          <textarea
            placeholder="Write your article..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={styles.textarea}
          />

          <button onClick={handleCreate} style={styles.createBtn}>
            Post Article
          </button>
        </div>

        {/* ARTICLES LIST */}
        <div style={styles.list}>
          {articles.length === 0 && (
            <p style={{ color: "#888" }}>No articles yet.</p>
          )}

          {articles.map((article) => (
            <div key={article.id} style={styles.card}>
              <h3>{article.title}</h3>
              <p>{article.content}</p>

              <small style={styles.date}>
                {new Date(article.created_at).toLocaleString()}
              </small>

              <button
                onClick={() => handleDelete(article.id)}
                style={styles.deleteBtn}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* BACK BUTTON */}
        <button onClick={() => router.push("/dashboard")} style={styles.back}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: "600px",
  },
  title: {
    marginBottom: "20px",
    textAlign: "center",
  },
  form: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
    marginBottom: "30px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  textarea: {
    width: "100%",
    height: "100px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "10px",
  },
  createBtn: {
    width: "100%",
    padding: "10px",
    background: "black",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  card: {
    background: "white",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },
  date: {
    display: "block",
    marginTop: "10px",
    fontSize: "12px",
    color: "#777",
  },
  deleteBtn: {
    marginTop: "10px",
    background: "#ff4d4f",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  back: {
    marginTop: "20px",
    background: "none",
    border: "none",
    color: "#555",
    cursor: "pointer",
  },
};