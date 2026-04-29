"use client";

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
    <div>
      <h1>Create Article</h1>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button onClick={createArticle}>Post</button>

      <h2>My Articles</h2>

      {articles.map((a) => (
        <div key={a.id}>
          <h3>{a.title}</h3>
          <p>{a.content}</p>

          <button onClick={() => deleteArticle(a.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}