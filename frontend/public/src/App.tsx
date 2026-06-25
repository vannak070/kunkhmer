import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

type Fighter = {
  id: string
  name: string
  nameKhmer?: string
  clubName?: string
}

export default function App() {
  const [fighters, setFighters] = useState<Fighter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/fighters`)
      .then((res) => res.json())
      .then((body) => {
        if (body.success) {
          setFighters(body.data ?? [])
        } else {
          setError(body.error ?? 'Failed to load fighters')
        }
      })
      .catch(() => setError('Could not reach the API'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <header className="header">
        <p className="eyebrow">Kun Khmer Federation</p>
        <h1>Public Website</h1>
        <p className="subtitle">
          Fan-facing site scaffold. Build events, rankings, and profiles here.
        </p>
      </header>

      <main className="main">
        <section className="card">
          <h2>Fighters</h2>
          {loading && <p>Loading…</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && fighters.length === 0 && (
            <p>No fighters in the database yet.</p>
          )}
          {!loading && !error && fighters.length > 0 && (
            <ul className="list">
              {fighters.map((fighter) => (
                <li key={fighter.id}>
                  <strong>{fighter.name}</strong>
                  {fighter.nameKhmer && <span> — {fighter.nameKhmer}</span>}
                  {fighter.clubName && (
                    <span className="muted"> · {fighter.clubName}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
