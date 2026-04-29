"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";  // Adjusted path
import { useRouter } from "next/router";

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

    fetchLikes(userId);
    fetchComments();
  };

  const fetchLikes = async (userId) => {
    const { data } = await supabase.from("likes").select("*");

    let likeMap = {};

    data.forEach((like) => {
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

    data.forEach((c) => {
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

    fetchLikes(user.id);
  };

  const addComment = async (articleId) => {
    const text = commentInputs[articleId];
    if (!text) return;

    await supabase.from("comments").insert({
      content: text,
      article_id: articleId,
      user_id: user.id,
    });

    setCommentInputs({ ...commentInputs, [articleId]: "" });
    fetchComments();
  };

  const deleteComment = async (commentId) => {
    const confirmDelete = confirm("Delete this comment?");
    if (!confirmDelete) return;

    await supabase.from("comments").delete().eq("id", commentId);
    fetchComments();
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>All Articles</h1>

        {articles.map((article) => {
          const articleLikes = likes[article.id] || {
            count: 0,
            liked: false,
          };

          return (
            <div key={article.id} style={styles.card}>
              <h2>{article.title}</h2>
              <p>{article.content}</p>

              <small style={styles.date}>
                {new Date(article.created_at).toLocaleString()}
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
                <h4>Comments</h4>

                {(comments[article.id] || []).map((c) => (
                  <div key={c.id} style={styles.comment}>
                    <p>{c.content}</p>

                    <small style={styles.date}>
                      {new Date(c.created_at).toLocaleString()}
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

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    padding: "30px",
    display: "flex",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: "700px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },
  date: {
    fontSize: "12px",
    color: "#777",
  },
  likeRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  likeBtn: {
    padding: "5px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
  comments: {
    marginTop: "20px",
  },
  comment: {
    background: "#f9f9f9",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  deleteComment: {
    marginTop: "5px",
    fontSize: "12px",
    color: "red",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  commentBox: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },
  postComment: {
    padding: "8px 12px",
    background: "black",
    color: "white",
    border: "none",
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