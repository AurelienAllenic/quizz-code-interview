import { useEffect } from 'react'

/**
 * Empêche le scroll du document tant que locked est vrai (modale ouverte).
 * Rétablit la position après fermeture (évite le saut sur mobile).
 */
export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return

    const scrollY = window.scrollY

    const prevOverflow = document.body.style.overflow
    const prevPosition = document.body.style.position
    const prevTop = document.body.style.top
    const prevLeft = document.body.style.left
    const prevRight = document.body.style.right
    const prevWidth = document.body.style.width
    const prevHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    return () => {
      document.body.style.overflow = prevOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
      document.body.style.position = prevPosition
      document.body.style.top = prevTop
      document.body.style.left = prevLeft
      document.body.style.right = prevRight
      document.body.style.width = prevWidth
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
