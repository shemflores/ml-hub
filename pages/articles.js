

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

  return (
    <div>
      <h1>All Articles</h1>

      {articles.map((article) => {
        const likeCount = article.likes?.length || 0;
        const liked = article.likes?.some(
          (l) => l.user_id === user.id
        );

        return (
          <div key={article.id}>
            <h3>{article.title}</h3>
            <p>{article.content}</p>

            <button onClick={() => toggleLike(article)}>
              {liked ? "Unlike" : "Like"} ({likeCount})
            </button>

            {/* COMMENTS */}
            <div>
              <input
                placeholder="Comment..."
                value={commentInputs[article.id] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({
                    ...prev,
                    [article.id]: e.target.value,
                  }))
                }
              />

              <button onClick={() => addComment(article.id)}>
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
  );
}