import { useEffect, useMemo, useState } from 'react'
import './index.css'

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Все')
  const [activeNav, setActiveNav] = useState('Обзор')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadLeads() {
      try {
        const response = await fetch(`${API_URL}/api/leads`)

        if (!response.ok) {
          throw new Error('Не удалось получить публикации')
        }

        const data = await response.json()

        const preparedLeads = data.map((item) => ({
          id: item.id,
          title: item.text.slice(0, 65),
          text: item.text,
          source: item.source,
          date: new Date(item.collected_at).toLocaleDateString('ru-RU'),
          score: 0,
          status: 'Новая',
          url: '#',
        }))

        setLeads(preparedLeads)
      } catch (err) {
        setError('Не удалось подключиться к API. Проверь, запущен ли сервер.')
      } finally {
        setLoading(false)
      }
    }

    loadLeads()
  }, [])

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

  const updateStatus = (id, status) => {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === id ? { ...lead, status } : lead
      )
    )
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

        <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>

        <nav className="navigation">
          {[
            { icon: '▦', label: 'Обзор' },
            { icon: '◎', label: 'Все лиды' },
            { icon: '◉', label: 'Источники' },
          ].map((item) => (
            <button
              key={item.label}
              className={`nav-item ${activeNav === item.label ? 'active' : ''}`}
              onClick={() => setActiveNav(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.label === 'Все лиды' && (
                <span className="nav-count">{leads.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="connection-dot" />
          <div>
            <div className="connection-title">
              {error ? 'Нет подключения' : 'Система готова'}
            </div>
            <div className="connection-caption">Подключение к API</div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            Рабочее пространство <span>/</span> {activeNav}
          </div>
          <div className="profile">
            <div className="profile-avatar">SP</div>
            <div>
              <div className="profile-name">Мой проект</div>
              <div className="profile-role">Администратор</div>
            </div>
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">ПАНЕЛЬ УПРАВЛЕНИЯ</div>
              <h1>{activeNav === 'Обзор' ? 'Обзор лидов' : activeNav}</h1>
              <p className="page-description">
                Находите возможности для бизнеса и управляйте заявками в одном месте.
              </p>
            </div>
            <div className="date-chip">
              <span>◷</span> Последние публикации
            </div>
          </div>

          <div className="stats-grid">
            <StatCard
              label="Всего публикаций"
              value={leads.length}
              note="Загружено из Telegram"
              icon="◎"
              tone="purple"
            />
            <StatCard
              label="Новые"
              value={newCount}
              note="Ожидают рассмотрения"
              icon="✳"
              tone="blue"
            />
            <StatCard
              label="В работе"
              value={activeCount}
              note="Активные заявки"
              icon="↗"
              tone="orange"
            />
            <StatCard
              label="Успешно"
              value={successfulCount}
              note="Завершённые заявки"
              icon="✦"
              tone="green"
            />
          </div>

          <section className="leads-panel">
            <div className="panel-heading">
              <div>
                <h2>Последние публикации</h2>
                <p>Данные загружены из твоей базы публикаций</p>
              </div>
              <span className="demo-badge">LIVE DATA</span>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <span>⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск по публикациям..."
                />
                {search && (
                  <button
                    className="clear-search"
                    onClick={() => setSearch('')}
                    aria-label="Очистить поиск"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                className="filter-select"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Фильтр по статусу"
              >
                <option>Все</option>
                <option>Новая</option>
                <option>В работе</option>
                <option>Успешно</option>
                <option>Отклонена</option>
              </select>
            </div>

            {loading && <div className="empty-state">Загружаем публикации...</div>}

            {error && <div className="empty-state">{error}</div>}

            {!loading && !error && (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ПУБЛИКАЦИЯ</th>
                      <th>ИСТОЧНИК</th>
                      <th>ДАТА</th>
                      <th>СТАТУС</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div className="lead-title">{lead.title}</div>
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
                            <option>Новая</option>
                            <option>В работе</option>
                            <option>Успешно</option>
                            <option>Отклонена</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredLeads.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">⌕</div>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуй изменить поисковый запрос или фильтр.</p>
                    <button
                      className="reset-button"
                      onClick={() => {
                        setSearch('')
                        setFilter('Все')
                      }}
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="table-footer">
              <span>
                Показано <strong>{filteredLeads.length}</strong> из{' '}
                <strong>{leads.length}</strong> публикаций
              </span>
              <span className="footer-note">Данные из Python API</span>
            </div>
          </section>

          <footer className="page-footer">
            <span>© 2026 SocialPulse CRM</span>
            <span>Создано для поиска новых возможностей</span>
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