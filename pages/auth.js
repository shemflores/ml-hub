import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) setMessage(error.message)
    else setMessage('Sign-up successful! Check your email.')
  }

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) setMessage(error.message)
    else setMessage('Login successful!')
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login / Sign-Up</h2>

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={styles.buttonGroup}>
          <button style={styles.primaryBtn} onClick={signUp}>
            Sign Up
          </button>

          <button style={styles.secondaryBtn} onClick={login}>
            Login
          </button>
        </div>

        <p style={styles.message}>{message}</p>
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
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    padding: '30px',
    borderRadius: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    width: '300px',
    textAlign: 'center',
  },
  title: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '6px',
    border: '1px solid #ddd',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
  },
  primaryBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'black',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  secondaryBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#eee',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  message: {
    marginTop: '15px',
    color: '#555',
    fontSize: '14px',
  },
}