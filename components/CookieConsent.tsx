'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AUTH_STORAGE_KEY } from './AuthGate'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = Boolean(window.localStorage.getItem(AUTH_STORAGE_KEY))
    setVisible(!isLoggedIn)
  }, [])

  function decide(choice: 'accepted' | 'declined') {
    setVisible(false)

    if (choice === 'declined') {
      router.push('/privacy-policy')
      return
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(420px,calc(100vw-2rem))] rounded-xl border border-[#ff0033]/80 bg-[#0b0c11]/95 p-4 shadow-[0_0_18px_rgba(255,0,51,0.18)] backdrop-blur-sm">
      <div className="space-y-3">
        <p className="text-sm leading-6 text-[#f8d8d8]">
          Ushbu sayt o'z xizmatlarini ko'rsatish, trafikni tahlil qilish va xavfsizlikni yaxshilash uchun cookie-fayllardan foydalanadi. Saytni ko'rib chiqish davomida siz{' '}
          <Link href="/privacy-policy" className="font-semibold text-[#ffb6c1] underline decoration-[#ffb6c1] underline-offset-2">
            Maxfiylik siyosati
          </Link>
          {' '}ga rozilik bergan hisoblanasiz.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => decide('declined')}
            className="rounded-md border border-[#ff0033] bg-transparent px-3 py-2 text-sm font-medium text-[#ffd7d7] transition hover:bg-[#150d12]"
          >
            Rad etaman
          </button>
          <button
            type="button"
            onClick={() => decide('accepted')}
            className="rounded-md border border-[#ff0033] bg-[#ff0033] px-3 py-2 text-sm font-medium text-white shadow-[0_0_12px_rgba(255,0,51,0.25)] transition hover:bg-[#ff1a4d]"
          >
            Qabul qilaman
          </button>
        </div>
      </div>
    </div>
  )
}
