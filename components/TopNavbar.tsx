'use client'

import Link from 'next/link'
import { LogIn, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAuthUser, logout, openAuthModal, type AuthUser } from './AuthGate'

export default function TopNavbar() {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser())
    syncUser()
    window.addEventListener('hoogle:auth-changed', syncUser)
    return () => window.removeEventListener('hoogle:auth-changed', syncUser)
  }, [])

  const displayName = user?.name || user?.email?.split('@')[0] || 'Mehmon'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="rn-topbar sticky top-0 z-30 mb-6 border-b border-[#1d1f2a] bg-[#090a0f]/95 px-6 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <nav className="flex items-center gap-5 text-sm text-[#ffb3b3]" aria-label="Asosiy navigatsiya">
          <Link href="/" className="rn-topbar-link">Dashboard</Link>
          <Link href="/privacy-policy" className="rn-topbar-link">Maxfiylik</Link>
        </nav>

        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2 text-right" aria-label="Profilni ochish">
              <span className="rn-avatar flex h-8 w-8 items-center justify-center rounded-full border border-[#ff0033] bg-[#180b11] text-xs font-bold text-[#ffe3e3]">{initials}</span>
              <span className="hidden sm:block">
                <span className="block text-sm font-medium text-[#ffe3e3]">{displayName}</span>
                <span className="block text-[11px] text-[#ff8f9f]">Profil</span>
              </span>
            </Link>
            <button type="button" onClick={logout} className="rn-logout inline-flex items-center gap-1.5 rounded border border-[#ff0033] px-2.5 py-1.5 text-xs text-[#ffd7d7]" title="Logout">
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => openAuthModal()} className="inline-flex items-center gap-1.5 rounded border border-[#ff0033] bg-[#ff0033] px-3 py-1.5 text-xs font-medium text-white">
            <LogIn size={14} /> Login
          </button>
        )}
      </div>
    </header>
  )
}