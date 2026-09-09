import React, { useState } from 'react';
import { loginUser } from '../../services/db';
import GlassCard from '../../components/GlassCard';
import { BookOpen, Key, Mail, Lock, ArrowLeft, ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';

const StudentAuth = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState('login'); // login | recovery
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      const user = loginUser(email, password);
      
      // Safety Check: Users must have approved enrollments unless they are admin
      if (user.status !== 'Inscripción activa' && !user.isAdmin) {
        setError('Tu inscripción se encuentra pendiente de validación. Debes completar el proceso de pago.');
        return;
      }

      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor introduce tu correo electrónico.');
      return;
    }
    setRecoverySent(true);
    setError('');
  };

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '440px', margin: '80px auto', padding: '20px' }}>
      
      {/* Background Auras */}
      <div className="background-auras">
        <div className="aura aura-green" />
        <div className="aura aura-blue" />
      </div>

      {/* Navigation link */}
      <button 
        onClick={() => onNavigate('landing')} 
        className="glass-pill secondary" 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}
      >
        <ArrowLeft size={16} />
        <span>Ir a página pública</span>
      </button>

      <GlassCard tint="neutral" style={{ padding: '36px' }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #31c48d, #3f83f8)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(63, 131, 248, 0.2)', marginBottom: '12px' }}>
            <BookOpen style={{ color: '#fff', width: '24px', height: '24px' }} />
          </div>
          <h2 style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>Aula Virtual</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
            {view === 'login' ? 'Ingresa tus credenciales para acceder' : 'Recupera tu contraseña de acceso'}
          </p>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '10px', background: 'rgba(253, 232, 232, 0.6)', border: '1px solid rgba(249, 128, 128, 0.4)', borderRadius: '12px', padding: '12px', color: '#9b1c1c', fontSize: '13px', marginBottom: '20px', lineHeight: 1.4 }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {view === 'login' ? (
          /* Login Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' }}>
                Correo electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#9ca3af' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alumno@academia.com" 
                  className="glass-input"
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '13px', color: '#374151' }}>
                  Contraseña
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); setView('recovery'); setRecoverySent(false); setError(''); }}
                  style={{ fontSize: '13px', color: '#3f83f8', textDecoration: 'none' }}
                >
                  ¿La olvidaste?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#9ca3af' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••" 
                  className="glass-input"
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="glass-btn primary"
              style={{ padding: '14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
            >
              <span>Entrar al Aula</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>¿No tienes una cuenta aún? </span>
              <a 
                href="#register" 
                onClick={(e) => { e.preventDefault(); onNavigate('register'); }}
                style={{ fontSize: '13px', color: '#3f83f8', textDecoration: 'none', fontWeight: 600 }}
              >
                Inscríbete aquí
              </a>
            </div>

          </form>
        ) : (
          /* Password Recovery View */
          <form onSubmit={handleRecoverySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {recoverySent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center', background: 'rgba(222, 247, 236, 0.6)', border: '1px solid rgba(49, 196, 141, 0.4)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#def7ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0e9f6e' }}>
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', color: '#03543f', marginBottom: '6px' }}>Enlace enviado</h3>
                  <p style={{ fontSize: '13px', color: '#046c4e', lineHeight: 1.4 }}>
                    Hemos enviado un enlace de recuperación simulado a tu correo: <strong>{email}</strong>. Revisa tu bandeja de entrada.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setView('login')}
                  className="glass-btn secondary"
                  style={{ width: '100%', padding: '10px' }}
                >
                  Volver al inicio de sesión
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' }}>
                    Introduce tu correo electrónico
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#9ca3af' }} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alumno@academia.com" 
                      className="glass-input"
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="glass-btn primary"
                  style={{ padding: '14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <span>Enviar instrucciones</span>
                  <Key size={16} />
                </button>

                <button 
                  type="button" 
                  onClick={() => setView('login')}
                  className="glass-btn secondary"
                  style={{ padding: '10px', width: '100%' }}
                >
                  Cancelar
                </button>
              </>
            )}

          </form>
        )}

      </GlassCard>
      
      <div style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: '16px', padding: '16px', marginTop: '20px', fontSize: '13px', color: '#4b5563', lineHeight: 1.4, textAlign: 'center' }}>
        <ShieldCheck size={18} style={{ display: 'inline-block', verticalAlign: 'middle', color: '#31c48d', marginRight: '6px' }} />
        <strong>Acceso Seguro y Encriptado:</strong>
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
          El CEO / Administrador configura sus propias credenciales privadas en el Panel de Control.
        </div>
      </div>

    </div>
  );
};

export default StudentAuth;
