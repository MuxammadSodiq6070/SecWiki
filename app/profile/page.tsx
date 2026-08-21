'use client'

import Link from 'next/link'
import { LogOut, Mail, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAuthUser, logout, openAuthModal, type AuthUser } from '../../components/AuthGate'

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser())
    syncUser()
    window.addEventListener('hoogle:auth-changed', syncUser)
    return () => window.removeEventListener('hoogle:auth-changed', syncUser)
  }, [])

  if (!user) {
    return (
      <section className="mx-auto max-w-xl rounded-md border border-[#ff0033] bg-[#0c0d12] p-6 text-center">
        <User className="mx-auto text-[#ff0033]" size={30} />
        <h1 className="mt-3 text-xl font-semibold text-[#ffe3e3]">Profilga kirish uchun login qiling</h1>
        <button type="button" onClick={openAuthModal} className="mt-5 rounded border border-[#ff0033] bg-[#ff0033] px-4 py-2 text-sm text-white">Login / Register</button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.25em] text-[#ff6a7b]">REDNOTES / USER</p>
        <h1 className="mt-2 text-3xl font-bold text-[#ffe3e3]">Mening profilim</h1>
      </div>
      <div className="rounded-md border border-[#ff0033] bg-[#0c0d12] p-6 shadow-[0_0_20px_rgba(255,0,51,0.12)]">
        <div className="flex items-center gap-4 border-b border-[#1d1f2a] pb-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ff0033] bg-[#180b11] text-xl font-bold text-[#ffe3e3]">{user.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <h2 className="text-xl font-semibold text-[#ffe3e3]">{user.name}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-[#ffb3b3]"><Mail size={14} /> {user.email}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/" className="rounded border border-[#2a2d38] bg-[#101217] px-4 py-2 text-sm text-[#ffe3e3]">Bosh sahifa</Link>
          <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded border border-[#ff0033] px-4 py-2 text-sm text-[#ffd7d7]"><LogOut size={15} /> Logout</button>
        </div>
      </div>
    </section>
  )
}