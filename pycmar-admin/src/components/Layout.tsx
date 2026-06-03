import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../App'

const navItems = [
  {
    label: 'Principal',
    items: [
      { to: '/', label: 'Dashboard', exact: true, icon: <IconDashboard /> },
      { to: '/products', label: 'Productos', icon: <IconProducts /> },
      { to: '/categories', label: 'Categorías', icon: <IconCategories /> },
      { to: '/contacts', label: 'Contactos', icon: <IconContacts /> },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { to: '/orders', label: 'Pedidos', icon: <IconOrders /> },
      { to: '/shipments', label: 'Logística', icon: <IconShip /> },
    ],
  },
]

function pageTitles(pathname: string): { title: string; breadcrumb: string } {
  if (pathname === '/') return { title: 'Dashboard', breadcrumb: 'Inicio' }
  if (pathname === '/products') return { title: 'Productos', breadcrumb: 'Inicio · Productos' }
  if (pathname === '/products/new') return { title: 'Nuevo Producto', breadcrumb: 'Inicio · Productos · Nuevo' }
  if (pathname.includes('/products/') && pathname.includes('/edit')) return { title: 'Editar Producto', breadcrumb: 'Inicio · Productos · Editar' }
  if (pathname === '/categories') return { title: 'Categorías', breadcrumb: 'Inicio · Categorías' }
  if (pathname === '/contacts') return { title: 'Contactos', breadcrumb: 'Inicio · Contactos' }
  if (pathname === '/orders') return { title: 'Pedidos', breadcrumb: 'Inicio · Pedidos' }
  if (pathname.startsWith('/orders/')) return { title: 'Detalle de pedido', breadcrumb: 'Inicio · Pedidos · Detalle' }
  if (pathname === '/shipments') return { title: 'Logística', breadcrumb: 'Inicio · Logística' }
  if (pathname === '/shipments/new') return { title: 'Nuevo embarque', breadcrumb: 'Inicio · Logística · Nuevo' }
  if (pathname.includes('/shipments/') && pathname.includes('/edit')) return { title: 'Editar embarque', breadcrumb: 'Inicio · Logística · Editar' }
  if (pathname.startsWith('/shipments/')) return { title: 'Detalle de embarque', breadcrumb: 'Inicio · Logística · Embarque' }
  return { title: 'Admin', breadcrumb: 'Inicio' }
}

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { title, breadcrumb } = pageTitles(location.pathname)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'AD'

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/assets/logo-white.png" alt="Pycmar" className="sidebar-logo-img" />
          <span className="sidebar-logo-sub">Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.label}>
              <span className="sidebar-section-label">{section.label}</span>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="name">{user?.email?.split('@')[0] ?? 'Admin'}</div>
              <div className="role">Administrador</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <IconLogout />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{title}</h1>
            <div className="breadcrumb">{breadcrumb}</div>
          </div>
          <div className="topbar-actions">
            <a
              href="https://pycmar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <IconExternal />
              Ver sitio
            </a>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// ---- Icons ----------------------------------------------------------------

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}

function IconProducts() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.29 7 12 12 20.71 7"/>
      <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  )
}

function IconCategories() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0-4-4L4 16v4z"/>
      <path d="M13.5 6.5l4 4"/>
    </svg>
  )
}

function IconContacts() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

function IconOrders() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function IconShip() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2.4 2.4 0 002 1 2.4 2.4 0 002-1 2.4 2.4 0 012-1 2.4 2.4 0 012 1 2.4 2.4 0 002 1 2.4 2.4 0 002-1 2.4 2.4 0 012-1 2.4 2.4 0 012 1"/>
      <path d="M4 18l-1-5h18l-2 5"/>
      <path d="M12 2v8"/>
      <path d="M8 8h8"/>
    </svg>
  )
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

function IconExternal() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  )
}
