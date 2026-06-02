import { useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ProductImage } from '../types'

interface ImageUploaderProps {
  productId?: string
  bucket: string
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
}

export default function ImageUploader({ productId, bucket, images, onImagesChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    if (!productId) {
      setError('Guarda el producto primero antes de subir imágenes.')
      return
    }
    setError(null)
    setUploading(true)

    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filename = `${productId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename)
      const url = urlData.publicUrl

      const isMain = images.length === 0
      const orderIndex = images.length

      const { data: imgRow, error: insertError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          url,
          order_index: orderIndex,
          is_main: isMain,
        })
        .select()
        .single()

      if (insertError) throw insertError

      onImagesChange([...images, imgRow])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }, [productId, bucket, images, onImagesChange])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(uploadFile)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    Array.from(e.dataTransfer.files).forEach(uploadFile)
  }

  async function setAsMain(imgId: string) {
    if (!productId) return
    // Remove main from all
    await supabase
      .from('product_images')
      .update({ is_main: false })
      .eq('product_id', productId)

    // Set main on selected
    const { error } = await supabase
      .from('product_images')
      .update({ is_main: true })
      .eq('id', imgId)

    if (!error) {
      onImagesChange(images.map(img => ({ ...img, is_main: img.id === imgId })))
    }
  }

  async function deleteImage(img: ProductImage) {
    if (!confirm('¿Eliminar esta imagen?')) return

    // Try to remove from storage
    const urlParts = img.url.split('/')
    const path = urlParts.slice(urlParts.indexOf(bucket) + 1).join('/')
    if (path) {
      await supabase.storage.from(bucket).remove([path])
    }

    await supabase.from('product_images').delete().eq('id', img.id)

    const newImages = images.filter(i => i.id !== img.id)
    // If deleted was main, set first as main
    if (img.is_main && newImages.length > 0) {
      await supabase
        .from('product_images')
        .update({ is_main: true })
        .eq('id', newImages[0].id)
      newImages[0].is_main = true
    }
    onImagesChange(newImages)
  }

  return (
    <div>
      <div
        className={`upload-zone${dragOver ? ' dragover' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        {uploading ? (
          <>
            <div className="spinner" style={{ margin: '0 auto 10px' }} />
            <p>Subiendo...</p>
          </>
        ) : (
          <>
            <IconUpload />
            <p>Haz clic o arrastra imágenes aquí</p>
            <div className="hint">PNG, JPG, WebP — máx. 5 MB c/u</div>
          </>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 8, fontSize: '.82rem', color: 'var(--danger)', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="images-grid">
          {images.map((img) => (
            <div key={img.id} className={`img-thumb${img.is_main ? ' is-main' : ''}`}>
              <img src={img.url} alt="" loading="lazy" />
              {img.is_main && <span className="img-thumb-badge">Principal</span>}
              <div className="img-thumb-actions">
                {!img.is_main && (
                  <button className="img-thumb-btn" onClick={() => setAsMain(img.id)} title="Establecer como principal">
                    <IconStar />
                  </button>
                )}
                <button className="img-thumb-btn" style={{ color: 'var(--danger)' }} onClick={() => deleteImage(img)} title="Eliminar">
                  <IconTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )
}

function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}
