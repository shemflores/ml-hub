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

    if (!data?.user) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
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

    if (error) {
      console.error(error.message);
      return;
    }

    setArticles(data || []);
  };

  const toggleLike = async (article) => {
    const liked = article.likes?.some(
      (l) => l.user_id === user?.id
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
    if (!text || !user) return;

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

  return (
    <div style={container}>
      <div style={card}>
        <h1>All Articles</h1>

        {articles.map((article) => {
          const likeCount = article.likes?.length || 0;
          const liked = article.likes?.some(
            (l) => l.user_id === user?.id
          );

          return (
            <div key={article.id} style={articleBox}>
              <h3>{article.title}</h3>
              <p>{article.content}</p>

              <button
                onClick={() => toggleLike(article)}
                style={buttonPrimary}
              >
                {liked ? "Unlike" : "Like"} ({likeCount})
              </button>

              <div style={{ marginTop: "10px" }}>
                <input
                  placeholder="Comment..."
                  value={commentInputs[article.id] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [article.id]: e.target.value,
                    }))
                  }
                  style={input}
                />

                <button
                  onClick={() => addComment(article.id)}
                  style={buttonSecondary}
                >
                  Add
                </button>

                {article.comments?.map((c) => (
                  <p key={c.id}>💬 {c.content}</p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// styles
const container = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  background: "#f3f4f6",
  padding: "20px",
};

const card = {
  width: "600px",
};

const articleBox = {
  background: "#fff",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "15px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};

const buttonPrimary = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "6px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};

const buttonSecondary = {
  marginLeft: "10px",
  padding: "8px 12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  background: "#f9f9f9",
  cursor: "pointer",
};

const input = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};