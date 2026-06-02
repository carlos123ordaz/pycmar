import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

export default function AuthWidget() {
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check session on mount
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { if (data.user) setUser(data.user); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login'
      ? { email, password }
      : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al procesar la solicitud'); return; }
      if (mode === 'register') {
        setSuccess('¡Cuenta creada! Revisa tu email para confirmarla.');
      } else {
        setUser(data.user);
        setShowModal(false);
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.reload();
  };

  if (user) {
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{fontSize: '.82rem', color: 'var(--gray)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {user.email}
        </span>
        <button onClick={handleLogout} className="btn btn-outline btn-sm">Salir</button>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn btn-navy btn-sm">
        Ingresar
      </button>

      {showModal && (
        <div className="auth-modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="auth-modal">
            <h2>{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</h2>
            <p className="lead">
              {mode === 'login'
                ? 'Accede a tu cuenta para gestionar cotizaciones'
                : 'Regístrate para guardar cotizaciones y hacer seguimiento'
              }
            </p>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            {!success && (
              <form onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <div className="form-field">
                    <label>Nombre completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                )}
                <div className="form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="correo@empresa.com"
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-navy btn-block" disabled={loading} style={{marginTop: 8}}>
                  {loading ? 'Procesando…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
                </button>
              </form>
            )}

            <div className="auth-divider">o</div>
            <p style={{textAlign: 'center', fontSize: '.88rem', color: 'var(--gray)'}}>
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              {' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
                style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600}}
              >
                {mode === 'login' ? 'Regístrate' : 'Ingresa'}
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
