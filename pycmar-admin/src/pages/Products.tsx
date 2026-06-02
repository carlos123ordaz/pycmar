import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Product, Category } from '../types'

export default function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(id, slug, name_es, name_en, description_es, description_en, image_url, order_index)')
      .order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
    supabase.from('categories').select('*').order('order_index').then(({ data }) => {
      setCategories(data ?? [])
    })
  }, [fetchProducts])

  const filtered = products.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.name_es.toLowerCase().includes(q) ||
      p.name_en.toLowerCase().includes(q) ||
      (p.scientific_name ?? '').toLowerCase().includes(q) ||
      (p.category?.name_es ?? '').toLowerCase().includes(q)
    )
  })

  async function toggleFeatured(product: Product) {
    const { error } = await supabase
      .from('products')
      .update({ featured: !product.featured })
      .eq('id', product.id)

    if (!error) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, featured: !p.featured } : p))
    }
  }

  async function toggleActive(product: Product) {
    const { error } = await supabase
      .from('products')
      .update({ active: !product.active })
      .eq('id', product.id)

    if (!error) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: !p.active } : p))
    }
  }

  const getCategoryName = (p: Product) => {
    if (p.category) return p.category.name_es
    const cat = categories.find(c => c.id === p.category_id)
    return cat?.name_es ?? '—'
  }

  return (
    <div>
      {/* Toast */}
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

      {/* Header */}
      <div className="section-header">
        <h2>Productos <span style={{ color: 'var(--gray)', fontWeight: 600, fontSize: '.85rem' }}>({filtered.length})</span></h2>
        <div className="actions">
          <div className="search-field">
            <IconSearch />
            <input
              type="search"
              placeholder="Buscar productos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-accent" onClick={() => navigate('/products/new')}>
            <IconPlus />
            Nuevo producto
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loader"><div className="spinner" />Cargando productos...</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconBox /></div>
            <h3>{search ? 'Sin resultados' : 'Sin productos'}</h3>
            <p>{search ? 'Intenta con otro término.' : 'Agrega tu primer producto.'}</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Tags</th>
                <th>Destacado</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr
                  key={product.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                >
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{product.name_es}</div>
                    {product.scientific_name && (
                      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '.78rem', color: 'var(--gray)', marginTop: 2 }}>
                        {product.scientific_name}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-navy">{getCategoryName(product)}</span>
                  </td>
                  <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {product.price ? `$${product.price.toFixed(2)}` : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', maxWidth: 180 }}>
                      {(product.tags ?? []).slice(0, 3).map(tag => (
                        <span key={tag} className="badge badge-gray">{tag}</span>
                      ))}
                      {(product.tags ?? []).length > 3 && (
                        <span className="badge badge-gray">+{product.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <label className="toggle" title={product.featured ? 'Quitar destacado' : 'Destacar'}>
                      <input
                        type="checkbox"
                        checked={product.featured}
                        onChange={() => toggleFeatured(product)}
                      />
                      <span className="toggle-track" />
                    </label>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <label className="toggle" title={product.active ? 'Desactivar' : 'Activar'}>
                      <input
                        type="checkbox"
                        checked={product.active}
                        onChange={() => toggleActive(product)}
                      />
                      <span className="toggle-track" />
                    </label>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button
                      className="btn-chevron"
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      title="Ver y editar"
                    >
                      <IconChevron />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}

function IconPlus() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function IconSearch() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function IconChevron() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}
function IconBox() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
}
function IconCheck() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function IconX() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
