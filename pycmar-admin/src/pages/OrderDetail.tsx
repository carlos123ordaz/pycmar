import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Order, Shipment } from '../types'

const STATUS_MAP = {
  paid:       { label: 'Pagado',      cls: 'badge-green'  },
  processing: { label: 'Procesando',  cls: 'badge-ocean'  },
  shipped:    { label: 'Despachado',  cls: 'badge-purple' },
  delivered:  { label: 'Entregado',   cls: 'badge-gray'   },
  cancelled:  { label: 'Cancelado',   cls: 'badge-red'    },
}

const ORDER_STATUSES = [
  { value: 'paid',       label: 'Pagado'      },
  { value: 'processing', label: 'Procesando'  },
  { value: 'shipped',    label: 'Despachado'  },
  { value: 'delivered',  label: 'Entregado'   },
  { value: 'cancelled',  label: 'Cancelado'   },
]

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [order, setOrder]     = useState<Order | null>(null)
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: ord } = await supabase.from('orders').select('*').eq('id', id).single()
      if (!ord) { navigate('/orders'); return }
      setOrder(ord)

      const { data: shp } = await supabase.from('shipments').select('*').eq('order_id', id).maybeSingle()
      setShipment(shp ?? null)
      setLoading(false)
    }
    load()
  }, [id, navigate])

  async function updateStatus(newStatus: string) {
    if (!order) return
    setSaving(true)
    const { error } = await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', order.id)
    setSaving(false)
    if (!error) {
      setOrder({ ...order, status: newStatus as Order['status'] })
      showToast('Estado actualizado.')
    } else {
      showToast('Error al actualizar.', 'error')
    }
  }

  if (loading) return <div className="loader"><div className="spinner" />Cargando pedido…</div>
  if (!order)  return null

  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = order.amount / 118 * 100
  const igv = order.amount / 118 * 18
  const st = STATUS_MAP[order.status as keyof typeof STATUS_MAP] ?? { label: order.status, cls: 'badge-gray' }

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span className="toast-icon">{toast.type === 'success' ? <IconCheck /> : <IconX />}</span>
            {toast.msg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')}>
            <IconBack /> Pedidos
          </button>
          <span style={{ color: 'var(--gray)' }}>/</span>
          <span style={{ fontFamily: 'monospace', fontSize: '.85rem', color: 'var(--gray)' }}>
            {order.payment_intent_id.slice(0, 20)}…
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge ${st.cls}`}>{st.label}</span>
          <select
            className="input"
            style={{ padding: '6px 10px', fontSize: '.84rem', width: 'auto' }}
            value={order.status}
            onChange={e => updateStatus(e.target.value)}
            disabled={saving}
          >
            {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Items */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--navy)' }}>
              Productos del pedido
            </h3>
            {items.length === 0 ? (
              <p style={{ color: 'var(--gray)', fontSize: '.9rem' }}>Sin detalle de items (pago directo).</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {items.map((item: { id?: string; name?: string; qty?: number; price?: number }, idx: number) => (
                    <div key={item.id ?? idx} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 0', borderBottom: '1px solid var(--border)',
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '.93rem' }}>{item.name ?? 'Producto'}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--gray)', marginTop: 2 }}>{item.qty ?? 0} kg × S/ {(item.price ?? 0).toFixed(2)}</div>
                      </div>
                      <div style={{ fontWeight: 800, color: 'var(--navy)' }}>
                        S/ {((item.price ?? 0) * (item.qty ?? 0)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', color: 'var(--gray)', marginBottom: 6 }}>
                    <span>Subtotal (sin IGV)</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.84rem', color: 'var(--gray)', marginBottom: 10 }}>
                    <span>IGV 18%</span>
                    <span>S/ {igv.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: 'var(--navy)', borderTop: '2px solid var(--navy)', paddingTop: 10 }}>
                    <span>Total</span>
                    <span>S/ {(order.amount / 100).toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Embarque vinculado */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>Embarque</h3>
              {!shipment && (
                <Link to={`/shipments/new?order_id=${order.id}`} className="btn btn-accent btn-sm">
                  <IconTruck /> Crear embarque
                </Link>
              )}
            </div>
            {shipment ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
                    {shipment.destination_city ? `${shipment.destination_city}, ${shipment.destination_country}` : shipment.destination_country ?? 'Sin destino'}
                  </div>
                  <div style={{ fontSize: '.84rem', color: 'var(--gray)' }}>
                    {shipment.carrier ?? 'Sin transportista'} {shipment.tracking_number ? `· ${shipment.tracking_number}` : ''}
                  </div>
                </div>
                <Link to={`/shipments/${shipment.id}`} className="btn btn-outline btn-sm">
                  Ver embarque
                </Link>
              </div>
            ) : (
              <p style={{ color: 'var(--gray)', fontSize: '.9rem' }}>
                Este pedido aún no tiene embarque creado. Crea uno para iniciar el seguimiento logístico.
              </p>
            )}
          </div>
        </div>

        {/* Right: Info del pedido */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            Información del pago
          </h3>

          <InfoRow label="Payment Intent" value={<span style={{ fontFamily: 'monospace', fontSize: '.78rem', wordBreak: 'break-all' }}>{order.payment_intent_id}</span>} />
          <InfoRow label="Fecha" value={fmtDate(order.created_at)} />
          <InfoRow label="Monto total" value={<strong>S/ {(order.amount / 100).toFixed(2)}</strong>} />
          <InfoRow label="Moneda" value={order.currency.toUpperCase()} />
          <InfoRow label="Email cliente" value={order.customer_email ?? '—'} />

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <a
              href={`https://dashboard.stripe.com/payments/${order.payment_intent_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <IconExternal /> Ver en Stripe Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--gray)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: '.9rem', color: 'var(--navy)' }}>{value}</div>
    </div>
  )
}

function IconBack() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
function IconX() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
function IconTruck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> }
function IconExternal() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> }
