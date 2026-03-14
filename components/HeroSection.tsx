'use client'

import { useEffect, useRef } from 'react'
import ConnectorBanner from './ConnectorBanner'

interface Props {
  onLogin: () => void
}

export default function HeroSection({ onLogin }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => ref.current?.classList.add('visible'), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="hero" ref={ref}>
      <ConnectorBanner />
      <h1>
        Utiliza tus reuniones<br />como insumo
      </h1>
      <p>
        Genera automáticamente issues en Jira basados en la transcripción o notas de tu reunión.
      </p>
      <button className="button-primary" onClick={onLogin}>
        Conectar con Jira
      </button>
    </section>
  )
}
