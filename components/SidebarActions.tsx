'use client'

import { Download, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function SidebarActions() {
  const [status, setStatus] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const syncAdmin = () => fetch('/api/auth/me').then((response) => response.json()).then((data) => setIsAdmin(Boolean(data.isAdmin))).catch(() => {})
    syncAdmin()
    window.addEventListener('hoogle:admin-changed', syncAdmin)
    return () => window.removeEventListener('hoogle:admin-changed', syncAdmin)
  }, [])

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const payload = Array.isArray(json) ? json : Array.isArray(json.Command) ? json.Command : json.data || []

      const res = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Array.isArray(payload) ? payload : { import: true, data: payload })
      })

      if (!res.ok) throw new Error('Import failed')
      setStatus('JSON import bo\'ldi')
      window.location.reload()
    } catch (error) {
      console.error(error)
      setStatus('Invalid JSON import')
    }
  }

  async function handleExport() {
    try {
      const res = await fetch('/api/commands?export=1')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'hoogle-export.json'
      a.click()
      URL.revokeObjectURL(url)
      setStatus('Export bajarildi')
    } catch (error) {
      console.error(error)
      setStatus('Export xatosi')
    }
  }

  async function handlePasteImport() {
    try {
      const text = await navigator.clipboard.readText()
      const json = JSON.parse(text)
      const payload = Array.isArray(json) ? json : Array.isArray(json.Command) ? json.Command : json.data || []

      const res = await fetch('/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Array.isArray(payload) ? payload : { import: true, data: payload })
      })

      if (!res.ok) throw new Error('Clipboard import failed')
      setStatus('Clipboard import bo\'ldi')
      window.location.reload()
    } catch (error) {
      console.error(error)
      setStatus('Clipboard JSON xato')
    }
  }

  return (
    <>
      {!isAdmin ? null : <>
      <div className="flex flex-col gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#ff0033] bg-[#110b13] px-2.5 py-1.5 text-left text-[11px] text-[#ffd7d7]">
          <Upload size={13} /> JSON Import
          <input
            hidden
            type="file"
            accept="application/json"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleImportFile(file)
              e.target.value = ''
            }}
          />
        </label>

        <button
          type="button"
          onClick={() => void handleExport()}
          className="inline-flex items-center gap-2 rounded-md border border-[#ff0033] bg-[#110b13] px-2.5 py-1.5 text-left text-[11px] text-[#ffd7d7]"
        >
          <Download size={13} /> Export
        </button>

        <button
          type="button"
          onClick={() => void handlePasteImport()}
          className="inline-flex items-center gap-2 rounded-md border border-[#ff0033] bg-[#110b13] px-2.5 py-1.5 text-left text-[11px] text-[#ffd7d7]"
        >
          Clipboard import
        </button>
      </div>

      {status ? (
        <div className="mt-3 rounded-md border border-[#ff0033] bg-[#120b0f] px-3 py-2 text-xs text-[#ffd7d7] shadow-[0_0_10px_rgba(255,0,51,0.15)]">
          {status}
        </div>
      ) : null}
      </>}
    </>
  )
}
