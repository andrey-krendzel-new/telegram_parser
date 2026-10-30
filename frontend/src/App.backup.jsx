import { useMemo, useState } from 'react'
import './index.css'

const initialLeads = [
  {
    id: 1,
    title: 'Нужен Telegram-бот для магазина',
    text: 'Ищу разработчика для создания бота с каталогом товаров и уведомлениями.',
    source: 'Telegram',
    date: 'Сегодня',
    score: 95,
    status: 'Новая',
    url: 'https://t.me/',
  },
  {
    id: 2,
    title: 'Автоматизация отчётов на Python',
    text: 'Нужен скрипт для автоматического формирования еженедельных отчётов.',
    source: 'Telegram',
    date: 'Сегодня',
    score: 88,
    status: 'В работе',
    url: 'https://t.me/',
  },
  {
    id: 3,
    title: 'Разработка парсера',
    text: 'Ищу исполнителя для сбора и обработки информации с сайта.',
    source: 'Telegram',
    date: 'Вчера',
    score: 79,
    status: 'Новая',
    url: 'https://t.me/',
  },
  {
    id: 4,
    title: 'Интеграция с API',
    text: 'Требуется связать существующее приложение с внешним API.',
    source: 'Telegram',
    date: 'Вчера',
    score: 67,
    status: 'Успешно',
    url: 'https://t.me/',
  },
]

const navItems = [
  { icon: '▦', label: 'Обзор' },
  { icon: '◎', label: 'Все лиды' },
  { icon: '◉', label: 'Источники' },
]

function App() {
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Все')
  const [activeNav, setActiveNav] = useState('Обзор')

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
  const averageScore = Math.round(
    leads.reduce((sum, lead) => sum + lead.score, 0) / (leads.length || 1)
  )

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
          {navItems.map((item) => (
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
            <div className="connection-title">Система готова</div>
            <div className="connection-caption">Демонстрационный режим</div>
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
              label="Всего лидов"
              value={leads.length}
              note="В демонстрационных данных"
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
              label="Средний приоритет"
              value={`${averageScore}%`}
              note={`${successfulCount} успешно завершено`}
              icon="✦"
              tone="green"
            />
          </div>

          <section className="leads-panel">
            <div className="panel-heading">
              <div>
                <h2>Последние лиды</h2>
                <p>Потенциальные заказы, найденные системой</p>
              </div>
              <span className="demo-badge">DEMO DATA</span>
            </div>

            <div className="toolbar">
              <div className="search-box">
                <span>⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск по заявкам..."
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

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ЗАЯВКА</th>
                    <th>ИСТОЧНИК</th>
                    <th>ДАТА</th>
                    <th>ОЦЕНКА</th>
                    <th>СТАТУС</th>
                    <th></th>
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
                        <div className="score-cell">
                          <div className="score-track">
                            <div
                              className="score-fill"
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span>{lead.score}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`status-select status-${statusClass(lead.status)}`}
                          value={lead.status}
                          onChange={(event) =>
                            updateStatus(lead.id, event.target.value)
                          }
                          aria-label={`Статус заявки: ${lead.title}`}
                        >
                          <option>Новая</option>
                          <option>В работе</option>
                          <option>Успешно</option>
                          <option>Отклонена</option>
                        </select>
                      </td>
                      <td>
                        <a
                          className="open-link"
                          href={lead.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Открыть источник: ${lead.title}`}
                        >
                          ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLeads.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">⌕</div>
                  <h3>Ничего не найдено</h3>
                  <p>Попробуйте изменить поисковый запрос или фильтр.</p>
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

            <div className="table-footer">
              <span>
                Показано <strong>{filteredLeads.length}</strong> из{' '}
                <strong>{leads.length}</strong> лидов
              </span>
              <span className="footer-note">
                Данные пока демонстрационные
              </span>
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