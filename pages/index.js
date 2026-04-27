import Link from 'next/link'

export default function Home() {
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
    color: '#555',
    marginBottom: '30px',
  },
  link: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '16px',
  },
}