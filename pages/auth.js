import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Signup successful! Check your email.")
    }
  }

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Login successful!")
    }
  }

  return (
    <div style={styles.container}>
      <h2>Auth Page</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleSignUp} style={styles.button}>
        Sign Up
      </button>

      <button onClick={handleLogin} style={styles.button}>
        Login
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    margin: '100px auto',
    gap: '10px',
  },
  input: {
    padding: '10px',
  },
  button: {
    padding: '10px',
    cursor: 'pointer',
  },
}