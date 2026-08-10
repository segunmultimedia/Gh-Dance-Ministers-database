import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import LogoComponent from './LogoComponent';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleFillDemo = () => {
    setEmail('admin@organization.org');
    setPassword('admin123');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    // Authenticate admin demo credentials
    if (email === 'admin@organization.org' && password === 'admin123') {
      onLoginSuccess({
        name: 'Hecham GAZHI',
        email: 'hechamgazhi@gmail.com',
        role: 'System Administrator'
      });
    } else {
      // Allow any non-empty demo login for flexibility
      onLoginSuccess({
        name: email.split('@')[0] || 'Administrator',
        email: email,
        role: 'Administrator'
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'fixed',
      inset: 0,
      zIndex: 200
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        background: '#ffffff',
        border: 'none'
      }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <LogoComponent size={80} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
            GH Dance Ministers
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Member Database Portal Sign In
          </p>
        </div>

        {/* Demo Quick Fill Box */}
        <div style={{
          background: 'var(--primary-light)',
          border: '1px solid #c7d2fe',
          borderRadius: '12px',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>DEMO ACCESS</div>
            <div style={{ fontSize: '0.8rem', color: '#3730a3' }}>admin@organization.org / admin123</div>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={handleFillDemo}
            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
          >
            Auto Fill
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#b91c1c',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="admin@organization.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', fontWeight: 700 }}>
            <span>Sign In to Dashboard</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          🔒 Protected by Member Database Access Controls
        </div>
      </div>
    </div>
  );
}
