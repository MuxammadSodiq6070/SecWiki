import Link from 'next/link'
import React from 'react'
import '../styles/globals.css'
import SidebarActions from '../components/SidebarActions'
import SidebarAddButton from '../components/SidebarAddButton'
import CookieConsent from '../components/CookieConsent'
import AuthGate from '../components/AuthGate'
import TopNavbar from '../components/TopNavbar'

const SIDEBAR_ITEMS = [
  { label: 'Barchasi', href: '/' },
  { label: 'Recon & Scan', href: '/?category=' + encodeURIComponent('Recon & Scan') },
  { label: 'Exploitation', href: '/?category=' + encodeURIComponent('Exploitation') },
  { label: 'PrivEsc', href: '/?category=' + encodeURIComponent('PrivEsc') },
  { label: 'Web Pentest', href: '/?category=' + encodeURIComponent('Web Pentest') },
  { label: 'Nazariya (QA)', href: '/?category=' + encodeURIComponent('Nazariya (QA)') },
  { label: 'Asboblar (Tools)', href: '/?category=' + encodeURIComponent('Asboblar (Tools)') }
]

export const metadata = {
  title: 'REDNOTES — Red Ops',
  description: 'REDNOTES: ultra-fast pentest cheat sheet & knowledge base (v1.0 Red Ops)'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className="dark">
      <body className="min-h-screen bg-[#090a0f] text-[#ffdcdc]">
        <AuthGate />
        <CookieConsent />
        <div className="flex">
          <aside className="rn-sidebar fixed left-0 top-0 bottom-0 w-64 bg-[#0b0c11] border-r overflow-hidden" style={{ borderColor: '#ff0033' }}>
            {/* vertical scan-line sweeping the sidebar edge */}
            <div className="rn-scanline" aria-hidden="true" />

            <div className="h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="rn-logo-row flex items-center gap-3 border-b px-4 py-6" style={{ borderColor: '#1a1c23' }}>
                  <div className="rn-logo text-2xl font-bold text-[#ff0033]" data-text="REDNOTES">
                    REDNOTES
                  </div>
                  <div className="rn-version text-xs text-[#ffb6c1]">
                    <span className="rn-dot" aria-hidden="true" />
                    v1.0 Red Ops
                  </div>
                </div>

                <div className="p-4">
                  <SidebarAddButton />

                  <nav className="space-y-1">
                    {SIDEBAR_ITEMS.map((item, i) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="rn-nav-item group relative flex items-center rounded-md px-3 py-2 text-[15px] text-[#ffdede] overflow-hidden"
                        style={{ animationDelay: `${80 + i * 55}ms` }}
                      >
                        <span className="rn-nav-bracket rn-nav-bracket-l" aria-hidden="true">[</span>
                        <span className="rn-nav-caret" aria-hidden="true">&gt;</span>
                        <span className="rn-nav-label">{item.label}</span>
                        <span className="rn-nav-bracket rn-nav-bracket-r" aria-hidden="true">]</span>
                        <span className="rn-nav-glow" aria-hidden="true" />
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="border-t p-4" style={{ borderColor: '#12131a' }}>
                <SidebarActions />
                <div className="rn-profile mt-4 rounded-md border border-[#1a1c23] bg-[#0f1014] p-2">
                  <div className="text-xs text-[#ffdede]">Profil</div>
                  <div className="mt-1 text-sm text-[#ffdede] flex items-center gap-2">
                    <span className="rn-status-dot" aria-hidden="true" />
                    Admin
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="ml-64 flex-1 min-h-screen">
            <TopNavbar />
            <main className="rn-main p-6">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        </div>

        <style>{`
          /* ---------- keyframes ---------- */
          @keyframes rn-scan-move {
            0%   { transform: translateY(-100%); opacity: 0; }
            8%   { opacity: 1; }
            92%  { opacity: 1; }
            100% { transform: translateY(2600%); opacity: 0; }
          }
          @keyframes rn-flicker {
            0%, 92%, 100% { opacity: 1; text-shadow: 0 0 6px rgba(255,0,51,0.55), 0 0 18px rgba(255,0,51,0.25); }
            93% { opacity: 0.35; text-shadow: none; }
            94% { opacity: 1; }
            95% { opacity: 0.5; }
            96% { opacity: 1; text-shadow: 0 0 6px rgba(255,0,51,0.55), 0 0 18px rgba(255,0,51,0.25); }
          }
          @keyframes rn-nav-in {
            from { opacity: 0; transform: translateX(-10px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          @keyframes rn-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255,0,51,0.55); }
            50%      { box-shadow: 0 0 0 4px rgba(255,0,51,0); }
          }
          @keyframes rn-blink {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.25; }
          }
          @keyframes rn-fade-up {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* ---------- sidebar scan-line ---------- */
          .rn-scanline {
            position: absolute;
            left: -1px;
            top: 0;
            width: 2px;
            height: 12%;
            background: linear-gradient(180deg, rgba(255,0,51,0) 0%, #ff0033 50%, rgba(255,0,51,0) 100%);
            filter: drop-shadow(0 0 6px rgba(255,0,51,0.8));
            animation: rn-scan-move 6s linear infinite;
            pointer-events: none;
          }

          /* ---------- logo ---------- */
          .rn-logo {
            letter-spacing: 0.02em;
            text-shadow: 0 0 6px rgba(255,0,51,0.55), 0 0 18px rgba(255,0,51,0.25);
          }
          .rn-logo-row:hover .rn-logo {
            animation: rn-flicker 2.4s ease-in-out infinite;
          }

          /* ---------- version dot ---------- */
          .rn-version { display: flex; align-items: center; gap: 6px; }
          .rn-dot {
            width: 6px;
            height: 6px;
            border-radius: 9999px;
            background: #ff0033;
            display: inline-block;
            animation: rn-pulse 1.8s ease-out infinite;
          }

          /* ---------- nav items ---------- */
          .rn-nav-item {
            opacity: 0;
            animation: rn-nav-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            transition: background-color 0.25s ease, padding-left 0.25s ease, color 0.2s ease;
          }
          .rn-nav-item:hover {
            background-color: #12131a;
            padding-left: 1.1rem;
          }
          .rn-nav-bracket {
            color: #ff0033;
            font-weight: 600;
            display: inline-block;
            opacity: 0;
            transform: scaleX(0.4);
            transition: opacity 0.2s ease, transform 0.2s ease;
          }
          .rn-nav-bracket-l { margin-right: 2px; transform-origin: right; }
          .rn-nav-bracket-r { margin-left: 2px; transform-origin: left; }
          .rn-nav-item:hover .rn-nav-bracket {
            opacity: 1;
            transform: scaleX(1);
          }
          .rn-nav-caret {
            color: #ff0033;
            width: 0;
            overflow: hidden;
            display: inline-block;
            opacity: 0;
            transition: width 0.2s ease, opacity 0.2s ease, margin-right 0.2s ease;
            font-family: 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;
          }
          .rn-nav-item:hover .rn-nav-caret {
            width: 0.7em;
            opacity: 1;
            margin-right: 4px;
            animation: rn-blink 1s step-end infinite;
          }
          .rn-nav-label {
            transition: transform 0.25s ease, color 0.2s ease;
          }
          .rn-nav-item:hover .rn-nav-label {
            color: #ffffff;
          }
          .rn-nav-glow {
            position: absolute;
            inset: 0;
            border-radius: 0.375rem;
            box-shadow: inset 2px 0 0 0 #ff0033;
            opacity: 0;
            transform: translateX(-6px);
            transition: opacity 0.25s ease, transform 0.25s ease;
            pointer-events: none;
          }
          .rn-nav-item:hover .rn-nav-glow {
            opacity: 1;
            transform: translateX(0);
          }

          /* ---------- profile status ---------- */
          .rn-status-dot {
            width: 7px;
            height: 7px;
            border-radius: 9999px;
            background: #22c55e;
            display: inline-block;
            box-shadow: 0 0 6px rgba(34,197,94,0.7);
            animation: rn-pulse 2.4s ease-out infinite;
          }

          /* ---------- main content entrance ---------- */
          .rn-main > div {
            animation: rn-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @media (prefers-reduced-motion: reduce) {
            .rn-scanline, .rn-dot, .rn-status-dot, .rn-logo-row:hover .rn-logo,
            .rn-nav-item, .rn-nav-caret, .rn-main > div {
              animation: none !important;
            }
            .rn-nav-item { opacity: 1; }
          }
        `}</style>
      </body>
    </html>
  )
}