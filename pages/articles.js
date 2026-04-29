"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Articles() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      window.location.href = "/login";
      return;
    }
    setUser(data.user);
    await fetchArticles();
  };

  // ✅ FORMAT TIME
  const formatTime = (time) => {
    if (!time) return "";
    return new Date(time).toLocaleString();
  };

  // ✅ FETCH ARTICLES + LIKES + COMMENTS
  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select(`
        *,
        likes(user_id),
        comments(*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setArticles(data || []);

    const grouped = {};
    data.forEach((a) => {
      grouped[a.id] = (a.comments || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    });

    setComments(grouped);
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
      alert(error.message);
      return;
    }

    setTitle("");
    setContent("");
    fetchArticles();
  };

  // ✅ DELETE ARTICLE
  const deleteArticle = async (id) => {
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchArticles();
  };

  // ✅ LIKE / UNLIKE
  const toggleLike = async (article) => {
    if (!user) return;

    const liked = article.likes?.some(
      (l) => l.user_id === user.id
    );

    if (liked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("article_id", article.id)
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("likes").insert([
        {
          article_id: article.id,
          user_id: user.id,
        },
      ]);

      if (error) {
        alert(error.message);
        return;
      }
    }

    fetchArticles();
  };

  // ✅ ADD COMMENT
  const addComment = async (articleId) => {
    const text = commentInputs[articleId];
    if (!text || !user) return;

    const { error } = await supabase.from("comments").insert([
      {
        content: text,
        article_id: articleId,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setCommentInputs((prev) => ({ ...prev, [articleId]: "" }));
    fetchArticles();
  };

  // ✅ DELETE COMMENT
  const deleteComment = async (commentId) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      alert(error.message);
      return;
    }

    fetchArticles();
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
        {articles.map((article) => {
          const likeCount = article.likes?.length || 0;
          const liked = article.likes?.some(
            (l) => l.user_id === user?.id
          );

          return (
            <div key={article.id} style={styles.post}>
              <h3>{article.title}</h3>

              {/* 🕒 ARTICLE TIME */}
              <p style={styles.time}>
                {formatTime(article.created_at)}
              </p>

              <p>{article.content}</p>

              {/* ACTIONS */}
              <div style={styles.actions}>
                <button
                  onClick={() => toggleLike(article)}
                  disabled={!user}
                >
                  {liked ? "💔 Unlike" : "❤️ Like"} ({likeCount})
                </button>

                {user && user.id === article.user_id && (
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
                  value={commentInputs[article.id] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [article.id]: e.target.value,
                    }))
                  }
                  style={styles.commentInput}
                />
                <button onClick={() => addComment(article.id)}>
                  Add
                </button>

                {(comments[article.id] || []).map((c) => (
                  <div key={c.id} style={styles.commentRow}>
                    <div>
                      <p style={{ margin: 0 }}>💬 {c.content}</p>

                      {/* 🕒 COMMENT TIME */}
                      <p style={styles.timeSmall}>
                        {formatTime(c.created_at)}
                      </p>
                    </div>

                    {user && user.id === c.user_id && (
                      <button
                        onClick={() => deleteComment(c.id)}
                        style={styles.delete}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
    cursor: "pointer",
  },
  card: {
    background: "white",
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "10px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  },
  button: {
    width: "100%",
    padding: "10px",
    cursor: "pointer",
  },
  post: {
    background: "white",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "10px",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
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
  },
  commentRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "8px",
  },
  time: {
    fontSize: "12px",
    color: "gray",
    marginBottom: "5px",
  },
  timeSmall: {
    fontSize: "11px",
    color: "gray",
    margin: 0,
  },
};