'use client'

import Link from 'next/link'
import { LogIn, LogOut, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

type Event = { id: number; name: string; email: string; event: string; createdAt: string; ipAddress?: string | null }

type AuditData = { users: Event[]; events: Event[] }

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [audit, setAudit] = useState<AuditData>({ users: [], events: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { void loadSession() }, [])

  async function readJson(response: Response) {
    const text = await response.text()
    try {
      return text ? JSON.parse(text) : {}
    } catch {
      return {}
    }
  }

  async function loadSession() {
    const response = await fetch('/api/auth/me', { cache: 'no-store' })
    const data = await readJson(response)
    setIsAdmin(Boolean(data.isAdmin))
    if (data.isAdmin) void loadAudit()
    setLoading(false)
  }

  async function loadAudit() {
    const response = await fetch('/api/admin/audit', { cache: 'no-store' })
    if (response.ok) setAudit(await readJson(response))
  }

  async function login(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    const response = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (!response.ok) {
      const data = await readJson(response)
      setError(data.error || `Login amalga oshmadi (${response.status})`)
      return
    }
    setPassword('')
    setIsAdmin(true)
    window.dispatchEvent(new CustomEvent('hoogle:admin-changed'))
    void loadAudit()
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setIsAdmin(false)
    setAudit({ users: [], events: [] })
    window.dispatchEvent(new CustomEvent('hoogle:admin-changed'))
  }

  if (loading) return <div className="p-6 text-[#ffb3b3]">Admin panel yuklanmoqda...</div>

  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-md rounded-md border border-[#ff0033] bg-[#0c0d12] p-6 shadow-[0_0_20px_rgba(255,0,51,0.15)]">
        <ShieldCheck className="text-[#ff0033]" size={28} />
        <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#ff6a7b]">RESTRICTED CONTROL</p>
        <h1 className="mt-2 text-2xl font-bold text-[#ffe3e3]">Admin panel</h1>
        <form onSubmit={login} className="mt-5 space-y-3">
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Admin username" className="w-full rounded border border-[#2a2d38] bg-[#0f1117] p-2.5 text-[#ffe3e3] outline-none" autoComplete="username" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Admin password" type="password" className="w-full rounded border border-[#2a2d38] bg-[#0f1117] p-2.5 text-[#ffe3e3] outline-none" autoComplete="current-password" />
          {error ? <div className="rounded border border-[#ff0033] bg-[#150d12] px-3 py-2 text-xs text-[#ffd7d7]">{error}</div> : null}
          <button className="inline-flex w-full items-center justify-center gap-2 rounded border border-[#ff0033] bg-[#ff0033] px-3 py-2.5 text-sm text-white"><LogIn size={15} /> Kirish</button>
        </form>
      </section>
    )
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#ff6a7b]">SECURITY / CONTROL</p>
          <h1 className="mt-2 text-3xl font-bold text-[#ffe3e3]">Admin panel</h1>
          <p className="mt-1 text-sm text-[#ffb3b3]">Yangi command qo‘shish, import va foydalanuvchi faoliyatini nazorat qilish.</p>
        </div>
        <button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 rounded border border-[#ff0033] px-3 py-2 text-sm text-[#ffd7d7]"><LogOut size={15} /> Chiqish</button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-md border border-[#ff0033] bg-[#0c0d12] p-5">
          <h2 className="text-lg font-semibold text-[#ffe3e3]">Admin huquqlari</h2>
          <ul className="mt-4 space-y-2 text-sm text-[#ffb3b3]">
            <li>+ Command yaratish</li>
            <li>+ JSON import va export</li>
            <li>+ Foydalanuvchilar loginlarini ko‘rish</li>
            <li>+ Login vaqti, IP va browser auditini ko‘rish</li>
          </ul>
          <Link href="/" className="mt-5 inline-block rounded border border-[#2a2d38] bg-[#101217] px-3 py-2 text-sm text-[#ffe3e3]">Bosh sahifaga qaytish</Link>
        </div>

        <div className="rounded-md border border-[#ff0033] bg-[#0c0d12] p-5">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-[#ffe3e3]">Foydalanuvchilar</h2><span className="text-xs text-[#ff9eaa]">{audit.users.length} ta</span></div>
          <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-[#ff6a7b]"><tr><th className="border-b border-[#2a1a22] py-2">Ism</th><th className="border-b border-[#2a1a22] py-2">Email</th><th className="border-b border-[#2a1a22] py-2">Oxirgi login</th></tr></thead><tbody>{audit.users.map((user) => <tr key={user.email}><td className="border-b border-[#1d1f2a] py-2 text-[#ffe3e3]">{user.name}</td><td className="border-b border-[#1d1f2a] py-2 text-[#ffb3b3]">{user.email}</td><td className="border-b border-[#1d1f2a] py-2 text-[#ffb3b3]">{new Date(user.createdAt).toLocaleString('uz-UZ')}</td></tr>)}</tbody></table></div>
        </div>
      </div>

      <div className="mt-5 rounded-md border border-[#2a1a22] bg-[#0c0d12] p-5"><h2 className="text-lg font-semibold text-[#ffe3e3]">Audit log</h2><div className="mt-3 max-h-96 overflow-auto text-xs">{audit.events.map((event) => <div key={event.id} className="flex flex-wrap gap-x-3 gap-y-1 border-b border-[#1d1f2a] py-2"><span className="text-[#ff6a7b]">{event.event}</span><span className="text-[#ffe3e3]">{event.name}</span><span className="text-[#ffb3b3]">{event.email}</span><span className="text-[#ff8f9f]">{new Date(event.createdAt).toLocaleString('uz-UZ')}</span>{event.ipAddress ? <span className="text-[#80515a]">{event.ipAddress}</span> : null}</div>)}</div></div>
    </section>
  )
}
