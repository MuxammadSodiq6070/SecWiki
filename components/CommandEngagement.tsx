'use client'

import { MessageSquare, Send, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getAuthUser, openAuthModal, type AuthUser } from './AuthGate'
import { apiUrl } from '../lib/api'

type Comment = { id: number; authorName: string; body: string; createdAt: string }

export default function CommandEngagement({ commandId, compact = false, initialPowerCount = 0, initialCommentCount = 0, initialPowered = false }: { commandId: number; compact?: boolean; initialPowerCount?: number; initialCommentCount?: number; initialPowered?: boolean }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [comment, setComment] = useState('')
  const [powerCount, setPowerCount] = useState(initialPowerCount)
  const [powered, setPowered] = useState(initialPowered)
  const [commentCount, setCommentCount] = useState(initialCommentCount)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser())
    syncUser()
    window.addEventListener('hoogle:auth-changed', syncUser)
    if (!compact) void loadComments()
    if (!compact) void loadPower()
    return () => window.removeEventListener('hoogle:auth-changed', syncUser)
  }, [commandId, compact])

  async function loadComments() {
    const response = await fetch(apiUrl(`/api/commands/${commandId}/comments`))
    if (response.ok) setComments(await response.json())
  }

  async function loadPower() {
    const currentUser = getAuthUser()
    const query = currentUser ? `?userEmail=${encodeURIComponent(currentUser.email)}` : ''
    const response = await fetch(apiUrl(`/api/commands/${commandId}/power${query}`))
    if (response.ok) {
      const data = await response.json()
      setPowerCount(data.count)
      setPowered(data.active)
    }
  }

  async function togglePower() {
    if (!user) return openAuthModal()
    const response = await fetch(apiUrl(`/api/commands/${commandId}/power`), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userEmail: user.email })
    })
    if (response.ok) {
      const data = await response.json()
      setPowerCount(data.count)
      setPowered(data.active)
    }
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault()
    if (!user) return openAuthModal()
    if (!comment.trim()) return setStatus('Comment yozing')

    const response = await fetch(apiUrl(`/api/commands/${commandId}/comments`), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: comment, authorName: user.name, authorEmail: user.email })
    })
    if (response.ok) {
      setComment('')
      setStatus('Comment qo\'shildi')
      void loadComments()
    } else setStatus('Comment saqlanmadi')
  }

  return (
    <div className={`rn-engagement ${compact ? 'mt-2' : 'mt-4 border-t border-[#2a1a22] pt-3'}`}>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => void togglePower()} className={`rn-power-btn inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] ${powered ? 'rn-powered' : ''}`} title="Lightning / Power">
          <Zap size={13} fill={powered ? 'currentColor' : 'none'} /> {powerCount}
        </button>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#ff9eaa]"><MessageSquare size={13} /> {compact ? commentCount : comments.length}</span>
      </div>

      {compact ? null : <>

      <div className="mt-3 space-y-2">
        {comments.map((item) => (
          <div key={item.id} className="rounded border border-[#241921] bg-[#101217] px-3 py-2 text-xs">
            <span className="font-semibold text-[#ffe3e3]">{item.authorName}</span>
            <span className="ml-2 text-[#ffb3b3]">{item.body}</span>
          </div>
        ))}
      </div>

      <form onSubmit={submitComment} className="mt-3 flex gap-2">
        <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Comment yozing..." className="min-w-0 flex-1 rounded border border-[#2a2d38] bg-[#0f1117] px-2.5 py-1.5 text-xs text-[#ffe3e3] outline-none" />
        <button type="submit" className="inline-flex items-center gap-1 rounded border border-[#ff0033] bg-[#180b11] px-2.5 py-1.5 text-xs text-[#ffd7d7]" title="Comment yuborish"><Send size={13} /></button>
      </form>
      {status ? <div className="mt-2 text-[11px] text-[#ff9eaa]">{status}</div> : null}
      </>}
    </div>
  )
}