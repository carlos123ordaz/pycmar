import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Shipment, ShipmentEvent, ShipmentDocument, EventType, DocType } from '../types'

const STATUS_MAP = {
  pending:    { label: 'Pendiente',   cls: 'badge-gray',   next: 'preparing'  },
  preparing:  { label: 'Preparando',  cls: 'badge-ocean',  next: 'in_transit' },
  in_transit: { label: 'En tránsito', cls: 'badge-orange', next: 'delivered'  },
  delivered:  { label: 'Entregado',   cls: 'badge-green',  next: null         },
  cancelled:  { label: 'Cancelado',   cls: 'badge-red',    next: null         },
}

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'Pendiente'   },
  { value: 'preparing',  label: 'Preparando'  },
  { value: 'in_transit', label: 'En tránsito' },
  { value: 'delivered',  label: 'Entregado'   },
  { value: 'cancelled',  label: 'Cancelado'   },
]

const EVENT_ICONS: Record<EventType, React.ReactNode> = {
  created:         <IconPlus />,
  status_change:   <IconRefresh />,
  temperature_log: <IconThermo />,
  document_added:  <IconDoc />,
  location_update: <IconPin />,
  note:            <IconNote />,
}

const EVENT_LABELS: Record<EventType, string> = {
  created:         'Creado',
  status_change:   'Cambio de estado',
  temperature_log: 'Temperatura',
  document_added:  'Documento',
  location_update: 'Ubicación',
  note:            'Nota',
}

const DOC_LABELS: Record<DocType, string> = {
  guia_remision: 'Guía de Remisión',
  packing_list:  'Packing List',
  cert_origen:   'Certificado de Origen',
  factura:       'Factura Comercial',
  sanitario:     'Cert. Sanitario',
  otro:          'Otro',
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d))
}
function fmtDateTime(d: string) {
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
}

export default function ShipmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [shipment, setShipment]   = useState<Shipment | null>(null)
  const [events, setEvents]       = useState<ShipmentEvent[]>([])
  const [docs, setDocs]           = useState<ShipmentDocument[]>([])
  const [loading, setLoading]     = useState(true)
  const [savingSt, setSavingSt]   = useState(false)
  const [toast, setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Event form
  const [showEvtForm, setShowEvtForm] = useState(false)
  const [evtForm, setEvtForm] = useState({ event_type: 'note' as EventType, description: '', location: '', temperature: '' })
  const [savingEvt, setSavingEvt] = useState(false)

  // Document form
  const [showDocForm, setShowDocForm] = useState(false)
  const [docForm, setDocForm] = useState({ doc_type: 'packing_list' as DocType, name: '', file_url: '', notes: '', issued_at: '' })
  const [savingDoc, setSavingDoc] = useState(false)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadAll = useCallback(async () => {
    if (!id) return
    setLoading(true)
    const [{ data: shp }, { data: evts }, { data: dcs }] = await Promise.all([
      supabase.from('shipments').select('*, order:orders(id, payment_intent_id, amount, status, customer_email, items)').eq('id', id).single(),
      supabase.from('shipment_events').select('*').eq('shipment_id', id).order('created_at', { ascending: false }),
      supabase.from('shipment_documents').select('*').eq('shipment_id', id).order('created_at', { ascending: false }),
    ])
    if (!shp) { navigate('/shipments'); return }
    setShipment(shp)
    setEvents(evts ?? [])
    setDocs(dcs ?? [])
    setLoading(false)
  }, [id, navigate])

  useEffect(() => { loadAll() }, [loadAll])

  async function updateStatus(newStatus: string) {
    if (!shipment) return
    setSavingSt(true)
    const { error } = await supabase.from('shipments').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', shipment.id)
    if (!error) {
      await supabase.from('shipment_events').insert({
        shipment_id: shipment.id,
        event_type: 'status_change',
        description: `Estado cambiado a: ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label ?? newStatus}`,
      })
      setShipment({ ...shipment, status: newStatus as Shipment['status'] })
      setEvents(prev => [{ id: crypto.randomUUID(), shipment_id: shipment.id, event_type: 'status_change', description: `Estado cambiado a: ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label ?? newStatus}`, location: null, temperature: null, created_at: new Date().toISOString() }, ...prev])
      showToast('Estado actualizado.')
    } else {
      showToast('Error al actualizar.', 'error')
    }
    setSavingSt(false)
  }

  async function addEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!shipment || !evtForm.description.trim()) return
    setSavingEvt(true)
    const payload = {
      shipment_id:  shipment.id,
      event_type:   evtForm.event_type,
      description:  evtForm.description.trim(),
      location:     evtForm.location.trim() || null,
      temperature:  evtForm.temperature ? Number(evtForm.temperature) : null,
    }
    const { data, error } = await supabase.from('shipment_events').insert(payload).select().single()
    setSavingEvt(false)
    if (!error && data) {
      setEvents(prev => [data, ...prev])
      setEvtForm({ event_type: 'note', description: '', location: '', temperature: '' })
      setShowEvtForm(false)
      showToast('Evento registrado.')
    } else {
      showToast('Error al guardar evento.', 'error')
    }
  }

  async function addDoc(e: React.FormEvent) {
    e.preventDefault()
    if (!shipment || !docForm.name.trim()) return
    setSavingDoc(true)
    const payload = {
      shipment_id:  shipment.id,
      doc_type:     docForm.doc_type,
      name:         docForm.name.trim(),
      file_url:     docForm.file_url.trim() || null,
      notes:        docForm.notes.trim() || null,
      issued_at:    docForm.issued_at || null,
    }
    const { data, error } = await supabase.from('shipment_documents').insert(payload).select().single()
    setSavingDoc(false)
    if (!error && data) {
      setDocs(prev => [data, ...prev])
      await supabase.from('shipment_events').insert({ shipment_id: shipment.id, event_type: 'document_added', description: `Documento agregado: ${DOC_LABELS[docForm.doc_type]} — ${docForm.name.trim()}` })
      setEvents(prev => [{ id: crypto.randomUUID(), shipment_id: shipment.id, event_type: 'document_added', description: `Documento agregado: ${DOC_LABELS[docForm.doc_type]} — ${docForm.name.trim()}`, location: null, temperature: null, created_at: new Date().toISOString() }, ...prev])
      setDocForm({ doc_type: 'packing_list', name: '', file_url: '', notes: '', issued_at: '' })
      setShowDocForm(false)
      showToast('Documento registrado.')
    } else {
      showToast('Error al guardar documento.', 'error')
    }
  }

  async function deleteDoc(docId: string) {
    if (!confirm('¿Eliminar este documento?')) return
    const { error } = await supabase.from('shipment_documents').delete().eq('id', docId)
    if (!error) {
      setDocs(prev => prev.filter(d => d.id !== docId))
      showToast('Documento eliminado.')
    }
  }

  if (loading) return <div className="loader"><div className="spinner" />Cargando embarque…</div>
  if (!shipment) return null

  const st = STATUS_MAP[shipment.status as keyof typeof STATUS_MAP] ?? { label: shipment.status, cls: 'badge-gray', next: null }
  const order = shipment.order as (Shipment['order'] & { payment_intent_id?: string; amount?: number; customer_email?: string }) | null

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
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/shipments')}>
            <IconBack /> Logística
          </button>
          <span style={{ color: 'var(--gray)' }}>/</span>
          <span style={{ fontFamily: 'monospace', fontSize: '.82rem', color: 'var(--gray)' }}>{shipment.id.slice(0, 8)}…</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge ${st.cls}`}>{st.label}</span>
          <select className="input" style={{ padding: '6px 10px', fontSize: '.84rem', width: 'auto' }} value={shipment.status} onChange={e => updateStatus(e.target.value)} disabled={savingSt}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Link to={`/shipments/${shipment.id}/edit`} className="btn btn-outline btn-sm"><IconEdit /> Editar</Link>
        </div>
      </div>

      {/* Info cards */}
      <div className="stats-row" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue"><IconPin /></div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: '1rem' }}>{shipment.destination_country ?? '—'}</div>
            <div className="stat-label">{shipment.destination_city ?? 'Sin ciudad'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple"><IconTruck /></div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: '1rem' }}>{shipment.carrier ?? '—'}</div>
            <div className="stat-label" style={{ fontFamily: shipment.tracking_number ? 'monospace' : 'inherit', fontSize: shipment.tracking_number ? '.75rem' : '.8rem' }}>{shipment.tracking_number ?? 'Sin tracking'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green"><IconThermo /></div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: '1rem' }}>
              {shipment.temp_min != null ? `${shipment.temp_min}°C` : '—'} / {shipment.temp_max != null ? `${shipment.temp_max}°C` : '—'}
            </div>
            <div className="stat-label">Cadena de frío</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow"><IconCal /></div>
          <div className="stat-body">
            <div className="stat-value" style={{ fontSize: '.92rem' }}>{fmtDate(shipment.dispatch_date)}</div>
            <div className="stat-label">Despacho · Est. {fmtDate(shipment.estimated_arrival)}</div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Left: pedido + notas + timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Pedido */}
          {order && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>Pedido vinculado</h3>
                <Link to={`/orders/${shipment.order_id}`} className="btn btn-outline btn-sm">Ver pedido</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--gray)', marginBottom: 3 }}>Payment Intent</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '.8rem', color: 'var(--navy)' }}>{order.payment_intent_id?.slice(0, 22)}…</div>
                </div>
                <div>
                  <div style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--gray)', marginBottom: 3 }}>Monto</div>
                  <div style={{ fontWeight: 800, color: 'var(--navy)' }}>S/ {((order.amount ?? 0) / 100).toFixed(2)}</div>
                </div>
                {order.customer_email && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--gray)', marginBottom: 3 }}>Cliente</div>
                    <a href={`mailto:${order.customer_email}`} style={{ color: 'var(--ocean)', fontWeight: 600, fontSize: '.88rem' }}>{order.customer_email}</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notas */}
          {shipment.notes && (
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>Notas internas</h3>
              <p style={{ fontSize: '.9rem', color: 'var(--gray)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{shipment.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>
                Timeline de eventos <span style={{ color: 'var(--gray)', fontWeight: 400, fontSize: '.85rem' }}>({events.length})</span>
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowEvtForm(v => !v)}>
                <IconPlus /> Agregar evento
              </button>
            </div>

            {showEvtForm && (
              <form onSubmit={addEvent} style={{ background: 'var(--mist)', borderRadius: 10, padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipo de evento</label>
                    <select className="input" value={evtForm.event_type} onChange={e => setEvtForm(f => ({ ...f, event_type: e.target.value as EventType }))}>
                      <option value="note">Nota</option>
                      <option value="location_update">Actualización de ubicación</option>
                      <option value="temperature_log">Registro de temperatura</option>
                      <option value="status_change">Cambio de estado</option>
                    </select>
                  </div>
                  {evtForm.event_type === 'temperature_log' && (
                    <div className="form-group">
                      <label className="form-label">Temperatura (°C)</label>
                      <input className="input" type="number" step="0.1" placeholder="-18" value={evtForm.temperature} onChange={e => setEvtForm(f => ({ ...f, temperature: e.target.value }))} />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción *</label>
                  <input className="input" required placeholder="Describe el evento…" value={evtForm.description} onChange={e => setEvtForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ubicación (opcional)</label>
                  <input className="input" placeholder="Ej: Puerto del Callao" value={evtForm.location} onChange={e => setEvtForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowEvtForm(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-accent btn-sm" disabled={savingEvt}>
                    {savingEvt ? 'Guardando…' : 'Registrar'}
                  </button>
                </div>
              </form>
            )}

            {events.length === 0 ? (
              <p style={{ color: 'var(--gray)', fontSize: '.9rem' }}>Sin eventos registrados aún.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {events.map((evt, idx) => (
                  <div key={evt.id} style={{ display: 'flex', gap: 14, paddingBottom: 16, position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--mist)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ocean)', flexShrink: 0 }}>
                        {EVENT_ICONS[evt.event_type] ?? <IconNote />}
                      </div>
                      {idx < events.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 6 }} />
                      )}
                    </div>
                    <div style={{ paddingTop: 4, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--ocean)' }}>
                          {EVENT_LABELS[evt.event_type] ?? evt.event_type}
                        </span>
                        <span style={{ fontSize: '.76rem', color: 'var(--gray)' }}>{fmtDateTime(evt.created_at)}</span>
                      </div>
                      <p style={{ fontSize: '.88rem', color: 'var(--navy)', margin: 0 }}>{evt.description}</p>
                      {evt.location && <p style={{ fontSize: '.8rem', color: 'var(--gray)', marginTop: 3 }}>📍 {evt.location}</p>}
                      {evt.temperature != null && <p style={{ fontSize: '.8rem', color: 'var(--ocean)', fontWeight: 700, marginTop: 3 }}>🌡 {evt.temperature}°C</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: documentos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>
                Documentos <span style={{ color: 'var(--gray)', fontWeight: 400, fontSize: '.85rem' }}>({docs.length})</span>
              </h3>
              <button className="btn btn-outline btn-sm" onClick={() => setShowDocForm(v => !v)}>
                <IconPlus /> Agregar
              </button>
            </div>

            {showDocForm && (
              <form onSubmit={addDoc} style={{ background: 'var(--mist)', borderRadius: 10, padding: 14, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Tipo de documento</label>
                  <select className="input" value={docForm.doc_type} onChange={e => setDocForm(f => ({ ...f, doc_type: e.target.value as DocType }))}>
                    {(Object.entries(DOC_LABELS) as [DocType, string][]).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre del documento *</label>
                  <input className="input" required placeholder="Ej: Guía de Remisión 001-00234" value={docForm.name} onChange={e => setDocForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">URL del archivo (opcional)</label>
                  <input className="input" type="url" placeholder="https://drive.google.com/…" value={docForm.file_url} onChange={e => setDocForm(f => ({ ...f, file_url: e.target.value }))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fecha de emisión</label>
                    <input className="input" type="date" value={docForm.issued_at} onChange={e => setDocForm(f => ({ ...f, issued_at: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notas</label>
                  <input className="input" placeholder="Observaciones…" value={docForm.notes} onChange={e => setDocForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowDocForm(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-accent btn-sm" disabled={savingDoc}>
                    {savingDoc ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </form>
            )}

            {docs.length === 0 ? (
              <p style={{ fontSize: '.9rem', color: 'var(--gray)' }}>Sin documentos adjuntos.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {docs.map(doc => (
                  <div key={doc.id} style={{ background: 'var(--mist)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--ocean)', marginBottom: 3 }}>
                          {DOC_LABELS[doc.doc_type as DocType] ?? doc.doc_type}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--navy)', wordBreak: 'break-word' }}>{doc.name}</div>
                        {doc.issued_at && <div style={{ fontSize: '.76rem', color: 'var(--gray)', marginTop: 3 }}>Emitido: {fmtDate(doc.issued_at)}</div>}
                        {doc.notes && <div style={{ fontSize: '.8rem', color: 'var(--gray)', marginTop: 4 }}>{doc.notes}</div>}
                        {doc.file_url && (
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: 8, fontSize: '.8rem' }}>
                            <IconExternal /> Ver archivo
                          </a>
                        )}
                      </div>
                      <button onClick={() => deleteDoc(doc.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', flexShrink: 0 }} title="Eliminar">
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Llegada real */}
          {shipment.status === 'delivered' && (
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>Fecha de llegada real</h3>
              <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.05rem' }}>{fmtDate(shipment.actual_arrival)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function IconBack()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> }
function IconEdit()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> }
function IconCheck()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
function IconX()       { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
function IconPlus()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function IconTruck()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> }
function IconPin()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function IconThermo()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/></svg> }
function IconDoc()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function IconNote()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> }
function IconRefresh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg> }
function IconCal()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function IconExternal(){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> }
function IconTrash()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg> }
