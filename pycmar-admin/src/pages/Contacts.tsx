import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ContactRequest } from '../types'

export default function Contacts() {
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending'>('pending')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter === 'pending') {
      query = query.eq('leido', false)
    }

    const { data } = await query
    setContacts(data ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  async function markAsRead(contact: ContactRequest) {
    const { error } = await supabase
      .from('contact_requests')
      .update({ leido: true })
      .eq('id', contact.id)

    if (!error) {
      setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, leido: true } : c))
      showToast('Marcado como leído.')
    } else {
      showToast('Error al actualizar.', 'error')
    }
  }

  async function markAsUnread(contact: ContactRequest) {
    const { error } = await supabase
      .from('contact_requests')
      .update({ leido: false })
      .eq('id', contact.id)

    if (!error) {
      setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, leido: false } : c))
      showToast('Marcado como pendiente.')
    } else {
      showToast('Error al actualizar.', 'error')
    }
  }

  function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  const pendingCount = contacts.filter(c => !c.leido).length

  return (
    <div>
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? <IconCheck /> : <IconX />}
            </span>
            {toast.msg}
          </div>
        </div>
      )}

      <div className="section-header">
        <div>
          <h2>Solicitudes de contacto</h2>
          <p style={{ fontSize: '.85rem', color: 'var(--gray)', marginTop: 4 }}>
            {filter === 'pending'
              ? `${contacts.length} pendiente${contacts.length !== 1 ? 's' : ''}`
              : `${contacts.length} total${contacts.length !== 1 ? 'es' : ''} · ${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="filter-row">
          <button
            className={`filter-tab${filter === 'pending' ? ' active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pendientes
          </button>
          <button
            className={`filter-tab${filter === 'all' ? ' active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" />Cargando contactos...</div>
      ) : contacts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconMail /></div>
            <h3>{filter === 'pending' ? 'Sin pendientes' : 'Sin solicitudes'}</h3>
            <p>{filter === 'pending' ? 'Todos los contactos han sido revisados.' : 'Aún no hay solicitudes de contacto.'}</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Empresa</th>
                <th>País</th>
                <th>Tipo cliente</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <>
                  <tr key={contact.id} style={{ background: !contact.leido ? 'rgba(245,158,11,.04)' : undefined }}>
                    <td>
                      <button
                        className={`expand-btn${expandedId === contact.id ? ' open' : ''}`}
                        onClick={() => setExpandedId(expandedId === contact.id ? null : contact.id)}
                        title={expandedId === contact.id ? 'Cerrar' : 'Ver mensaje'}
                      >
                        <IconChevron />
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {!contact.leido && (
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)', flexShrink: 0, display: 'inline-block' }} />
                        )}
                        {contact.nombre}
                      </div>
                    </td>
                    <td>
                      <a
                        href={`mailto:${contact.email}`}
                        style={{ color: 'var(--ocean)', fontWeight: 600, fontSize: '.87rem' }}
                      >
                        {contact.email}
                      </a>
                    </td>
                    <td style={{ color: 'var(--gray)' }}>{contact.empresa ?? '—'}</td>
                    <td>{contact.pais ?? '—'}</td>
                    <td>
                      {contact.tipo_cliente ? (
                        <span className="badge badge-navy">{contact.tipo_cliente}</span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${contact.leido ? 'badge-gray' : 'badge-orange'}`}>
                        {contact.leido ? 'Leído' : 'Pendiente'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--gray)', fontSize: '.8rem', whiteSpace: 'nowrap' }}>
                      {formatDate(contact.created_at)}
                    </td>
                    <td>
                      {contact.leido ? (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => markAsUnread(contact)}
                          title="Marcar como pendiente"
                        >
                          <IconMailUnread />
                          Pendiente
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => markAsRead(contact)}
                          title="Marcar como leído"
                        >
                          <IconMailRead />
                          Marcar leído
                        </button>
                      )}
                    </td>
                  </tr>

                  {expandedId === contact.id && (
                    <tr className="expanded-row" key={`exp-${contact.id}`}>
                      <td colSpan={9}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                          <div className="expanded-content">
                            <div className="label">Mensaje</div>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{contact.mensaje || 'Sin mensaje.'}</p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {contact.productos && (
                              <div className="expanded-content">
                                <div className="label">Productos de interés</div>
                                <p>{contact.productos}</p>
                              </div>
                            )}
                            {contact.volumen && (
                              <div className="expanded-content">
                                <div className="label">Volumen requerido</div>
                                <p>{contact.volumen}</p>
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                              <a
                                href={`mailto:${contact.email}?subject=Re: Solicitud Pycmar`}
                                className="btn btn-accent btn-sm"
                              >
                                <IconMail />
                                Responder por email
                              </a>
                              {!contact.leido && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => markAsRead(contact)}
                                >
                                  <IconMailRead />
                                  Marcar leído
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function IconMail() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> }
function IconMailRead() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/><polyline points="16 17 18 19 22 15"/></svg> }
function IconMailUnread() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> }
function IconChevron() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg> }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
function IconX() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
