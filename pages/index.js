import Link from 'next/link'

export default function Home() {
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return (
    <main style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Machine Learning Hub</h1>
        <p style={styles.subtitle}>
          A simple platform to explore machine learning tools.
        </p>

        <Link href="/auth" style={styles.link}>
          Get Started
        </Link>
      </div>
    </main>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
  },
  hero: {
    textAlign: 'center',
    padding: '40px',
  },
  title: {
    fontSize: '42px',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '18px',
    marginBottom: '20px',
  },
  link: {
    padding: '10px 20px',
    backgroundColor: '#000',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
  },
}