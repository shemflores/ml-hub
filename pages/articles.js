"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Articles() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});

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
    fetchArticles();
  };

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select(`
        *,
        likes(user_id),
        comments(*)
      `)
      .order("created_at", { ascending: false });

    if (error) return alert(error.message);

    setArticles(data || []);
  };

  const toggleLike = async (article) => {
    const liked = article.likes?.some(
      (l) => l.user_id === user.id
    );

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("article_id", article.id)
        .eq("user_id", user.id);
    } else {
      await supabase.from("likes").insert([
        {
          article_id: article.id,
          user_id: user.id,
        },
      ]);
    }

    fetchArticles();
  };

  const addComment = async (articleId) => {
    const text = commentInputs[articleId];
    if (!text) return;

    await supabase.from("comments").insert([
      {
        content: text,
        article_id: articleId,
        user_id: user.id,
      },
    ]);

    setCommentInputs((prev) => ({
      ...prev,
      [articleId]: "",
    }));

    fetchArticles();
  };

  const deleteComment = async (id) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id);

    if (error) return alert(error.message);

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

        <h1>All Articles</h1>

        {articles.map((article) => {
          const likeCount = article.likes?.length || 0;
          const liked = article.likes?.some(
            (l) => l.user_id === user?.id
          );

          return (
            <div key={article.id} style={styles.post}>
              <h3>{article.title}</h3>
              <p>{article.content}</p>

              <button
                onClick={() => toggleLike(article)}
                style={styles.like}
              >
                {liked ? "💔 Unlike" : "❤️ Like"} ({likeCount})
              </button>

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
                  style={styles.input}
                />

                <button onClick={() => addComment(article.id)}>
                  Add
                </button>

                {article.comments?.map((c) => (
                  <div key={c.id} style={styles.commentRow}>
                    <p>💬 {c.content}</p>

                    {user?.id === c.user_id && (
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
  page: { background: "#f5f5f5", minHeight: "100vh", padding: "30px" },
  container: { maxWidth: "600px", margin: "auto" },
  back: { marginBottom: "15px", cursor: "pointer" },
  post: {
    background: "white",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "10px",
  },
  like: { marginTop: "10px", marginBottom: "10px" },
  commentBox: { marginTop: "10px" },
  input: { width: "100%", padding: "8px", marginBottom: "5px" },
  commentRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "5px",
  },
  delete: {
    color: "red",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
};