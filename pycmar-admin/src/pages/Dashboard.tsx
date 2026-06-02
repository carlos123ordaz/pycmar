import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import StatCard from '../components/StatCard'
import type { ContactRequest } from '../types'

interface Stats {
  totalProducts: number
  activeProducts: number
  categories: number
  pendingContacts: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, activeProducts: 0, categories: 0, pendingContacts: 0 })
  const [recentContacts, setRecentContacts] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [
        { count: totalProducts },
        { count: activeProducts },
        { count: categories },
        { count: pendingContacts },
        { data: contacts },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('contact_requests').select('*', { count: 'exact', head: true }).eq('leido', false),
        supabase
          .from('contact_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      setStats({
        totalProducts: totalProducts ?? 0,
        activeProducts: activeProducts ?? 0,
        categories: categories ?? 0,
        pendingContacts: pendingContacts ?? 0,
      })
      setRecentContacts(contacts ?? [])
      setLoading(false)
    }
    fetchData()
  }, [])

  function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" />
        Cargando dashboard...
      </div>
    )
  }

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total de productos"
          value={stats.totalProducts}
          icon={<IconBox />}
          iconColor="navy"
        />
        <StatCard
          label="Productos activos"
          value={stats.activeProducts}
          icon={<IconCheck />}
          iconColor="accent"
          badge="Activos"
          badgeType="up"
        />
        <StatCard
          label="Categorías"
          value={stats.categories}
          icon={<IconGrid />}
          iconColor="ocean"
        />
        <StatCard
          label="Contactos pendientes"
          value={stats.pendingContacts}
          icon={<IconMail />}
          iconColor="warning"
          badge={stats.pendingContacts > 0 ? `${stats.pendingContacts} nuevos` : undefined}
          badgeType="pending"
        />
      </div>

      {/* Recent contacts */}
      <div className="card">
        <div className="card-header">
          <h2>Contactos recientes</h2>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/contacts')}>
            Ver todos
          </button>
        </div>
        {recentContacts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconMail /></div>
            <h3>Sin contactos aún</h3>
            <p>Los formularios de contacto aparecerán aquí.</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ borderRadius: '0 0 var(--radius) var(--radius)', border: 'none', borderTop: '1px solid var(--line)' }}>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Empresa</th>
                  <th>País</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                    <td style={{ color: 'var(--gray)' }}>{c.email}</td>
                    <td>{c.empresa ?? '—'}</td>
                    <td>{c.pais ?? '—'}</td>
                    <td>
                      <span className={`badge ${c.leido ? 'badge-gray' : 'badge-orange'}`}>
                        {c.leido ? 'Leído' : 'Pendiente'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--gray)', fontSize: '.8rem', whiteSpace: 'nowrap' }}>{formatDate(c.created_at)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/contacts')}>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  )
}

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}
