import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Shipment, Order } from '../types'

const INITIAL: Partial<Shipment> = {
  status: 'pending',
  destination_country: '',
  destination_city: '',
  carrier: '',
  tracking_number: '',
  temp_min: -18,
  temp_max: -15,
  dispatch_date: null,
  estimated_arrival: null,
  notes: '',
}

export default function ShipmentForm() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm]     = useState<Partial<Shipment>>(INITIAL)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving]  = useState(false)
  const [error, setError]    = useState<string | null>(null)

  useEffect(() => {
    // Load available orders (not yet linked to a shipment)
    async function loadOrders() {
      const { data: linked } = await supabase.from('shipments').select('order_id').not('order_id', 'is', null)
      const linkedIds = (linked ?? []).map((s: { order_id: string }) => s.order_id).filter(Boolean)

      let q = supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (linkedIds.length > 0 && !isEdit) {
        q = q.not('id', 'in', `(${linkedIds.join(',')})`)
      }
      const { data } = await q
      setOrders(data ?? [])
    }

    async function loadShipment() {
      if (!id) return
      const { data } = await supabase.from('shipments').select('*').eq('id', id).single()
      if (data) setForm(data)
      setLoading(false)
    }

    loadOrders()
    if (isEdit) loadShipment()
    else {
      const orderId = searchParams.get('order_id')
      if (orderId) setForm(f => ({ ...f, order_id: orderId }))
    }
  }, [id, isEdit, searchParams])

  function set(field: keyof Shipment, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      order_id:            form.order_id || null,
      status:              form.status ?? 'pending',
      destination_country: form.destination_country || null,
      destination_city:    form.destination_city || null,
      carrier:             form.carrier || null,
      tracking_number:     form.tracking_number || null,
      temp_min:            form.temp_min != null ? Number(form.temp_min) : null,
      temp_max:            form.temp_max != null ? Number(form.temp_max) : null,
      dispatch_date:       form.dispatch_date || null,
      estimated_arrival:   form.estimated_arrival || null,
      notes:               form.notes || null,
      updated_at:          new Date().toISOString(),
    }

    let result
    if (isEdit) {
      result = await supabase.from('shipments').update(payload).eq('id', id).select().single()
    } else {
      result = await supabase.from('shipments').insert(payload).select().single()
    }

    setSaving(false)
    if (result.error) {
      setError(result.error.message)
    } else {
      // Auto-create "created" event if new shipment
      if (!isEdit && result.data) {
        await supabase.from('shipment_events').insert({
          shipment_id: result.data.id,
          event_type: 'created',
          description: `Embarque creado con destino ${payload.destination_country ?? 'sin especificar'}.`,
        })
      }
      navigate(`/shipments/${result.data?.id ?? ''}`)
    }
  }

  if (loading) return <div className="loader"><div className="spinner" />Cargando…</div>

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/shipments')}>
            <IconBack /> Logística
          </button>
          <span style={{ color: 'var(--gray)' }}>/</span>
          <span style={{ fontWeight: 700, color: 'var(--navy)' }}>
            {isEdit ? 'Editar embarque' : 'Nuevo embarque'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Pedido vinculado */}
        <div className="card">
          <h3 className="form-section-title">Pedido vinculado</h3>
          <div className="form-group">
            <label className="form-label">Pedido (opcional)</label>
            <select className="input" value={form.order_id ?? ''} onChange={e => set('order_id', e.target.value || null)}>
              <option value="">— Sin pedido vinculado —</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.payment_intent_id ? o.payment_intent_id.slice(0, 20) + '…' : o.id.slice(0, 8)} · S/ {(o.amount / 100).toFixed(2)} · {o.customer_email ?? 'sin email'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Destino */}
        <div className="card">
          <h3 className="form-section-title">Destino</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">País de destino</label>
              <input className="input" placeholder="Ej: China" value={form.destination_country ?? ''} onChange={e => set('destination_country', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ciudad de destino</label>
              <input className="input" placeholder="Ej: Guangzhou" value={form.destination_city ?? ''} onChange={e => set('destination_city', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Transporte */}
        <div className="card">
          <h3 className="form-section-title">Transporte</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Transportista / Naviera</label>
              <input className="input" placeholder="Ej: Maersk, DHL, Ransa" value={form.carrier ?? ''} onChange={e => set('carrier', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">N° de tracking / BL</label>
              <input className="input" placeholder="Ej: MAEU1234567" value={form.tracking_number ?? ''} onChange={e => set('tracking_number', e.target.value)} />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: 12 }}>
            <div className="form-group">
              <label className="form-label">Fecha de despacho</label>
              <input className="input" type="date" value={form.dispatch_date ?? ''} onChange={e => set('dispatch_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Llegada estimada</label>
              <input className="input" type="date" value={form.estimated_arrival ?? ''} onChange={e => set('estimated_arrival', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Cadena de frío */}
        <div className="card">
          <h3 className="form-section-title">Cadena de frío</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Temperatura mínima (°C)</label>
              <input className="input" type="number" step="0.1" placeholder="-18" value={form.temp_min ?? ''} onChange={e => set('temp_min', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Temperatura máxima (°C)</label>
              <input className="input" type="number" step="0.1" placeholder="-15" value={form.temp_max ?? ''} onChange={e => set('temp_max', e.target.value)} />
            </div>
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--gray)', marginTop: 8 }}>
            Rango estándar para mariscos congelados: −18 °C a −15 °C. Para fresco: 0 °C a 4 °C.
          </p>
        </div>

        {/* Estado y notas */}
        <div className="card">
          <h3 className="form-section-title">Estado y notas</h3>
          <div className="form-group">
            <label className="form-label">Estado del embarque</label>
            <select className="input" value={form.status ?? 'pending'} onChange={e => set('status', e.target.value)}>
              <option value="pending">Pendiente</option>
              <option value="preparing">Preparando</option>
              <option value="in_transit">En tránsito</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Notas internas</label>
            <textarea className="input" rows={3} placeholder="Observaciones, instrucciones especiales…" value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', color: '#ef4444', fontSize: '.88rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/shipments')}>Cancelar</button>
          <button type="submit" className="btn btn-accent" disabled={saving}>
            {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Guardando…</> : isEdit ? 'Guardar cambios' : 'Crear embarque'}
          </button>
        </div>
      </form>
    </div>
  )
}

function IconBack() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> }
