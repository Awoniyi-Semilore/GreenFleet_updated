import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Truck, WifiOff, AlertCircle, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import axios from 'axios'

const PORTAL_HOME = {
  Staff:                '/staff/dashboard',
  'Transport Admin':    '/transport/dashboard',
  'System Administrator': '/admin/dashboard',
}

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

function classifyError(err) {
  if (!err.response) return {
    icon: WifiOff,
    title: 'Cannot connect',
    msg: 'Check your internet or make sure the backend is running.',
  }
  const s = err.response.status
  const m = err.response.data?.message
  if (s === 401 || s === 422) return { icon: ShieldAlert, title: 'Invalid credentials', msg: m || 'Username or password is incorrect.' }
  if (s === 403) return { icon: ShieldAlert, title: 'Access denied', msg: m || 'Your account does not have access.' }
  return { icon: AlertCircle, title: 'Login failed', msg: m || 'An unexpected error occurred.' }
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [sp] = useSearchParams()
  const [username,     setUsername]     = useState('')
  const [password,     setPassword]     = useState('')
  const [showPw,       setShowPw]       = useState(false)
  const [error,        setError]        = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [ssoLoading,   setSsoLoading]   = useState(false)

  /* Handle SSO redirect-back with token */
  useEffect(() => {
    const token = sp.get('sso_token')
    const ssoErr = sp.get('error')
    if (token) {
      setSsoLoading(true)
      localStorage.setItem('greenfleet_token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get(`${API_URL}/user`)
        .then((res) => {
          const u = res.data.data || res.data
          navigate(PORTAL_HOME[u.role] || '/staff/dashboard', { replace: true })
        })
        .catch(() => {
          localStorage.removeItem('greenfleet_token')
          setError({ icon: ShieldAlert, title: 'SSO failed', msg: 'Could not verify your session. Please try again.' })
          setSsoLoading(false)
        })
    } else if (ssoErr) {
      const msgs = {
        account_disabled:    'Your corporate account has been deactivated.',
        profile_fetch_failed:'Could not retrieve your profile from Microsoft.',
      }
      setError({ icon: ShieldAlert, title: 'SSO failed', msg: msgs[ssoErr] || 'Microsoft authentication failed.' })
    }
  }, []) // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) {
      setError({ icon: AlertCircle, title: 'Missing fields', msg: 'Enter your username and password.' })
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { user } = await login(username, password)
      navigate(PORTAL_HOME[user.role] || '/staff/dashboard', { replace: true })
    } catch (err) {
      setError(classifyError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleSSO() {
    setError(null)
    setSsoLoading(true)
    try {
      const res = await axios.get(`${API_URL}/auth/microsoft/redirect`)
      if (res.data?.url) { window.location.href = res.data.url }
      else throw new Error()
    } catch {
      setError({ icon: AlertCircle, title: 'SSO unavailable', msg: 'Could not reach the Microsoft authentication gateway.' })
      setSsoLoading(false)
    }
  }

  if (ssoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-ink-500">Verifying with Microsoft…</p>
        </div>
      </div>
    )
  }

  const ErrIcon = error?.icon || AlertCircle

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] bg-brand-green-900 flex-col justify-between p-10 shrink-0 relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }} />
        {/* Large circle accent */}
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-brand-lime/10" />
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5" />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl bg-brand-lime flex items-center justify-center">
              <Truck size={18} className="text-brand-green-900" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">GreenFleet</p>
              <p className="text-white/40 text-xs">Fleet Management System</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Smarter fleet.<br />Faster dispatch.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Greenwich Bank's centralised vehicle request and dispatch platform.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-3">
          {[
            ['Real-time trip tracking', 'Live map visibility for all active dispatches'],
            ['Role-based access', 'Staff, Transport Officer, and Admin portals'],
            ['Azure SSO', 'Seamless single sign-on with your corporate account'],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-lime mt-1.5 shrink-0" />
              <div>
                <p className="text-white/80 text-xs font-medium">{title}</p>
                <p className="text-white/35 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-white/20 text-xs relative z-10">© 2026 Greenwich Merchant Bank</p>
      </div>

      {/* ── Right: login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-muted">
        <div className="w-full max-w-[380px] animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
              <Truck size={16} className="text-white" />
            </div>
            <p className="text-base font-bold text-ink-900">GreenFleet</p>
          </div>

          <div className="bg-surface border border-border-subtle rounded-card shadow-card p-6">
            <h1 className="text-xl font-bold text-ink-900 mb-0.5">Sign in</h1>
            <p className="text-xs text-ink-400 mb-5">Use your corporate credentials or SSO</p>

            {/* Error banner */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3">
                <ErrIcon size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">{error.title}</p>
                  <p className="text-xs text-red-600 mt-0.5">{error.msg}</p>
                </div>
              </div>
            )}

            {/* Microsoft SSO */}
            <button
              type="button"
              onClick={handleSSO}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 border border-border bg-white hover:bg-surface-muted text-ink-800 px-4 py-2.5 rounded-btn text-sm font-medium transition-colors shadow-xs mb-4 disabled:opacity-50"
            >
              <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 23 23" fill="none">
                <path d="M0 0H11V11H0V0Z" fill="#F25022"/>
                <path d="M12 0H23V11H12V0Z" fill="#7FBA00"/>
                <path d="M0 12H11V23H0V12Z" fill="#00A4EF"/>
                <path d="M12 12H23V23H12V12Z" fill="#FFB900"/>
              </svg>
              Sign in with Microsoft
            </button>

            {/* Divider */}
            <div className="relative flex items-center my-4">
              <div className="flex-1 border-t border-border-subtle" />
              <span className="px-3 text-2xs uppercase tracking-wider text-ink-300 bg-surface font-medium">or</span>
              <div className="flex-1 border-t border-border-subtle" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="username" className="block text-xs font-medium text-ink-700 mb-1.5">
                  Username or email
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="firstname.lastname or name@company.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-border-subtle rounded-btn px-3 py-2 text-sm text-ink-900 bg-white placeholder:text-ink-300 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-ink-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-border-subtle rounded-btn px-3 py-2 pr-10 text-sm text-ink-900 bg-white placeholder:text-ink-300 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-green hover:bg-brand-green-700 text-white font-semibold text-sm py-2.5 rounded-btn transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-xs text-ink-300 mt-4">
              Forgot password? Contact IT Support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
