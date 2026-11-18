import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Login failed. Please check your email and password.')
    }

    setLoading(false)
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="login-brand-content">
          <div className="login-logo">
            <span className="login-logo-icon">S</span>
            <span>SocialPulse</span>
          </div>

          <div className="login-brand-message">
            <span className="login-eyebrow">SOCIAL INTELLIGENCE PLATFORM</span>
            <h1>Turn conversations into opportunities.</h1>
            <p>
              Monitor social conversations, discover potential customers,
              and manage every lead in one place.
            </p>

            <div className="login-features">
              <div className="login-feature">
                <span>✓</span>
                Discover valuable leads
              </div>
              <div className="login-feature">
                <span>✓</span>
                Track conversations and activity
              </div>
              <div className="login-feature">
                <span>✓</span>
                Manage your sales pipeline
              </div>
            </div>
          </div>

          <div className="login-brand-footer">
            SocialPulse CRM · Social listening made actionable
          </div>
        </div>
      </section>

      <section className="login-form-section">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-mobile-logo">
            <span className="login-logo-icon">S</span>
            <span>SocialPulse</span>
          </div>

          <div className="login-heading">
            <span className="login-eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details to access your workspace.</p>
          </div>

          <div className="login-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className="login-password-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                className="login-show-password"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <span>→</span>}
          </button>

          <p className="login-secure-note">
            Secure access to your SocialPulse workspace
          </p>
        </form>
      </section>
    </main>
  )
}

export default Login
