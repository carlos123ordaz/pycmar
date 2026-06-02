import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Shipment } from '../types'

const STATUS_MAP = {
  pending:    { label: 'Pendiente',   cls: 'badge-gray'   },
  preparing:  { label: 'Preparando',  cls: 'badge-ocean'  },
  in_transit: { label: 'En tránsito', cls: 'badge-orange' },
  delivered:  { label: 'Entregado',   cls: 'badge-green'  },
  cancelled:  { label: 'Cancelado',   cls: 'badge-red'    },
}

const FILTERS = [
  { key: 'all',        label: 'Todos'       },
  { key: 'pending',    label: 'Pendiente'   },
  { key: 'preparing',  label: 'Preparando'  },
  { key: 'in_transit', label: 'En tránsito' },
  { key: 'delivered',  label: 'Entregado'   },
  { key: 'cancelled',  label: 'Cancelado'   },
]

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d))
}

export default function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const navigate = useNavigate()

  const fetchShipments = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('shipments')
      .select('*, order:orders(payment_intent_id, amount, status)')
      .order('created_at', { ascending: false })
    setShipments(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchShipments() }, [fetchShipments])

  const filtered = filter === 'all' ? shipments : shipments.filter(s => s.status === filter)

  const inTransit   = shipments.filter(s => s.status === 'in_transit').length
  const delivered   = shipments.filter(s => s.status === 'delivered').length
  const pending     = shipments.filter(s => s.status === 'pending' || s.status === 'preparing').length

  return (
    <div>
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue"><IconShip /></div>
          <div className="stat-body">
            <div className="stat-value">{shipments.length}</div>
            <div className="stat-label">Total embarques</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow"><IconTruck /></div>
          <div className="stat-body">
            <div className="stat-value">{inTransit}</div>
            <div className="stat-label">En tránsito</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green"><IconCheck /></div>
          <div className="stat-body">
            <div className="stat-value">{delivered}</div>
            <div className="stat-label">Entregados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple"><IconClock /></div>
          <div className="stat-body">
            <div className="stat-value">{pending}</div>
            <div className="stat-label">En preparación</div>
          </div>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: 0 }}>
        <div>
          <h2>Logística y embarques</h2>
          <p style={{ fontSize: '.85rem', color: 'var(--gray)', marginTop: 4 }}>
            {filtered.length} embarque{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="filter-row">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`filter-tab${filter === f.key ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Link to="/shipments/new" className="btn btn-accent btn-sm">
            <IconPlus /> Nuevo embarque
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" />Cargando embarques…</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconShip /></div>
            <h3>Sin embarques</h3>
            <p>Crea un embarque desde un pedido o desde el botón "Nuevo embarque".</p>
            <Link to="/shipments/new" className="btn btn-accent" style={{ marginTop: 8 }}>
              <IconPlus /> Nuevo embarque
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Destino</th>
                <th>Transportista</th>
                <th>Temperatura</th>
                <th>Despacho</th>
                <th>Llegada est.</th>
                <th>Estado</th>
                <th>Pedido</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(shp => {
                const st = STATUS_MAP[shp.status as keyof typeof STATUS_MAP] ?? { label: shp.status, cls: 'badge-gray' }
                return (
                  <tr key={shp.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/shipments/${shp.id}`)}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'var(--gray)' }}>
                        {shp.id.slice(0, 8)}…
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--navy)' }}>
                        {shp.destination_country ?? '—'}
                      </div>
                      {shp.destination_city && (
                        <div style={{ fontSize: '.78rem', color: 'var(--gray)' }}>{shp.destination_city}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '.88rem' }}>
                      <div>{shp.carrier ?? '—'}</div>
                      {shp.tracking_number && (
                        <div style={{ fontSize: '.76rem', color: 'var(--gray)', fontFamily: 'monospace' }}>{shp.tracking_number}</div>
                      )}
                    </td>
                    <td>
                      {shp.temp_min != null && shp.temp_max != null ? (
                        <span style={{ fontSize: '.84rem', fontWeight: 600 }}>
                          {shp.temp_min}°C / {shp.temp_max}°C
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: '.84rem', whiteSpace: 'nowrap', color: 'var(--gray)' }}>{fmtDate(shp.dispatch_date)}</td>
                    <td style={{ fontSize: '.84rem', whiteSpace: 'nowrap', color: 'var(--gray)' }}>{fmtDate(shp.estimated_arrival)}</td>
                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                    <td>
                      {shp.order ? (
                        <span style={{ fontSize: '.78rem', fontFamily: 'monospace', color: 'var(--gray)' }}>
                          {(shp.order as { payment_intent_id?: string }).payment_intent_id?.slice(0, 10)}…
                        </span>
                      ) : '—'}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/shipments/${shp.id}`)}>
                        Ver
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function IconShip() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2.4 2.4 0 002 1 2.4 2.4 0 002-1 2.4 2.4 0 012-1 2.4 2.4 0 012 1 2.4 2.4 0 002 1 2.4 2.4 0 002-1 2.4 2.4 0 012-1 2.4 2.4 0 012 1"/><path d="M4 18l-1-5h18l-2 5"/><path d="M12 2v8"/><path d="M8 8h8"/></svg> }
function IconTruck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
function IconClock() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
function IconPlus() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
