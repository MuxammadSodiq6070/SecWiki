'use client'

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Copy, Check, Lock } from 'lucide-react'
import { AUTH_STORAGE_KEY, getAuthUser, openAuthModal } from '../components/AuthGate'
import CommandEngagement from '../components/CommandEngagement'

type Cmd = {
  id: number
  title: string
  category: string
  commandText?: string
  shortDesc?: string
  fullDoc?: string
  parameters?: Array<{ flag: string; desc: string }>
  powerCount?: number
  commentCount?: number
  powered?: boolean
}

const CATEGORY_OPTIONS = ['Barchasi', 'Recon & Scan', 'Exploitation', 'PrivEsc', 'Web Pentest', 'Nazariya (QA)', 'Asboblar (Tools)' ]

function CategoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [entries, setEntries] = useState<Cmd[]>([])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Barchasi')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const fromUrl = searchParams.get('category') || 'Barchasi'
    const safe = CATEGORY_OPTIONS.includes(fromUrl) ? fromUrl : 'Barchasi'
    setActiveCategory(safe)
  }, [searchParams])

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(Boolean(window.localStorage.getItem(AUTH_STORAGE_KEY)))
    syncAuth()
    window.addEventListener('hoogle:auth-changed', syncAuth)
    return () => window.removeEventListener('hoogle:auth-changed', syncAuth)
  }, [])

  useEffect(() => { load() }, [])

  async function load() {
    setIsLoading(true)
    try {
      const user = getAuthUser()
      const query = user ? `?userEmail=${encodeURIComponent(user.email)}` : ''
      const res = await fetch(`/api/commands${query}`)
      const data = await res.json()
      setEntries(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((e) => {
      if (activeCategory !== 'Barchasi' && e.category !== activeCategory) return false
      if (!q) return true
      return (
        (e.title || '').toLowerCase().includes(q) ||
        (e.shortDesc || '').toLowerCase().includes(q) ||
        (e.commandText || '').toLowerCase().includes(q) ||
        (e.fullDoc || '').toLowerCase().includes(q)
      )
    })
  }, [entries, query, activeCategory])

  function setCategoryAndRoute(value: string) {
    setActiveCategory(value)
    const next = value === 'Barchasi' ? '/' : `/?category=${encodeURIComponent(value)}`
    router.push(next)
  }

  function copyCode(text: string, id: number) {
    if (!isAuthenticated) {
      openAuthModal()
      return
    }

    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      })
      .catch(() => {})
  }

  function requireAuth(href: string) {
    if (!isAuthenticated) {
      openAuthModal()
      return false
    }

    return true
  }

  return (
    <div className="rn-page min-h-screen bg-[#090a0f] text-[#f8d8d8]">
      <div className="mb-6">
        <div className={`rn-search relative w-full max-w-xl ${isSearchFocused ? 'rn-search-active' : ''}`}>
          <Search className="rn-search-icon absolute left-3 top-1/2 -translate-y-1/2 text-[#ff0033]" size={18} />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Qidirish (Cmd/Ctrl+K)"
            className="w-full pl-10 pr-3 py-3 rounded-md bg-[#101217] border border-[#1d1f2a] text-[#f8d8d8] outline-none"
          />
          <span className="rn-search-glow" aria-hidden="true" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rn-skeleton rounded-md border border-[#22131a] bg-[#0c0d12] p-4" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="rn-skeleton-line w-2/3 h-4 mb-3" />
              <div className="rn-skeleton-line w-1/3 h-3 mb-4" />
              <div className="rn-skeleton-line w-full h-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <div
              key={c.id}
              className="rn-card relative rounded-md border border-[#ff0033] bg-[#0c0d12] p-4"
              style={{ animationDelay: `${Math.min(i, 12) * 55}ms` }}
            >
              <span className="rn-card-scan" aria-hidden="true" />

              <div className="rn-corner rn-corner-tl" />
              <div className="rn-corner rn-corner-br" />

              <div className="flex items-start justify-between gap-3">
                <div>
                  {isAuthenticated ? (
                    <Link href={`/command/${c.id}`} className="text-lg font-semibold text-[#ffe3e3] hover:text-[#ffb8b8] transition-colors">{c.title}</Link>
                  ) : (
                    <button type="button" onClick={() => openAuthModal()} className="text-left text-lg font-semibold text-[#ffe3e3] hover:text-[#ffb8b8] transition-colors">{c.title}</button>
                  )}
                  <div className="mt-1 text-xs text-[#ffb3b3]">{c.category}</div>
                </div>

                <button
                  onClick={() => copyCode(c.commandText || '', c.id)}
                  className={`rn-copy-btn relative inline-flex items-center gap-1 rounded border border-[#ff0033] bg-[#140c10] px-2 py-1 text-[11px] text-[#ffe3e3] overflow-hidden ${copiedId === c.id ? 'rn-copy-success' : ''}`}
                >
                  <span className="rn-copy-ripple" aria-hidden="true" />
                  {copiedId === c.id ? (
                    <span className="rn-copy-content"><Check size={12}/> Nusxalandi</span>
                  ) : (
                    <span className="rn-copy-content"><Copy size={12}/> </span>
                  )}
                </button>
              </div>

              {isAuthenticated ? (
                <>
                  {c.commandText ? (
                    <pre className="mt-3 overflow-x-auto rounded bg-[#090a0f] p-2 font-mono text-sm text-[#f8f1f1]">{c.commandText}</pre>
                  ) : null}

                  {c.shortDesc ? <div className="mt-3 text-sm text-[#ffb3b3]">{c.shortDesc}</div> : null}
                </>
              ) : (
                <div className="rn-locked mt-3 rounded border border-[#ff0033]/60 bg-[#120b0f] px-3 py-2 text-sm text-[#ffd7d7]">
                  <span className="rn-locked-noise" aria-hidden="true" />
                  <span className="relative z-10 flex items-center gap-2">
                    <Lock size={13} className="rn-lock-icon" />
                    Bu ma'lumotni ko'rish uchun login qiling.
                  </span>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                {isAuthenticated ? (
                  <Link href={`/command/${c.id}`} className="rn-detail-btn inline-block rounded border border-[#ff0033] bg-[#1a1d23] px-3 py-1 text-xs text-[#ffe3e3]">Batafsil</Link>
                ) : (
                  <button type="button" onClick={() => openAuthModal()} className="rn-detail-btn inline-block rounded border border-[#ff0033] bg-[#1a1d23] px-3 py-1 text-xs text-[#ffe3e3]">Batafsil</button>
                )}
                <span className="rn-tag text-[10px] uppercase tracking-[0.2em] text-[#ff6a7b]">
                  {isAuthenticated ? 'REDNOTES' : (
                    <>
                      <span className="rn-encrypted-dot" aria-hidden="true" />
                      ENCRYPTED
                    </>
                  )}
                </span>
              </div>
              <CommandEngagement commandId={c.id} compact initialPowerCount={c.powerCount} initialCommentCount={c.commentCount} initialPowered={c.powered} />
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes rn-card-in {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rn-card-scan-sweep {
          0%   { transform: translateX(-100%); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes rn-glow-pulse {
          0%, 100% { box-shadow: 0 0 10px rgba(255,0,51,0.12); }
          50%      { box-shadow: 0 0 22px rgba(255,0,51,0.28); }
        }
        @keyframes rn-ripple-out {
          from { transform: scale(0); opacity: 0.5; }
          to   { transform: scale(2.4); opacity: 0; }
        }
        @keyframes rn-skeleton-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes rn-skeleton-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes rn-noise-flicker {
          0%, 100% { opacity: 0.05; }
          45%      { opacity: 0.02; }
          50%      { opacity: 0.09; }
          55%      { opacity: 0.03; }
        }
        @keyframes rn-blink-dot {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.2; }
        }

        /* ---------- search ---------- */
        .rn-search input {
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .rn-search-active input {
          border-color: #ff0033 !important;
          box-shadow: 0 0 0 3px rgba(255,0,51,0.12), 0 0 16px rgba(255,0,51,0.18);
        }
        .rn-search-icon {
          transition: filter 0.25s ease, transform 0.25s ease;
        }
        .rn-search-active .rn-search-icon {
          filter: drop-shadow(0 0 4px rgba(255,0,51,0.8));
          transform: translateY(-50%) scale(1.08);
        }
        .rn-search-glow {
          position: absolute;
          inset: 0;
          border-radius: 0.375rem;
          pointer-events: none;
        }

        /* ---------- cards ---------- */
        .rn-card {
          opacity: 0;
          animation: rn-card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, rn-glow-pulse 4s ease-in-out infinite;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .rn-card:hover {
          transform: translateY(-3px);
          border-color: #ff3355;
          box-shadow: 0 8px 24px rgba(255,0,51,0.18), 0 0 22px rgba(255,0,51,0.28);
        }
        .rn-card-scan {
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,0,51,0), #ff0033, rgba(255,0,51,0));
          opacity: 0;
          pointer-events: none;
        }
        .rn-card:hover .rn-card-scan {
          animation: rn-card-scan-sweep 1.1s ease-in-out;
        }
        .rn-corner {
          position: absolute;
          width: 10px;
          height: 10px;
          transition: width 0.25s ease, height 0.25s ease;
          pointer-events: none;
        }
        .rn-corner-tl { left: 8px; top: 8px; border-left: 2px solid #ff0033; border-top: 2px solid #ff0033; }
        .rn-corner-br { right: 8px; bottom: 8px; border-right: 2px solid #ff0033; border-bottom: 2px solid #ff0033; }
        .rn-card:hover .rn-corner-tl,
        .rn-card:hover .rn-corner-br {
          width: 16px;
          height: 16px;
        }

        /* ---------- copy button ---------- */
        .rn-copy-btn {
          transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
        }
        .rn-copy-btn:hover {
          background-color: #1a0d12;
          transform: translateY(-1px);
        }
        .rn-copy-btn:active {
          transform: translateY(0) scale(0.96);
        }
        .rn-copy-content {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          animation: rn-fade-swap 0.2s ease;
        }
        @keyframes rn-fade-swap {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rn-copy-ripple {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: rgba(255,0,51,0.5);
          opacity: 0;
          pointer-events: none;
        }
        .rn-copy-success {
          border-color: #22c55e !important;
          color: #d7ffe6 !important;
        }
        .rn-copy-success .rn-copy-ripple {
          animation: rn-ripple-out 0.5s ease-out;
          background: rgba(34,197,94,0.5);
        }

        /* ---------- detail button ---------- */
        .rn-detail-btn {
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
        }
        .rn-detail-btn:hover {
          background-color: #241318;
          box-shadow: 0 0 10px rgba(255,0,51,0.25);
        }

        /* ---------- locked state ---------- */
        .rn-locked {
          position: relative;
          overflow: hidden;
        }
        .rn-locked-noise {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(0deg, rgba(255,0,51,0.4) 0px, transparent 1px, transparent 2px);
          animation: rn-noise-flicker 3.2s steps(6) infinite;
          pointer-events: none;
        }
        .rn-lock-icon {
          transition: transform 0.2s ease;
        }
        .rn-locked:hover .rn-lock-icon {
          transform: scale(1.15) rotate(-4deg);
        }
        .rn-encrypted-dot {
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 9999px;
          background: #ff0033;
          margin-right: 4px;
          animation: rn-blink-dot 1.4s ease-in-out infinite;
        }

        /* ---------- skeleton ---------- */
        .rn-skeleton {
          animation: rn-skeleton-in 0.3s ease forwards;
          opacity: 0;
        }
        .rn-skeleton-line {
          border-radius: 4px;
          background: linear-gradient(90deg, #14161d 0%, #1e2029 20%, #14161d 40%);
          background-size: 800px 100%;
          animation: rn-skeleton-shimmer 1.6s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .rn-card, .rn-card-scan, .rn-skeleton, .rn-skeleton-line,
          .rn-locked-noise, .rn-encrypted-dot, .rn-copy-ripple {
            animation: none !important;
          }
          .rn-card { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-[#ffb3b3]">Yuklanmoqda...</div>}>
      <CategoryPage />
    </Suspense>
  )
}