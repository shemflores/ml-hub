'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Sign-up successful!')
    }
  }

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Login successful!')
      router.push('/dashboard')
    }
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h2>Login / Sign-Up</h2>

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

        <div style={styles.buttons}>
          <button style={styles.primary} onClick={signUp}>
            Sign Up
          </button>

          <button style={styles.secondary} onClick={login}>
            Login
          </button>
        </div>

        <p>{message}</p>
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
    background: '#f9f9f9',
  },
  card: {
    background: '#fff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    width: '300px',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '6px',
    border: '1px solid #ddd',
  },
  buttons: {
    display: 'flex',
    gap: '10px',
  },
  primary: {
    flex: 1,
    padding: '10px',
    background: 'black',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
  },
  secondary: {
    flex: 1,
    padding: '10px',
    background: '#eee',
    border: 'none',
    borderRadius: '6px',
  },
}