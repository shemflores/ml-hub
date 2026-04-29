import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Articles() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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

  return (
    <div style={styles.page}>
      <div style={styles.container}>
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

            {user?.id === article.user_id && (
              <button
                onClick={() => deleteArticle(article.id)}
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
  card: {
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
    boxShadow: "0 5px 10px rgba(0,0,0,0.05)",
  },
  delete: {
    marginTop: "10px",
    fontSize: "12px",
    background: "none",
    border: "none",
    color: "red",
    cursor: "pointer",
  },
};