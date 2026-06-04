import { useState, useEffect, useRef, FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types'

interface CategoryFormData {
  slug: string
  name_es: string
  name_en: string
  name_zh: string
  description_es: string
  description_en: string
  description_zh: string
  order_index: string
  image_url: string
}

const emptyForm: CategoryFormData = {
  slug: '',
  name_es: '',
  name_en: '',
  name_zh: '',
  description_es: '',
  description_en: '',
  description_zh: '',
  order_index: '0',
  image_url: '',
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('order_index')
    setCategories(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setEditTarget(null)
    setForm(emptyForm)
    setSlugManuallyEdited(false)
    setError(null)
    setSaving(false)
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditTarget(cat)
    setForm({
      slug: cat.slug,
      name_es: cat.name_es,
      name_en: cat.name_en,
      name_zh: cat.name_zh ?? '',
      description_es: cat.description_es ?? '',
      description_en: cat.description_en ?? '',
      description_zh: cat.description_zh ?? '',
      order_index: String(cat.order_index),
      image_url: cat.image_url ?? '',
    })
    setSlugManuallyEdited(true)
    setError(null)
    setSaving(false)
    setModalOpen(true)
  }

  function setField(key: keyof CategoryFormData, value: string) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'name_es' && !slugManuallyEdited) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  async function uploadCategoryImage(file: File): Promise<string | null> {
    setUploadingImage(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const filename = `category-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('category-images')
      .upload(filename, file, { upsert: true })

    if (error) {
      setUploadingImage(false)
      return null
    }

    const { data } = supabase.storage.from('category-images').getPublicUrl(filename)
    setUploadingImage(false)
    return data.publicUrl
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadCategoryImage(file)
    if (url) setField('image_url', url)
    e.target.value = ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload = {
      slug: form.slug,
      name_es: form.name_es,
      name_en: form.name_en,
      name_zh: form.name_zh || null,
      description_es: form.description_es,
      description_en: form.description_en,
      description_zh: form.description_zh || null,
      order_index: parseInt(form.order_index) || 0,
      image_url: form.image_url || null,
    }

    try {
      if (editTarget) {
        const { error: updateErr } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editTarget.id)
        if (updateErr) throw updateErr
      } else {
        const { error: insertErr } = await supabase
          .from('categories')
          .insert(payload)
        if (insertErr) throw insertErr
      }

      setSaving(false)
      setModalOpen(false)
      showToast(editTarget ? 'Categoría actualizada.' : 'Categoría creada.')
      fetchCategories()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
      setSaving(false)
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`¿Eliminar la categoría "${cat.name_es}"? Los productos asociados quedarán sin categoría.`)) return
    const { error } = await supabase.from('categories').delete().eq('id', cat.id)
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== cat.id))
      showToast(`Categoría "${cat.name_es}" eliminada.`)
    } else {
      showToast('Error al eliminar.', 'error')
    }
  }

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
        <h2>Categorías <span style={{ color: 'var(--gray)', fontWeight: 600, fontSize: '.85rem' }}>({categories.length})</span></h2>
        <button className="btn btn-accent" onClick={openCreate}>
          <IconPlus />
          Nueva categoría
        </button>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" />Cargando categorías...</div>
      ) : categories.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconGrid /></div>
            <h3>Sin categorías</h3>
            <p>Crea la primera categoría de productos.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Orden</th>
                <th>Imagen</th>
                <th>Nombre (ES)</th>
                <th>Nombre (EN)</th>
                <th>Nombre (中文)</th>
                <th>Descripción (ES)</th>
                <th>Slug</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>
                    <span className="badge badge-gray">{cat.order_index}</span>
                  </td>
                  <td>
                    {cat.image_url ? (
                      <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--mist)', flexShrink: 0 }}>
                        <img src={cat.image_url} alt={cat.name_es} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-2)' }}>
                        <IconImage />
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 700 }}>{cat.name_es}</td>
                  <td style={{ color: 'var(--gray)' }}>{cat.name_en}</td>
                  <td style={{ color: 'var(--gray)' }}>{cat.name_zh || '—'}</td>
                  <td style={{ color: 'var(--gray)', maxWidth: 240 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                      {cat.description_es || '—'}
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '.78rem', background: 'var(--mist)', padding: '2px 7px', borderRadius: 5, color: 'var(--ocean)' }}>
                      {cat.slug}
                    </code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(cat)}>
                        <IconEdit />
                        Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat)}>
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => !saving && setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTarget ? `Editar: ${editTarget.name_es}` : 'Nueva categoría'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <IconX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

                <div className="form-grid" style={{ marginBottom: 14 }}>
                  <div className="field">
                    <label>Nombre en español <span className="req">*</span></label>
                    <input
                      type="text"
                      value={form.name_es}
                      onChange={e => setField('name_es', e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="field">
                    <label>Nombre en inglés <span className="req">*</span></label>
                    <input
                      type="text"
                      value={form.name_en}
                      onChange={e => setField('name_en', e.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Nombre en chino (中文)</label>
                    <input
                      type="text"
                      value={form.name_zh}
                      onChange={e => setField('name_zh', e.target.value)}
                      placeholder="Ej. 鱿鱼"
                    />
                  </div>
                  <div className="field">
                    <label>Slug <span className="req">*</span></label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={e => { setSlugManuallyEdited(true); setField('slug', e.target.value) }}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Orden</label>
                    <input
                      type="number"
                      min="0"
                      value={form.order_index}
                      onChange={e => setField('order_index', e.target.value)}
                    />
                  </div>
                  <div className="field form-col-full">
                    <label>Descripción (ES)</label>
                    <textarea
                      value={form.description_es}
                      onChange={e => setField('description_es', e.target.value)}
                      style={{ minHeight: 80 }}
                    />
                  </div>
                  <div className="field form-col-full">
                    <label>Descripción (EN)</label>
                    <textarea
                      value={form.description_en}
                      onChange={e => setField('description_en', e.target.value)}
                      style={{ minHeight: 80 }}
                    />
                  </div>
                  <div className="field form-col-full">
                    <label>Descripción (中文)</label>
                    <textarea
                      value={form.description_zh}
                      onChange={e => setField('description_zh', e.target.value)}
                      placeholder="分类描述（中文）..."
                      style={{ minHeight: 80 }}
                    />
                  </div>
                </div>

                {/* Image */}
                <div className="field">
                  <label>Imagen de categoría</label>
                  {form.image_url && (
                    <div style={{ marginBottom: 10, position: 'relative', width: 120, height: 90, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--line)' }}>
                      <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setField('image_url', '')}
                        style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 6, background: 'rgba(239,68,68,.9)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <IconX />
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />Subiendo...</> : <><IconUpload />Subir imagen</>}
                    </button>
                    <span style={{ fontSize: '.78rem', color: 'var(--gray)' }}>o</span>
                    <input
                      type="url"
                      value={form.image_url}
                      onChange={e => setField('image_url', e.target.value)}
                      placeholder="https://... (URL externa)"
                      style={{ flex: 1, border: '1.5px solid var(--line-2)', borderRadius: 'var(--radius-sm)', padding: '.55em .8em', fontSize: '.88rem', fontFamily: 'inherit', color: 'var(--navy)' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-accent" disabled={saving || uploadingImage}>
                  {saving ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />Guardando...</> : <><IconSave />{editTarget ? 'Guardar cambios' : 'Crear categoría'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function IconPlus() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function IconEdit() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> }
function IconTrash() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> }
function IconGrid() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> }
function IconImage() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
function IconX() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
function IconUpload() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> }
function IconSave() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> }
