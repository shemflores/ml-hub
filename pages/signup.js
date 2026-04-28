import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async (e) => {
    e.preventDefault()

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Signup successful! Check your email.")
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSignUp} style={styles.card}>
        <h2>Sign Up</h2>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button}>
          Sign Up
        </button>

        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: '30px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    width: '300px',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
  },
  button: {
    width: '100%',
    padding: '10px',
    background: 'black',
    color: 'white',
    border: 'none',
  },
}