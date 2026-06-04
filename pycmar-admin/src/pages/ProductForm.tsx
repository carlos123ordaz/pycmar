import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ImageUploader from '../components/ImageUploader'
import type { Category, ProductImage } from '../types'

interface FormData {
  slug: string
  name_es: string
  name_en: string
  name_zh: string
  scientific_name: string
  category_id: string
  price: string
  tags: string
  origin: string
  fao_zone: string
  presentation: string
  packaging: string
  sizing: string
  measures: string
  blurb_es: string
  blurb_en: string
  blurb_zh: string
  description_es: string
  description_en: string
  description_zh: string
  featured: boolean
  retail: boolean
  active: boolean
}

const empty: FormData = {
  slug: '',
  name_es: '',
  name_en: '',
  name_zh: '',
  scientific_name: '',
  category_id: '',
  price: '',
  tags: '',
  origin: '',
  fao_zone: '',
  presentation: '',
  packaging: '',
  sizing: '',
  measures: '',
  blurb_es: '',
  blurb_en: '',
  blurb_zh: '',
  description_es: '',
  description_en: '',
  description_zh: '',
  featured: false,
  retail: false,
  active: true,
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

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormData>(empty)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedProductId, setSavedProductId] = useState<string | undefined>(id)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    supabase.from('categories').select('*').order('order_index').then(({ data }) => {
      setCategories(data ?? [])
    })

    if (isEdit && id) {
      supabase
        .from('products')
        .select('*, images:product_images(*)')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm({
              slug: data.slug ?? '',
              name_es: data.name_es ?? '',
              name_en: data.name_en ?? '',
              name_zh: data.name_zh ?? '',
              scientific_name: data.scientific_name ?? '',
              category_id: data.category_id ?? '',
              price: data.price?.toString() ?? '',
              tags: (data.tags ?? []).join(', '),
              origin: data.origin ?? '',
              fao_zone: data.fao_zone ?? '',
              presentation: data.presentation ?? '',
              packaging: data.packaging ?? '',
              sizing: data.sizing ?? '',
              measures: data.measures ?? '',
              blurb_es: data.blurb_es ?? '',
              blurb_en: data.blurb_en ?? '',
              blurb_zh: data.blurb_zh ?? '',
              description_es: data.description_es ?? '',
              description_en: data.description_en ?? '',
              description_zh: data.description_zh ?? '',
              featured: data.featured ?? false,
              retail: data.retail ?? false,
              active: data.active ?? true,
            })
            setImages(data.images ?? [])
            setSavedProductId(id)
            setSlugManuallyEdited(true)
          }
          setLoading(false)
        })
    }
  }, [isEdit, id])

  function set(key: keyof FormData, value: string | boolean) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'name_es' && !slugManuallyEdited) {
        next.slug = slugify(value as string)
      }
      return next
    })
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
      scientific_name: form.scientific_name || null,
      category_id: form.category_id || null,
      price: form.price ? parseFloat(form.price) : null,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      origin: form.origin || null,
      fao_zone: form.fao_zone || null,
      presentation: form.presentation || null,
      packaging: form.packaging || null,
      sizing: form.sizing || null,
      measures: form.measures || null,
      blurb_es: form.blurb_es || null,
      blurb_en: form.blurb_en || null,
      blurb_zh: form.blurb_zh || null,
      description_es: form.description_es,
      description_en: form.description_en,
      description_zh: form.description_zh || null,
      featured: form.featured,
      retail: form.retail,
      active: form.active,
      updated_at: new Date().toISOString(),
    }

    try {
      if (isEdit && savedProductId) {
        const { error: updateErr } = await supabase
          .from('products')
          .update(payload)
          .eq('id', savedProductId)
        if (updateErr) throw updateErr
      } else {
        const { data: newProduct, error: insertErr } = await supabase
          .from('products')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select()
          .single()
        if (insertErr) throw insertErr
        setSavedProductId(newProduct.id)
      }

      navigate('/products')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!savedProductId) return
    setDeleting(true)

    const { data: imgs } = await supabase.from('product_images').select('url').eq('product_id', savedProductId)
    if (imgs && imgs.length > 0) {
      const paths = imgs.map((img: { url: string }) => img.url.split('/product-images/')[1] ?? '').filter(Boolean)
      if (paths.length) await supabase.storage.from('product-images').remove(paths)
    }

    const { error: delErr } = await supabase.from('products').delete().eq('id', savedProductId)
    setDeleting(false)
    if (!delErr) {
      navigate('/products')
    } else {
      setError('Error al eliminar el producto.')
      setDeleteTarget(false)
    }
  }

  if (loading) {
    return <div className="loader"><div className="spinner" />Cargando producto...</div>
  }

  return (
    <div className="product-form-page">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/products')}>
            <IconArrow />
            Productos
          </button>
          <span style={{ color: 'var(--gray)' }}>/</span>
          <div>
            <h2 style={{ margin: 0 }}>{isEdit ? (form.name_es || 'Editar producto') : 'Nuevo producto'}</h2>
          </div>
        </div>
        <div className="actions">
          {isEdit && savedProductId && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setDeleteTarget(true)}
              title="Eliminar producto"
            >
              <IconTrash />
              Eliminar
            </button>
          )}
          <button
            form="product-form"
            type="submit"
            className="btn btn-accent"
            disabled={saving}
          >
            {saving ? (
              <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Guardando...</>
            ) : (
              <><IconSave />{isEdit ? 'Guardar cambios' : 'Crear producto'}</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: 20 }}>{error}</div>
      )}

      <form id="product-form" onSubmit={handleSubmit}>
        {/* Identification */}
        <div className="card form-section">
          <div className="card-header">
            <h2>Identificación</h2>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field">
                <label>Nombre en español <span className="req">*</span></label>
                <input
                  type="text"
                  value={form.name_es}
                  onChange={e => set('name_es', e.target.value)}
                  placeholder="Ej. Langostino Entero IQF"
                  required
                />
              </div>
              <div className="field">
                <label>Nombre en inglés <span className="req">*</span></label>
                <input
                  type="text"
                  value={form.name_en}
                  onChange={e => set('name_en', e.target.value)}
                  placeholder="Ej. Whole IQF Shrimp"
                  required
                />
              </div>
              <div className="field">
                <label>Nombre en chino (中文)</label>
                <input
                  type="text"
                  value={form.name_zh}
                  onChange={e => set('name_zh', e.target.value)}
                  placeholder="Ej. 整只IQF虾"
                />
              </div>
              <div className="field">
                <label>Slug (URL) <span className="req">*</span></label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => { setSlugManuallyEdited(true); set('slug', e.target.value) }}
                  placeholder="langostino-entero-iqf"
                  required
                />
                <span className="hint">Se genera automáticamente del nombre. Puedes editarlo.</span>
              </div>
              <div className="field">
                <label>Nombre científico</label>
                <input
                  type="text"
                  value={form.scientific_name}
                  onChange={e => set('scientific_name', e.target.value)}
                  placeholder="Ej. Penaeus vannamei"
                />
              </div>
              <div className="field">
                <label>Categoría</label>
                <select value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                  <option value="">— Sin categoría —</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name_es}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Precio (USD/kg)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="card form-section">
          <div className="card-header">
            <h2>Especificaciones técnicas</h2>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field">
                <label>Origen</label>
                <input
                  type="text"
                  value={form.origin}
                  onChange={e => set('origin', e.target.value)}
                  placeholder="Ej. Perú"
                />
              </div>
              <div className="field">
                <label>Zona FAO</label>
                <input
                  type="text"
                  value={form.fao_zone}
                  onChange={e => set('fao_zone', e.target.value)}
                  placeholder="Ej. FAO 87"
                />
              </div>
              <div className="field">
                <label>Presentación</label>
                <input
                  type="text"
                  value={form.presentation}
                  onChange={e => set('presentation', e.target.value)}
                  placeholder="Ej. IQF, Bloque"
                />
              </div>
              <div className="field">
                <label>Empaque</label>
                <input
                  type="text"
                  value={form.packaging}
                  onChange={e => set('packaging', e.target.value)}
                  placeholder="Ej. Caja de 10 kg"
                />
              </div>
              <div className="field">
                <label>Calibres / Tallas</label>
                <input
                  type="text"
                  value={form.sizing}
                  onChange={e => set('sizing', e.target.value)}
                  placeholder="Ej. 21/25, 26/30, 31/40"
                />
              </div>
              <div className="field">
                <label>Medidas</label>
                <input
                  type="text"
                  value={form.measures}
                  onChange={e => set('measures', e.target.value)}
                  placeholder="Ej. 40×60 cm"
                />
              </div>
              <div className="field form-col-full">
                <label>Tags (separados por comas)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => set('tags', e.target.value)}
                  placeholder="Ej. IQF, Cocido, Premium, Exportación"
                />
                <span className="hint">Los tags aparecen como etiquetas en el catálogo.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="card form-section">
          <div className="card-header">
            <h2>Contenido</h2>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field">
                <label>Resumen corto (ES)</label>
                <textarea
                  value={form.blurb_es}
                  onChange={e => set('blurb_es', e.target.value)}
                  placeholder="Descripción breve para la tarjeta del producto..."
                  style={{ minHeight: 80 }}
                />
              </div>
              <div className="field">
                <label>Resumen corto (EN)</label>
                <textarea
                  value={form.blurb_en}
                  onChange={e => set('blurb_en', e.target.value)}
                  placeholder="Short description for product card..."
                  style={{ minHeight: 80 }}
                />
              </div>
              <div className="field form-col-full">
                <label>Resumen corto (中文)</label>
                <textarea
                  value={form.blurb_zh}
                  onChange={e => set('blurb_zh', e.target.value)}
                  placeholder="产品卡片的简短描述..."
                  style={{ minHeight: 80 }}
                />
              </div>
              <div className="field form-col-full">
                <label>Descripción completa (ES)</label>
                <textarea
                  value={form.description_es}
                  onChange={e => set('description_es', e.target.value)}
                  placeholder="Descripción completa del producto en español..."
                  style={{ minHeight: 140 }}
                />
              </div>
              <div className="field form-col-full">
                <label>Descripción completa (EN)</label>
                <textarea
                  value={form.description_en}
                  onChange={e => set('description_en', e.target.value)}
                  placeholder="Full product description in English..."
                  style={{ minHeight: 140 }}
                />
              </div>
              <div className="field form-col-full">
                <label>Descripción completa (中文)</label>
                <textarea
                  value={form.description_zh}
                  onChange={e => set('description_zh', e.target.value)}
                  placeholder="产品完整描述（中文）..."
                  style={{ minHeight: 140 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="card form-section">
          <div className="card-header">
            <h2>Visibilidad y opciones</h2>
          </div>
          <div className="card-body">
            <div className="form-grid cols3">
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => set('active', e.target.checked)}
                />
                <span>Activo (visible en el catálogo)</span>
              </label>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={e => set('featured', e.target.checked)}
                />
                <span>Destacado (aparece en home)</span>
              </label>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={form.retail}
                  onChange={e => set('retail', e.target.checked)}
                />
                <span>Venta al detalle disponible</span>
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card form-section">
          <div className="card-header">
            <h2>Imágenes del producto</h2>
          </div>
          <div className="card-body">
            {!savedProductId && (
              <div style={{
                background: 'var(--warning-light)',
                border: '1px solid rgba(245,158,11,.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '.85rem',
                color: 'var(--warning)',
                fontWeight: 600,
                marginBottom: 16,
              }}>
                Guarda el producto primero para poder subir imágenes.
              </div>
            )}
            <ImageUploader
              productId={savedProductId}
              bucket="product-images"
              images={images}
              onImagesChange={setImages}
            />
          </div>
        </div>
      </form>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-dialog">
                <div className="confirm-icon"><IconTrash /></div>
                <h3>Eliminar producto</h3>
                <p>¿Eliminar "{form.name_es}"? Se borrarán también todas sus imágenes. Esta acción no se puede deshacer.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button className="btn btn-outline" onClick={() => setDeleteTarget(false)} disabled={deleting}>Cancelar</button>
                  <button
                    className="btn btn-danger"
                    style={{ background: 'var(--danger)', color: '#fff' }}
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting
                      ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Eliminando...</>
                      : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function IconArrow() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
}

function IconSave() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
}
function IconTrash() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}
