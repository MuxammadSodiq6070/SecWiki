'use client'

import { Plus, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const CATEGORY_OPTIONS = ['Recon & Scan', 'Exploitation', 'PrivEsc', 'Web Pentest', 'Nazariya (QA)', 'Asboblar (Tools)']

export default function SidebarAddButton() {
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Recon & Scan')
  const [commandText, setCommandText] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [fullDoc, setFullDoc] = useState('')
  const [parametersJson, setParametersJson] = useState('[\n  { "flag": "-sV", "desc": "Service version" }\n]')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setMounted(true)
    const syncAdmin = () => fetch('/api/auth/me').then((response) => response.json()).then((data) => setIsAdmin(Boolean(data.isAdmin))).catch(() => {})
    syncAdmin()
    window.addEventListener('hoogle:admin-changed', syncAdmin)
    return () => window.removeEventListener('hoogle:admin-changed', syncAdmin)
  }, [])

  if (!isAdmin) return null

  async function handleCreate() {
    if (!title.trim()) {
      setStatus('Sarlavha kiritilishi shart')
      return
    }

    try {
      const parsedParams = JSON.parse(parametersJson || '[]')
      const payload = {
        title: title.trim(),
        category,
        commandText: commandText.trim(),
        shortDesc: shortDesc.trim(),
        fullDoc: fullDoc.trim(),
        parameters: parsedParams
      }

      const res = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Create failed')

      setShowModal(false)
      setTitle('')
      setCommandText('')
      setShortDesc('')
      setFullDoc('')
      setParametersJson('[\n  { "flag": "-sV", "desc": "Service version" }\n]')
      setStatus('Yozuv saqlandi')
      window.location.reload()
    } catch (error) {
      console.error(error)
      setStatus('JSON parametrlari xato yoki server xatosi')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="mb-3 block w-full rounded-md border bg-gradient-to-br from-[#12131a] to-[#090a0f] px-3 py-2 text-left text-[15px] text-[#ffdede]"
        style={{ borderColor: '#ff0033', boxShadow: '0 0 10px rgba(255,0,0,0.15)' }}
      >
        <span className="mr-2">+</span>Yangi Qo'shish
      </button>

      {status ? (
        <div className="mb-3 rounded-md border border-[#ff0033] bg-[#120b0f] px-3 py-2 text-xs text-[#ffd7d7] shadow-[0_0_10px_rgba(255,0,51,0.15)]">
          {status}
        </div>
      ) : null}

      {mounted && showModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-[#ff0033] bg-[#0c0d12] p-4 shadow-[0_0_25px_rgba(255,0,51,0.3)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#ffe3e3]">Yangi buyruq qo'shish</h3>
              <button type="button" onClick={() => setShowModal(false)} className="rounded border border-[#ff0033] p-1 text-[#ffe3e3]">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-3">
              <div>
                <label className="mb-1 block text-xs text-[#ffb3b3]">Sarlavha</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded border border-[#2a2d38] bg-[#0f1117] p-2 text-[#ffe3e3]" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#ffb3b3]">Kategoriya</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded border border-[#2a2d38] bg-[#0f1117] p-2 text-[#ffe3e3]">
                  {CATEGORY_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#ffb3b3]">Buyruq / sintaksis</label>
                <textarea value={commandText} onChange={(e) => setCommandText(e.target.value)} className="w-full rounded border border-[#2a2d38] bg-[#0f1117] p-2 font-mono text-[#ffe3e3]" rows={3} />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#ffb3b3]">Qisqacha tavsif</label>
                <input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="w-full rounded border border-[#2a2d38] bg-[#0f1117] p-2 text-[#ffe3e3]" />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#ffb3b3]">To'liq ma'lumot (Markdown)</label>
                <textarea value={fullDoc} onChange={(e) => setFullDoc(e.target.value)} className="w-full rounded border border-[#2a2d38] bg-[#0f1117] p-2 text-[#ffe3e3]" rows={5} />
              </div>

              <div>
                <label className="mb-1 block text-xs text-[#ffb3b3]">Parameters (JSON array)</label>
                <textarea value={parametersJson} onChange={(e) => setParametersJson(e.target.value)} className="w-full rounded border border-[#2a2d38] bg-[#0f1117] p-2 font-mono text-[#ffe3e3]" rows={4} />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="rounded border border-[#2a2d38] bg-[#11161d] px-3 py-2 text-[#ffe3e3]">Bekor</button>
              <button type="button" onClick={() => void handleCreate()} className="rounded border border-[#ff0033] bg-[#ff0033] px-3 py-2 text-white shadow-[0_0_12px_rgba(255,0,51,0.25)]">Saqlash</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}