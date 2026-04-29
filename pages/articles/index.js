"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";
import { formatDistanceToNowStrict } from "date-fns";  // npm i date-fns

export default function Articles() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [likes, setLikes] = useState({});
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.push("/login");
      return;
    }

    setUser(data.user);
    await fetchArticles(data.user.id);
    setLoading(false);
  };

  const fetchArticles = async (userId) => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    setArticles(data || []);

    // Make async calls awaitable
    await Promise.all([fetchLikes(userId), fetchComments()]);
  };

  const fetchLikes = async (userId) => {
    const { data } = await supabase.from("likes").select("*");

    let likeMap = {};

    data?.forEach((like) => {
      if (!likeMap[like.article_id]) {
        likeMap[like.article_id] = {
          count: 0,
          liked: false,
        };
      }

      likeMap[like.article_id].count++;

      if (like.user_id === userId) {
        likeMap[like.article_id].liked = true;
      }
    });

    setLikes(likeMap);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: true });

    let grouped = {};

    data?.forEach((c) => {
      if (!grouped[c.article_id]) grouped[c.article_id] = [];
      grouped[c.article_id].push(c);
    });

    setComments(grouped);
  };

  const toggleLike = async (articleId) => {
    const isLiked = likes[articleId]?.liked;

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .eq("article_id", articleId)
        .eq("user_id", user.id);
    } else {
      await supabase.from("likes").insert({
        article_id: articleId,
        user_id: user.id,
      });
    }

    await fetchLikes(user.id);  // Await refresh
  };

  const addComment = async (articleId) => {
    const text = commentInputs[articleId];
    if (!text?.trim()) return;

    await supabase.from("comments").insert({
      content: text.trim(),
      article_id: articleId,
      user_id: user.id,
    });

    setCommentInputs({ ...commentInputs, [articleId]: "" });
    await fetchComments();  // Await refresh
  };

  const deleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;

    await supabase.from("comments").delete().eq("id", commentId);
    await fetchComments();
  };

  if (loading) return <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>;

  const formatTime = (timestamp) => {
    return formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>All Articles</h1>

        {articles.map((article) => {
          const articleLikes = likes[article.id] || { count: 0, liked: false };

          return (
            <div key={article.id} style={styles.card}>
              <h2>{article.title}</h2>
              <p style={styles.content}>{article.content}</p>

              <small style={styles.date}>
                Posted {formatTime(article.created_at)}
              </small>

              <div style={styles.likeRow}>
                <button
                  onClick={() => toggleLike(article.id)}
                  style={{
                    ...styles.likeBtn,
                    background: articleLikes.liked ? "#111" : "#eee",
                    color: articleLikes.liked ? "#fff" : "#000",
                  }}
                >
                  {articleLikes.liked ? "Unlike" : "Like"}
                </button>
                <span>{articleLikes.count} likes</span>
              </div>

              <div style={styles.comments}>
                <h4>Comments ({(comments[article.id] || []).length})</h4>

                {(comments[article.id] || []).map((c) => (
                  <div key={c.id} style={styles.comment}>
                    <p>{c.content}</p>
                    <div style={styles.commentFooter}>
                      <small style={styles.date}>
                        {formatTime(c.created_at)}
                      </small>
                      {c.user_id === user.id && (
                        <button
                          onClick={() => deleteComment(c.id)}
                          style={styles.deleteComment}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div style={styles.commentBox}>
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInputs[article.id] || ""}
                    onChange={(e) =>
                      setCommentInputs({
                        ...commentInputs,
                        [article.id]: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                  <button
                    onClick={() => addComment(article.id)}
                    style={styles.postComment}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button onClick={() => router.push("/dashboard")} style={styles.back}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// Enhanced styles with better spacing
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    padding: "30px 20px",
    display: "flex",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: "700px",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
  },
  card: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  content: {
    lineHeight: 1.6,
    marginBottom: "12px",
  },
  date: {
    fontSize: "13px",
    color: "#888",
    fontWeight: 500,
  },
  likeRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "16px 0",
  },
  likeBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  comments: {
    marginTop: "24px",
  },
  comment: {
    background: "#f8f9fa",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "16px",
    borderLeft: "3px solid #007bff",
  },
  commentFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "8px",
  },
  deleteComment: {
    fontSize: "12px",
    color: "#dc3545",
    background: "none",
    border: "1px solid #dc3545",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  commentBox: {
    display: "flex",
    gap: "12px",
    marginTop: "12px",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  postComment: {
    padding: "12px 20px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
  },
  back: {
    display: "block",
    margin: "32px auto 0",
    background: "none",
    border: "1px solid #ddd",
    color: "#555",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};