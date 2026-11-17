import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import './index.css'

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Все')
  const [activeNav, setActiveNav] = useState('Overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])


   useEffect(() => {

  if (!user) return

  async function loadLeads() {
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, source, text, collected_at, status, author_name, author_username, author_url')
        .order('collected_at', { ascending: false })

      if (error) {
        throw error
      }

      const preparedLeads = data.map((item) => ({
        id: item.id,
        title: (item.text || '').slice(0, 65),
        text: item.text || '',
        source: item.source || '',
        date: item.collected_at
          ? new Date(item.collected_at).toLocaleDateString('en-GB')
          : '',
        score: 0,
        status: item.status || 'Новая',
        url: '#',
        authorName: item.author_name || '',
        authorUsername: item.author_username || '',
        authorUrl: item.author_url || '',
      }))

      setLeads(preparedLeads)
      console.log('Publications loaded:', preparedLeads.length)
    } catch (err) {
      console.error('Error loading publications:', err)
      setError('Failed to load publications from Supabase.')
    } finally {
      setLoading(false)
    }
  }

  loadLeads()
}, [user])

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        `${lead.title} ${lead.text} ${lead.source}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesFilter = filter === 'Все' || lead.status === filter

      return matchesSearch && matchesFilter
    })
  }, [leads, search, filter])

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', String(id))

      if (error) {
        throw error
      }

      setLeads((current) =>
        current.map((lead) =>
          lead.id === id ? { ...lead, status } : lead
        )
      )
    } catch (error) {
      console.error('Error saving status:', error)
      alert('Failed to save status to Supabase.')
    }
  }

  if (authLoading) {
    return <div className="empty-state">Checking authentication...</div>
  }

  if (!user) {
    return <Login />
  }

  const newCount = leads.filter((lead) => lead.status === 'Новая').length
  const activeCount = leads.filter((lead) => lead.status === 'В работе').length
  const successfulCount = leads.filter((lead) => lead.status === 'Успешно').length

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <div className="brand-name">SocialPulse</div>
            <div className="brand-caption">LEAD INTELLIGENCE</div>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {[
            { icon: '▦', label: 'Overview' },
            { icon: '◎', label: 'All Leads' },
            { icon: '◉', label: 'Sources' },
          ].map((item) => (
            <button
              key={item.label}
              className={`nav-item ${activeNav === item.label ? 'active' : ''}`}
              onClick={() => setActiveNav(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.label === 'All Leads' && (
                <span className="nav-count">{leads.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="connection-dot" />
          <div>
            <div className="connection-title">
              {error ? 'Disconnected' : 'System Online'}
            </div>
            <div className="connection-caption">API Connection</div>
          </div>
        </div>
      </aside>

<main className="main-content">
  <header className="topbar">
    <div className="breadcrumbs">
      Workspace <span>/</span> {activeNav}
    </div>

    <div className="profile">
      <div className="profile-avatar">SP</div>
      <div>
        <div className="profile-name">{user.email}</div>
        <div className="profile-role">SocialPulse User</div>
      </div>

      <button
        onClick={async () => {
          const { error } = await supabase.auth.signOut()
          if (error) alert('Failed to sign out.')
        }}
        style={{
          marginLeft: '16px',
          padding: '8px 14px',
          cursor: 'pointer',
          borderRadius: '8px',
          border: '1px solid #ddd',
          background: 'white',
        }}
      >
        Sign Out
      </button>
    </div>
  </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">DASHBOARD</div>
              <h1>{activeNav === 'Overview' ? 'Lead Overview' : activeNav}</h1>
              <p className="page-description">
                Discover business opportunities and manage leads in one place.
              </p>
            </div>
            <div className="date-chip">
              <span>◷</span> Latest Publications
            </div>
          </div>

          <div className="stats-grid">
            <StatCard
              label="Total Publications"
              value={leads.length}
              note="Collected from Telegram"
              icon="◎"
              tone="purple"
            />
            <StatCard
              label="New"
              value={newCount}
              note="Awaiting review"
              icon="✳"
              tone="blue"
            />
            <StatCard
              label="In Progress"
              value={activeCount}
              note="Active leads"
              icon="↗"
              tone="orange"
            />
            <StatCard
              label="Successful"
              value={successfulCount}
              note="Completed leads"
              icon="✦"
              tone="green"
            />
          </div>

          <section className="leads-panel">
            <div className="panel-heading">
              <div>
                <h2>Latest Publications</h2>
                <p>Data loaded from your publications database</p>
              </div>
              <span className="demo-badge">LIVE DATA</span>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <span>⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search publications..."
                />
                {search && (
                  <button
                    className="clear-search"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                className="filter-select"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option value="Все">All</option>
                <option value="Новая">New</option>
                <option value="В работе">In Progress</option>
                <option value="Успешно">Successful</option>
                <option value="Отклонена">Rejected</option>
              </select>
            </div>

            {loading && <div className="empty-state">Loading publications...</div>}

            {error && <div className="empty-state">{error}</div>}

            {!loading && !error && (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>PUBLICATION</th>
                      <th>SOURCE</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div className="lead-title">{lead.title}</div>
                          {lead.authorName && (
                          <div className="lead-author">
                            Author:{' '}
                            {lead.authorUrl ? (
                              <a href={lead.authorUrl} target="_blank" rel="noreferrer">
                                {lead.authorName}
                              </a>
                            ) : (
                              lead.authorName
                            )}
                          </div>
                        )}
                          <div className="lead-description">{lead.text}</div>
                        </td>

                        <td>
                          <span className="source-label">
                            <span className="telegram-mark">➤</span>
                            {lead.source}
                          </span>
                        </td>

                        <td className="date-cell">{lead.date}</td>

                        <td>
                          <select
                            className={`status-select status-${statusClass(lead.status)}`}
                            value={lead.status}
                            onChange={(event) =>
                              updateStatus(lead.id, event.target.value)
                            }
                          >
                            <option value="Новая">New</option>
                            <option value="В работе">In Progress</option>
                            <option value="Успешно">Successful</option>
                            <option value="Отклонена">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredLeads.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">⌕</div>
                    <h3>No results found</h3>
                    <p>Try changing your search query or filter.</p>
                    <button
                      className="reset-button"
                      onClick={() => {
                        setSearch('')
                        setFilter('Все')
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="table-footer">
              <span>
                Showing <strong>{filteredLeads.length}</strong> of{' '}
                <strong>{leads.length}</strong> publications
              </span>
              <span className="footer-note">Data from Python API</span>
            </div>
          </section>

          <footer className="page-footer">
            <span>© 2026 SocialPulse CRM</span>
            <span>Built to discover new opportunities</span>
          </footer>
        </section>
      </main>
    </div>
  )
}

function statusClass(status) {
  return {
    'Новая': 'new',
    'В работе': 'progress',
    'Успешно': 'success',
    'Отклонена': 'rejected',
  }[status]
}

function StatCard({ label, value, note, icon, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  )
}

export default App