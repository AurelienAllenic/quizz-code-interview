import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

/**
 * Modale de confirmation (suppression / reset). Fermeture Échap et clic overlay.
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  danger = false,
}) {
  const onCancelRef = useRef(onCancel)
  onCancelRef.current = onCancel

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onCancelRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <motion.button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        aria-label="Fermer la boîte de dialogue"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="relative w-full max-w-md rounded-2xl p-5 shadow-2xl glass"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
              color: danger ? '#f87171' : '#60a5fa',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0">
            <h3 id="confirm-modal-title" className="font-display font-800 text-lg text-white">
              {title}
            </h3>
            <p className="text-slate-400 text-sm font-mono mt-2 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-terminal transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8' }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-terminal font-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: danger ? 'rgba(239,68,68,0.18)' : 'rgba(59,130,246,0.2)',
              color: danger ? '#f87171' : '#93c5fd',
              border: `1px solid ${danger ? 'rgba(239,68,68,0.45)' : 'rgba(59,130,246,0.35)'}`,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
