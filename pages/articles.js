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
    const init = async () => {
      await getUser();
      await fetchArticles();
    };
    init();
  }, []);

  // ✅ GET USER
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) window.location.href = "/login";
    else setUser(data.user);
  };

  // ✅ FETCH ARTICLES + LIKE COUNT
  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select(`
        *,
        likes(count)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setArticles(data || []);
  };

  // ✅ CREATE ARTICLE
  const createArticle = async () => {
    if (!title || !content || !user) return;

    const { error } = await supabase.from("articles").insert([
      {
        title,
        content,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Failed to post");
      return;
    }

    setTitle("");
    setContent("");
    fetchArticles();
  };

  // ✅ DELETE ARTICLE (OWNER ONLY via RLS)
  const deleteArticle = async (id) => {
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Delete failed");
      return;
    }

    fetchArticles();
  };

  // ✅ LIKE ARTICLE (ONE LIKE PER USER)
  const likeArticle = async (article) => {
    if (!user) return;

    // check if already liked
    const { data: existing } = await supabase
      .from("likes")
      .select("*")
      .eq("article_id", article.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      alert("Already liked");
      return;
    }

    const { error } = await supabase.from("likes").insert([
      {
        article_id: article.id,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Like failed");
      return;
    }

    fetchArticles();
  };

  // ✅ LOCAL COMMENTS (still frontend only)
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
              <button
                onClick={() => likeArticle(article)}
                style={styles.likeBtn}
              >
                ❤️ {article.likes?.[0]?.count || 0}
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

            {/* COMMENTS (frontend only) */}
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
  likeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
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