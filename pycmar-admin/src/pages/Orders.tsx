import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Order } from '../types'

const STATUS_MAP = {
  paid:       { label: 'Pagado',      cls: 'badge-green'  },
  processing: { label: 'Procesando',  cls: 'badge-ocean'  },
  shipped:    { label: 'Despachado',  cls: 'badge-purple' },
  delivered:  { label: 'Entregado',   cls: 'badge-gray'   },
  cancelled:  { label: 'Cancelado',   cls: 'badge-red'    },
}

const FILTERS = [
  { key: 'all',        label: 'Todos'       },
  { key: 'paid',       label: 'Pagado'      },
  { key: 'processing', label: 'Procesando'  },
  { key: 'shipped',    label: 'Despachado'  },
  { key: 'delivered',  label: 'Entregado'   },
  { key: 'cancelled',  label: 'Cancelado'   },
]

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
}
function fmtSoles(centimos: number) {
  return `S/ ${(centimos / 100).toFixed(2)}`
}
function shortPi(pi: string) {
  return pi.replace('pi_', '').slice(0, 12) + '…'
}

export default function Orders() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const navigate = useNavigate()

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const totalSoles = orders.reduce((s, o) => s + o.amount, 0)
  const paidCount  = orders.filter(o => o.status === 'paid').length
  const inTransit  = orders.filter(o => o.status === 'shipped').length

  return (
    <div>
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue"><IconOrders /></div>
          <div className="stat-body">
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">Total pedidos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green"><IconMoney /></div>
          <div className="stat-body">
            <div className="stat-value">{fmtSoles(totalSoles)}</div>
            <div className="stat-label">Monto total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow"><IconClock /></div>
          <div className="stat-body">
            <div className="stat-value">{paidCount}</div>
            <div className="stat-label">Pagados sin despachar</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple"><IconTruck /></div>
          <div className="stat-body">
            <div className="stat-value">{inTransit}</div>
            <div className="stat-label">En tránsito</div>
          </div>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: 0 }}>
        <div>
          <h2>Pedidos</h2>
          <p style={{ fontSize: '.85rem', color: 'var(--gray)', marginTop: 4 }}>
            {filtered.length} pedido{filtered.length !== 1 ? 's' : ''}{filter !== 'all' ? ` · filtro: ${FILTERS.find(f => f.key === filter)?.label}` : ''}
          </p>
        </div>
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
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" />Cargando pedidos…</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconOrders /></div>
            <h3>Sin pedidos</h3>
            <p>Los pedidos se crean automáticamente cuando un cliente completa un pago con Stripe.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>N° Pedido</th>
                <th>Fecha</th>
                <th>Items</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Email cliente</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const st = STATUS_MAP[order.status as keyof typeof STATUS_MAP] ?? { label: order.status, cls: 'badge-gray' }
                const items = Array.isArray(order.items) ? order.items : []
                return (
                  <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${order.id}`)}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: '.82rem', fontWeight: 700, color: 'var(--navy)' }}>
                        {shortPi(order.payment_intent_id)}
                      </div>
                    </td>
                    <td style={{ fontSize: '.82rem', color: 'var(--gray)', whiteSpace: 'nowrap' }}>
                      {fmtDate(order.created_at)}
                    </td>
                    <td>
                      <span style={{ fontSize: '.84rem', color: 'var(--gray)' }}>
                        {items.length > 0
                          ? items.map((i: { name?: string; qty?: number }) => `${i.qty ?? '?'}kg ${i.name ?? '?'}`).join(', ').slice(0, 50) + (items.join(', ').length > 50 ? '…' : '')
                          : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--navy)' }}>{fmtSoles(order.amount)}</span>
                    </td>
                    <td>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </td>
                    <td style={{ color: 'var(--gray)', fontSize: '.84rem' }}>
                      {order.customer_email ?? '—'}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/orders/${order.id}`)}>
                        Ver detalle
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

function IconOrders() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
}
function IconMoney() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
}
function IconClock() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function IconTruck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
}
