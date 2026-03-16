'use client'

import { useEffect, useState } from 'react'

const NOTETAKERS = ['Granola', 'Fireflies', 'Otter', 'Read AI', 'Google Notes']

export default function ConnectorBanner() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % NOTETAKERS.length)
        setVisible(true)
      }, 400)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="connector-banner">
      {/* Left: rotating notetaker name */}
      <div
        className="connector-logo connector-logo--text"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
      >
        {NOTETAKERS[index]}
      </div>

      <div className="connector-line connector-line--left" />
      <div className="connector-pill">Semantic</div>
      <div className="connector-line connector-line--right" />

      {/* Right: Jira text */}
      <div className="connector-logo connector-logo--text">
        Jira
      </div>
    </div>
  )
}
