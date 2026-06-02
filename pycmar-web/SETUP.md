# Pycmar Web — Setup

## 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → New Project
2. Guarda la **URL** y el **anon key** (Settings > API)

## 2. Configurar variables de entorno

Copia `.env.example` a `.env` y completa:

```
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 3. Ejecutar SQL en Supabase

En **Supabase > SQL Editor**, ejecuta en orden:

1. `supabase/migrations/001_initial.sql` — crea todas las tablas y buckets de storage
2. `supabase/seed.sql` — inserta las 6 categorías y 12 productos de ejemplo

## 4. Configurar Auth en Supabase

En **Supabase > Authentication > Settings**:
- Email confirmations: puedes desactivarlo para desarrollo (`Confirm email` → OFF)
- URL del site: `http://localhost:4321` (desarrollo) o tu dominio en producción

## 5. Subir imágenes (opcional)

Los buckets `product-images` y `category-images` ya se crean con el SQL.

En **Supabase > Storage**:
- Sube imágenes de productos al bucket `product-images`
- La URL pública es: `https://tu-proyecto.supabase.co/storage/v1/object/public/product-images/nombre-archivo.jpg`
- Actualiza el campo `url` en la tabla `product_images` con la ruta del archivo (solo el nombre, no la URL completa)

## 6. Correr en desarrollo

```bash
cd pycmar-web
npm install
npm run dev
```

Abre http://localhost:4321

## 7. Build para producción

```bash
npm run build
npm run preview
```

## Estructura del proyecto

```
src/
├── pages/
│   ├── index.astro           # Home
│   ├── catalogo/
│   │   ├── index.astro       # Catálogo con filtros
│   │   └── [slug].astro      # Detalle de producto
│   ├── exportacion.astro     # Página de exportación
│   ├── contacto.astro        # Formulario de contacto
│   └── api/
│       ├── auth/login.ts     # POST /api/auth/login
│       ├── auth/register.ts  # POST /api/auth/register
│       ├── auth/logout.ts    # POST /api/auth/logout
│       ├── auth/me.ts        # GET  /api/auth/me
│       └── contact.ts        # POST /api/contact
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── ProductCard.astro
│   ├── CartDrawer.tsx        # React island — carrito
│   └── AuthWidget.tsx        # React island — login/registro
├── layouts/
│   └── BaseLayout.astro
├── lib/
│   ├── supabase.ts           # Clientes de Supabase
│   └── types.ts              # Tipos TypeScript
└── styles/
    └── global.css            # Sistema de diseño completo

supabase/
├── migrations/001_initial.sql
└── seed.sql
```
