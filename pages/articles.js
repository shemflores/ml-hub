"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Articles() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [comments, setComments] = useState({});

  useEffect(() => {
    getUser();
    fetchArticles();
  }, []);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) window.location.href = "/login";
    else setUser(data.user);
  };

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    setArticles(data || []);
  };

  const createArticle = async () => {
    if (!title || !content) return;

    await supabase.from("articles").insert([
      {
        title,
        content,
        user_id: user.id,
        likes: 0,
      },
    ]);

    setTitle("");
    setContent("");
    fetchArticles();
  };

  const deleteArticle = async (id) => {
    await supabase.from("articles").delete().eq("id", id);
    fetchArticles();
  };

  const likeArticle = async (article) => {
    await supabase
      .from("articles")
      .update({ likes: (article.likes || 0) + 1 })
      .eq("id", article.id);

    fetchArticles();
  };

  const addComment = (id, text) => {
    if (!text) return;

    setComments((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), text],
    }));
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        {/* 🔙 BACK BUTTON */}
        <button
          onClick={() => (window.location.href = "/dashboard")}
          style={styles.back}
        >
          ← Back
        </button>

        <h1 style={styles.title}>Articles</h1>

        {/* CREATE */}
        <div style={styles.card}>
          <input
            placeholder="Title"
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
          <button onClick={createArticle} style={styles.button}>
            Post
          </button>
        </div>

        {/* LIST */}
        {articles.map((article) => (
          <div key={article.id} style={styles.post}>
            <h3>{article.title}</h3>
            <p>{article.content}</p>

            {/* ACTIONS */}
            <div style={styles.actions}>
              <button onClick={() => likeArticle(article)}>
                ❤️ {article.likes || 0}
              </button>

              {user?.id === article.user_id && (
                <button
                  onClick={() => deleteArticle(article.id)}
                  style={styles.delete}
                >
                  Delete
                </button>
              )}
            </div>

            {/* COMMENTS */}
            <div style={styles.commentBox}>
              <input
                placeholder="Write a comment..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addComment(article.id, e.target.value);
                    e.target.value = "";
                  }
                }}
                style={styles.commentInput}
              />

              {(comments[article.id] || []).map((c, i) => (
                <p key={i} style={styles.comment}>
                  💬 {c}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f5f5f5",
    minHeight: "100vh",
    padding: "40px 0",
  },
  container: {
    maxWidth: "600px",
    margin: "auto",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  back: {
    marginBottom: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "30px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  },
  textarea: {
    width: "100%",
    height: "100px",
    padding: "10px",
    marginBottom: "10px",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "black",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  post: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  delete: {
    color: "red",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  commentBox: {
    marginTop: "10px",
  },
  commentInput: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
  },
  comment: {
    fontSize: "13px",
    marginTop: "5px",
  },
};