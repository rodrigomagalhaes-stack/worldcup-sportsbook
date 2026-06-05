import { useState } from 'react';
import { X, LogIn, Loader2 } from 'lucide-react';

export default function LoginModal({ onLogin, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
      onClose();
    } catch (err) {
      setError('Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: 32,
        width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '1px solid var(--line)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>Acesso Admin</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Apenas administradores podem fazer edições</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--line)',
            background: 'transparent', cursor: 'pointer', color: 'var(--t3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus
              style={{
                padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--line)',
                background: 'var(--bg)', color: 'var(--t1)', fontSize: 14,
                outline: 'none', transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--line)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>Senha</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required
              style={{
                padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--line)',
                background: 'var(--bg)', color: 'var(--t1)', fontSize: 14,
                outline: 'none', transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--line)'}
            />
          </div>

          {error && (
            <div style={{
              padding: '8px 12px', borderRadius: 8,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '11px 16px', borderRadius: 8, border: 'none',
            background: 'var(--green)', color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            transition: 'opacity .15s',
          }}>
            {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <LogIn size={15} />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
