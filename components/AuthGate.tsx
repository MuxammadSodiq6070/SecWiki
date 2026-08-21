'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

export const AUTH_STORAGE_KEY = 'hoogle-auth-user'

export type AuthUser = {
  name: string
  email: string
  password?: string
  authAt?: string
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  try {
    const value = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return value ? JSON.parse(value) as AuthUser : null
  } catch {
    return null
  }
}

export function logout() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('hoogle:auth-changed'))
}

export function isAuthenticated() {
  return Boolean(getAuthUser())
}

export function openAuthModal() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('hoogle:auth-required'))
}

export default function AuthGate() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = () => setOpen(true)
    const sync = () => {
      if (!isAuthenticated()) setOpen(true)
    }

    sync()
    window.addEventListener('hoogle:auth-required', handler)
    window.addEventListener('hoogle:auth-changed', sync)
    return () => {
      window.removeEventListener('hoogle:auth-required', handler)
      window.removeEventListener('hoogle:auth-changed', sync)
    }
  }, [])

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const email = form.email.trim()
    const password = form.password.trim()
    const name = form.name.trim()

    if (!email || !password) {
      setError('Email va parol kiritilishi shart')
      return
    }

    if (mode === 'register' && !name) {
      setError('Ism yoki nick kiritilishi shart')
      return
    }

    const payload = {
      name: mode === 'register' ? name : email.split('@')[0] || 'User',
      email,
      password,
      authAt: new Date().toISOString()
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload))
    void fetch('/api/auth/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: payload.name, email: payload.email })
    }).catch(() => {})
    setOpen(false)
    setError('')
    setForm({ name: '', email: '', password: '' })
    window.dispatchEvent(new CustomEvent('hoogle:auth-changed'))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-[#ff0033] bg-[#0b0c11] p-5 shadow-[0_0_20px_rgba(255,0,51,0.2)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#ffb6c1]">REDNOTES</p>
            <h3 className="mt-2 text-xl font-semibold text-[#ffe3e3]">
              {mode === 'login' ? 'Kirish' : 'Ro\'yxatdan o\'tish'}
            </h3>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded border border-[#ff0033] p-1.5 text-[#ffe3e3]">
            <X size={15} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-md border border-[#1d1f2a] bg-[#101217] p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-md px-3 py-2 text-sm ${mode === 'login' ? 'bg-[#ff0033] text-white' : 'text-[#ffd7d7]'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-md px-3 py-2 text-sm ${mode === 'register' ? 'bg-[#ff0033] text-white' : 'text-[#ffd7d7]'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' ? (
            <div>
              <label className="mb-1 block text-xs text-[#ffb3b3]">Ism / nick</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded border border-[#2a2d38] bg-[#0f1117] p-2.5 text-[#ffe3e3] outline-none"
                placeholder="Ali Valiyev"
              />
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-xs text-[#ffb3b3]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded border border-[#2a2d38] bg-[#0f1117] p-2.5 text-[#ffe3e3] outline-none"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#ffb3b3]">Parol</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded border border-[#2a2d38] bg-[#0f1117] p-2.5 text-[#ffe3e3] outline-none"
              placeholder="••••••••"
            />
          </div>

          {error ? <div className="rounded border border-[#ff0033] bg-[#150d12] px-3 py-2 text-xs text-[#ffd7d7]">{error}</div> : null}

          <button
            type="submit"
            className="w-full rounded-md border border-[#ff0033] bg-[#ff0033] px-3 py-2.5 text-sm font-medium text-white shadow-[0_0_12px_rgba(255,0,51,0.25)]"
          >
            {mode === 'login' ? 'Kirish' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-[#ffb3b3]">
          Batafsil ma'lumotni ko'rish uchun avval login qiling.
        </p>
      </div>
    </div>
  )
}
