'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { AUTH_STORAGE_KEY, openAuthModal } from '../../../components/AuthGate'
import { Lock, ShieldAlert } from 'lucide-react'
import CommandEngagement from '../../../components/CommandEngagement'

type Props = { params: { id: string } }

type CommandDetail = {
  id: number
  title: string
  category: string
  commandText?: string
  shortDesc?: string
  fullDoc?: string
  parameters?: Array<{ flag: string; desc: string }>
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="rn-heading font-semibold text-rose-200 inline-flex items-center gap-2">
      <span className="rn-heading-bracket">[</span>
      {children}
      <span className="rn-heading-bracket">]</span>
    </h2>
  )
}

export default function CommandPage({ params }: Props) {
  const id = params.id
  const [cmd, setCmd] = useState<CommandDetail | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(Boolean(window.localStorage.getItem(AUTH_STORAGE_KEY)))
    syncAuth()
    window.addEventListener('hoogle:auth-changed', syncAuth)
    return () => window.removeEventListener('hoogle:auth-changed', syncAuth)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/commands/${id}`)
        if (!res.ok) {
          setCmd(null)
          return
        }
        const data = await res.json()
        setCmd(data)
      } catch (error) {
        console.error(error)
        setCmd(null)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  if (!isAuthenticated) {
    return (
      <div className="rn-gate mx-auto max-w-3xl rounded-xl border border-[#ff0033] bg-[#0b0c11] p-6 relative overflow-hidden">
        <span className="rn-gate-noise" aria-hidden="true" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#ffb6c1] flex items-center gap-2">
            <span className="rn-gate-dot" aria-hidden="true" />
            REDNOTES
          </p>

          <div className="rn-gate-lock mt-4 inline-flex items-center justify-center rounded-full border border-[#ff0033] p-3">
            <Lock size={20} className="text-[#ff0033]" />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-[#ffe3e3]">Batafsil ma'lumotga kirish uchun login qiling</h1>
          <p className="mt-3 text-sm leading-7 text-[#f1d7d7]">
            Bu sahifadagi buyruq va parametrlar maxfiy yoki cheklangan ma'lumotlarni o'z ichiga oladi. Faqat login qilingan foydalanuvchilar to'liq ma'lumotlarni ko'rishi mumkin.
          </p>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => openAuthModal()} className="rn-login-btn relative overflow-hidden rounded-md border border-[#ff0033] bg-[#ff0033] px-4 py-2 text-sm font-medium text-white">
              Login / Register
            </button>
            <Link href="/" className="rn-home-btn rounded-md border border-[#2a2d38] bg-[#101217] px-4 py-2 text-sm text-[#ffe3e3]">Bosh sahifa</Link>
          </div>
        </div>

        <style>{`
          @keyframes rn-gate-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255,0,51,0.45), 0 0 18px rgba(255,0,51,0.12) inset; }
            50%      { box-shadow: 0 0 0 8px rgba(255,0,51,0), 0 0 18px rgba(255,0,51,0.12) inset; }
          }
          @keyframes rn-lock-pulse {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(1.06); }
          }
          @keyframes rn-dot-blink {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.25; }
          }
          @keyframes rn-noise-drift {
            0%   { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          .rn-gate {
            animation: rn-gate-pulse 3.5s ease-in-out infinite;
          }
          .rn-gate-noise {
            position: absolute;
            inset: -50% 0 0 0;
            height: 200%;
            background-image: repeating-linear-gradient(0deg, rgba(255,0,51,0.03) 0px, transparent 1px, transparent 3px);
            animation: rn-noise-drift 8s linear infinite;
            pointer-events: none;
          }
          .rn-gate-dot {
            width: 6px; height: 6px; border-radius: 9999px; background: #ff0033;
            display: inline-block;
            animation: rn-dot-blink 1.4s ease-in-out infinite;
          }
          .rn-gate-lock {
            animation: rn-lock-pulse 2s ease-in-out infinite;
          }
          .rn-login-btn, .rn-home-btn {
            transition: transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          }
          .rn-login-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(255,0,51,0.35);
          }
          .rn-home-btn:hover {
            transform: translateY(-1px);
            background-color: #161822;
          }
          @media (prefers-reduced-motion: reduce) {
            .rn-gate, .rn-gate-noise, .rn-gate-dot, .rn-gate-lock { animation: none !important; }
          }
        `}</style>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rn-boot p-6 text-rose-300 flex items-center gap-3">
        <span className="rn-boot-cursor" aria-hidden="true" />
        Ma'lumot deshifrlanmoqda...
        <style>{`
          @keyframes rn-cursor-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
          .rn-boot-cursor {
            width: 8px; height: 16px; background: #ff0033; display: inline-block;
            animation: rn-cursor-blink 0.9s step-end infinite;
          }
        `}</style>
      </div>
    )
  }

  if (!cmd) {
    return (
      <div className="p-6 text-rose-300 flex items-center gap-2">
        <ShieldAlert size={18} className="text-[#ff0033]" />
        Buyruq topilmadi
      </div>
    )
  }

  let cmdParams: Array<{ flag: string; desc: string }> = []
  try {
    if (cmd.parameters && typeof cmd.parameters === 'string') cmdParams = JSON.parse(cmd.parameters)
    else cmdParams = cmd.parameters || []
  } catch (e) {
    cmdParams = []
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-rose-100">
      <div className="rn-section" style={{ animationDelay: '40ms' }}>
        <h1 className="text-2xl font-bold text-rose-200">{cmd.title}</h1>
        <div className="text-sm text-rose-300 mt-2 inline-flex items-center gap-2">
          <span className="rn-cat-dot" aria-hidden="true" />
          Kategoriya: {cmd.category}
        </div>
      </div>

      <div className="rn-section mt-4" style={{ animationDelay: '140ms' }}>
        <SectionHeading>Sintaksis</SectionHeading>
        <pre className="rn-code mt-2 overflow-x-auto rounded bg-[#090a0f] p-3 font-mono text-sm text-[#f8f1f1] relative">{cmd.commandText}</pre>
      </div>

      <div className="rn-section mt-4" style={{ animationDelay: '240ms' }}>
        <SectionHeading>Tushuntirish</SectionHeading>
        <div className="mt-2 whitespace-pre-wrap text-rose-200">{cmd.shortDesc}</div>
      </div>

      <div className="rn-section mt-4" style={{ animationDelay: '340ms' }}>
        <SectionHeading>To'liq hujjat</SectionHeading>
        <pre className="rn-code mt-2 overflow-x-auto rounded bg-[#090a0f] p-3 text-sm text-[#f8f1f1] whitespace-pre-wrap relative">{cmd.fullDoc || ''}</pre>
      </div>

      <div className="rn-section mt-4" style={{ animationDelay: '440ms' }}>
        <SectionHeading>Parametrlar va bayonot</SectionHeading>
        <table className="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-rose-300">
              <th className="border-b border-[#ff0033] py-1">Flag</th>
              <th className="border-b border-[#ff0033] py-1">Tavsif</th>
            </tr>
          </thead>
          <tbody>
            {cmdParams.map((p: { flag: string; desc: string }, i: number) => (
              <tr key={i} className="rn-row align-top" style={{ animationDelay: `${480 + i * 60}ms` }}>
                <td className="py-2 pr-3 font-mono text-rose-200">{p.flag}</td>
                <td className="py-2 text-rose-200">{p.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rn-section rn-warning mt-6 text-sm text-rose-300" style={{ animationDelay: '560ms' }}>
        <ShieldAlert size={14} className="inline mr-1 -mt-0.5 text-[#ff0033]" />
        Xavfsizlik ogohlantirishi: Bu ma'lumotlarni faqat ruxsatli muhitda ishlating. Ruxsatsiz sinov va hujumlar qonuniy oqibatlarga olib kelishi mumkin.
      </div>

      <CommandEngagement commandId={cmd.id} />

      <style>{`
        @keyframes rn-section-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rn-row-in {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes rn-code-scan {
          0%   { transform: translateY(-100%); opacity: 0; }
          15%  { opacity: 0.7; }
          85%  { opacity: 0.7; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes rn-cat-blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }

        .rn-section {
          opacity: 0;
          animation: rn-section-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .rn-cat-dot {
          width: 6px; height: 6px; border-radius: 9999px; background: #ff0033;
          display: inline-block;
          animation: rn-cat-blink 1.6s ease-in-out infinite;
        }
        .rn-heading-bracket {
          color: #ff0033;
        }
        .rn-code::after {
          content: '';
          position: absolute;
          left: 0; top: 0; width: 100%; height: 40%;
          background: linear-gradient(180deg, rgba(255,0,51,0.15), transparent);
          animation: rn-code-scan 2.2s ease-in-out 1;
          pointer-events: none;
        }
        .rn-row {
          opacity: 0;
          animation: rn-row-in 0.35s ease forwards;
          transition: background-color 0.2s ease;
        }
        .rn-row:hover {
          background-color: rgba(255,0,51,0.06);
        }
        .rn-warning {
          border-left: 2px solid #ff0033;
          padding-left: 10px;
        }

        @media (prefers-reduced-motion: reduce) {
          .rn-section, .rn-row, .rn-code::after, .rn-cat-dot { animation: none !important; }
          .rn-section, .rn-row { opacity: 1; }
        }
      `}</style>
    </div>
  )
}