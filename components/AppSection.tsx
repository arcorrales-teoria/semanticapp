'use client'

import { useEffect, useRef, useState } from 'react'
import { DEPARTMENTS } from '@/lib/config'
import type { AnalyzeResult, JiraProject, UserInfo } from '@/lib/types'

interface Props {
  userInfo: UserInfo
  onLogout: () => void
}

export default function AppSection({ userInfo, onLogout }: Props) {
  const ref = useRef<HTMLElement>(null)

  // Form state
  const [transcript, setTranscript] = useState('')
  const [department, setDepartment] = useState('producto')
  const [projectKey, setProjectKey] = useState('')
  const [fileName, setFileName] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  // Async state
  const [projects, setProjects] = useState<JiraProject[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => ref.current?.classList.add('visible'), 100)
    return () => clearTimeout(timer)
  }, [])

  // Fetch real Jira projects
  useEffect(() => {
    async function loadProjects() {
      setLoadingProjects(true)
      try {
        const res = await fetch('/api/jira/projects')
        const data = await res.json()
        if (res.ok && data.projects?.length) {
          setProjects(data.projects)
          setProjectKey(data.projects[0].key)
        } else {
          setErrorMsg(data.error ?? 'No se pudieron cargar los proyectos de Jira')
        }
      } catch (err) {
        setErrorMsg('Error al cargar proyectos: ' + (err as Error).message)
      } finally {
        setLoadingProjects(false)
      }
    }
    loadProjects()
  }, [])

  const handleFileSelect = (file: File) => {
    setFileName(`✓ ${file.name}`)
    // Read file content into transcript
    const reader = new FileReader()
    reader.onload = e => setTranscript((e.target?.result as string) ?? '')
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleGenerate = async () => {
    setErrorMsg('')

    if (!transcript.trim()) {
      setErrorMsg('Por favor ingresa las notas de la reunión o sube un archivo')
      return
    }
    if (!projectKey) {
      setErrorMsg('Selecciona un proyecto de Jira')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, department, projectKey }),
      })

      const data: AnalyzeResult = await res.json()

      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? 'Error al generar insights')
        return
      }

      setResult(data)
    } catch (err) {
      setErrorMsg('Error de conexión: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="app-section" ref={ref}>
      {/* Header */}
      <div className="user-header">
        <h2>¡Hola, {userInfo.name}!</h2>
        <p>Analiza tus reuniones y crea tasks automáticamente</p>
        <button className="button-secondary" onClick={onLogout} style={{ marginTop: 16 }}>
          Desconectar
        </button>
      </div>

      {/* Form */}
      <div className="card">
        <div className="form-grid">
          <div className="form-group">
            <label>Proyecto Jira</label>
            <select
              className="input-field"
              value={projectKey}
              onChange={e => setProjectKey(e.target.value)}
              disabled={loadingProjects}
            >
              {loadingProjects ? (
                <option>Cargando proyectos...</option>
              ) : projects.length === 0 ? (
                <option>Sin proyectos disponibles</option>
              ) : (
                projects.map(p => (
                  <option key={p.key} value={p.key}>
                    {p.name} ({p.key})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Departamento</label>
            <select
              className="input-field"
              value={department}
              onChange={e => setDepartment(e.target.value)}
            >
              {DEPARTMENTS.map(d => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 24 }}>
          <label>Notas de la Reunión</label>
          <textarea
            className="input-field textarea-field"
            placeholder="Pega o escribe las notas de tu reunión aquí..."
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 24 }}>
          <label>O sube un archivo (PDF, DOCX, TXT)</label>
          <div
            className={`drop-zone${isDragOver ? ' dragover' : ''}`}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
            <p style={{ margin: 0, fontWeight: 600 }}>Arrastra tu archivo aquí</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#999' }}>
              o haz click para seleccionar
            </p>
          </div>
          <input
            type="file"
            id="fileInput"
            style={{ display: 'none' }}
            accept=".txt,.docx,.pdf"
            onChange={e => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]) }}
          />
          {fileName && (
            <span style={{ fontSize: 12, color: '#999', marginTop: 8, display: 'block' }}>
              {fileName}
            </span>
          )}
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '2px solid rgba(239,68,68,0.3)',
              borderRadius: 6,
              padding: '10px 14px',
              fontSize: 12,
              color: '#dc2626',
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}

        <button
          className="button-primary"
          onClick={handleGenerate}
          disabled={loading || loadingProjects}
          style={{ width: '100%', padding: '14px 28px' }}
        >
          {loading ? (
            <><span className="loader" /> Procesando con IA...</>
          ) : (
            'Generar Insights'
          )}
        </button>
      </div>

      {/* Results */}
      {result && result.ok && (
        <div className="results-container visible">
          <div className="success-message">
            ✨ ¡Excelente! Se crearon{' '}
            <strong>{result.created_issues_count} issues</strong> en tu proyecto.
            {result.failed_issues.length > 0 && (
              <span style={{ opacity: 0.8 }}>
                {' '}({result.failed_issues.length} fallaron)
              </span>
            )}
          </div>

          <h3 style={{ fontSize: 20, marginBottom: 16 }}>Issues Creados</h3>

          {result.issue_keys.map((key, i) => (
            <div key={key} className="result-item" style={{ animationDelay: `${i * 0.1}s` }}>
              <h4>Issue creado: {key}</h4>
              <p>
                <a
                  href={`${result.jira_browse_url}${key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--purple)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Ver en Jira →
                </a>
              </p>
            </div>
          ))}

          {result.failed_issues.length > 0 && (
            <>
              <h3 style={{ fontSize: 16, marginBottom: 12, marginTop: 24, color: '#dc2626' }}>
                Issues que fallaron
              </h3>
              {result.failed_issues.map((summary, i) => (
                <div
                  key={i}
                  className="result-item"
                  style={{ borderLeftColor: '#dc2626', animationDelay: `${i * 0.1}s` }}
                >
                  <h4 style={{ color: '#dc2626' }}>✗ {summary}</h4>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </section>
  )
}
