import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Machine Learning Hub</h1>
      <p>A simple platform to explore machine learning tools.</p>

      <Link href="/auth">
        <button>Get Started</button>
      </Link>
    </div>
  )
}