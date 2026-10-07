import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import GlassCard from '../../components/GlassCard';
import logoImg from '../../assets/logo-nobg.png';
import { Key, Mail, Lock, ArrowLeft, ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';

const StudentAuth = ({ onNavigate, onLoginSuccess, initialView = 'login' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(initialView); // login | recovery | reset-password
  const [recoverySent, setRecoverySent] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [isUnconfirmedUser, setIsUnconfirmedUser] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendFeedback, setResendFeedback] = useState(null);

  useEffect(() => {
    setView(initialView);
    setError('');
    setIsUnconfirmedUser(false);
    setResendFeedback(null);
  }, [initialView]);

  const handleResendEmail = async () => {
    if (resendLoading) return;
    const emailToResend = email.trim();
    if (!emailToResend) {
      setResendFeedback({
        type: 'error',
        message: 'Por favor introduce un correo electrónico en el formulario para reenviar la confirmación.'
      });
      return;
    }

    setResendLoading(true);
    setResendFeedback(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: emailToResend,
        options: {
          emailRedirectTo: `${window.location.origin}`
        }
      });

      if (resendError) {
        throw new Error(resendError.message || 'No se pudo reenviar el correo de confirmación.');
      }

      setResendFeedback({
        type: 'success',
        message: 'Correo de confirmación reenviado exitosamente. Revisa tu bandeja de entrada o carpeta de spam.'
      });
    } catch (err) {
      setResendFeedback({
        type: 'error',
        message: err.message || 'Error al solicitar el reenvío del correo.'
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUnconfirmedUser(false);
    setResendFeedback(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      // 1. Autenticación con Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Correo o contraseña incorrectos. Verifica tus credenciales.');
        }
        if (authError.message.includes('Email not confirmed') || authError.message.toLowerCase().includes('not confirmed')) {
          setIsUnconfirmedUser(true);
          throw new Error('Tu cuenta está registrada pero tu correo electrónico aún no ha sido confirmado.');
        }
        throw new Error(authError.message || 'Error al iniciar sesión en Supabase.');
      }

      // Autenticación en Supabase Auth completada exitosamente.
      // El evento SIGNED_IN de supabase.auth.onAuthStateChange en App.jsx asumirá el control
      // de la restauración de sesión, la verificación de enrollments y la navegación estricta.
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor introduce tu correo electrónico.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}`
      });

      if (resetError) {
        throw new Error(resetError.message || 'No se pudo enviar el correo de recuperación.');
      }

      setRecoverySent(true);
    } catch (err) {
      setError(err.message || 'Error al solicitar la recuperación de contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifícalas e inténtalo de nuevo.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword.trim()
      });

      if (updateError) {
        throw new Error(updateError.message || 'No se pudo actualizar la contraseña en Supabase.');
      }

      setPasswordUpdated(true);
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
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
          <img 
            src={logoImg} 
            alt="Student Hub Logo" 
            style={{ 
              width: '64px', 
              height: '64px', 
              objectFit: 'contain', 
              marginBottom: '12px',
              filter: 'drop-shadow(0 6px 16px rgba(63, 131, 248, 0.3))'
            }} 
          />
          <h2 style={{ fontSize: '26px', letterSpacing: '-0.5px' }}>Aula Virtual</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
            {view === 'login' && 'Ingresa tus credenciales para acceder'}
            {view === 'recovery' && 'Recupera tu contraseña de acceso'}
            {view === 'reset-password' && 'Establece tu nueva contraseña de acceso'}
          </p>
        </div>

        {error && (
          <div style={{ display: 'flex', gap: '10px', background: 'rgba(253, 232, 232, 0.6)', border: '1px solid rgba(249, 128, 128, 0.4)', borderRadius: '12px', padding: '12px', color: '#9b1c1c', fontSize: '13px', marginBottom: '20px', lineHeight: 1.4 }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {isUnconfirmedUser && (
          <div style={{ background: 'rgba(239, 246, 255, 0.7)', border: '1px solid rgba(191, 219, 254, 0.8)', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
            <p style={{ color: '#1e40af', fontSize: '13px', lineHeight: 1.4, margin: '0 0 12px 0' }}>
              ¿No recibiste el correo de confirmación enviado a <strong style={{ wordBreak: 'break-all' }}>{email}</strong>?
            </p>
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="glass-btn secondary"
              style={{ width: '100%', padding: '10px', fontSize: '13px', justifyContent: 'center', opacity: resendLoading ? 0.7 : 1 }}
            >
              <span>{resendLoading ? 'Reenviando...' : 'Reenviar correo de confirmación'}</span>
            </button>
          </div>
        )}

        {resendFeedback && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: resendFeedback.type === 'success' ? 'rgba(222, 247, 236, 0.7)' : 'rgba(253, 232, 232, 0.7)',
            border: `1px solid ${resendFeedback.type === 'success' ? 'rgba(49, 196, 141, 0.4)' : 'rgba(249, 128, 128, 0.4)'}`,
            borderRadius: '12px',
            padding: '12px 16px',
            color: resendFeedback.type === 'success' ? '#0e9f6e' : '#9b1c1c',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'left',
            lineHeight: 1.4
          }}>
            {resendFeedback.type === 'success' ? <ShieldCheck size={18} style={{ flexShrink: 0 }} /> : <ShieldAlert size={18} style={{ flexShrink: 0 }} />}
            <span>{resendFeedback.message}</span>
          </div>
        )}

        {view === 'login' && (
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
              disabled={loading}
              className="glass-btn primary"
              style={{ padding: '14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              <span>{loading ? 'Verificando...' : 'Entrar al Aula'}</span>
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
        )}

        {view === 'recovery' && (
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
                    Hemos enviado un enlace oficial de recuperación a tu correo: <strong>{email}</strong>. Revisa tu bandeja de entrada o spam.
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
                  disabled={loading}
                  className="glass-btn primary"
                  style={{ padding: '14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  <span>{loading ? 'Enviando...' : 'Enviar instrucciones'}</span>
                  <Key size={16} />
                </button>

                <button 
                  type="button" 
                  onClick={() => { setView('login'); setError(''); }}
                  className="glass-btn secondary"
                  style={{ padding: '10px', width: '100%' }}
                >
                  Cancelar
                </button>
              </>
            )}

          </form>
        )}

        {view === 'reset-password' && (
          /* New Password Input View (from Supabase Auth recovery link) */
          <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {passwordUpdated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center', background: 'rgba(222, 247, 236, 0.6)', border: '1px solid rgba(49, 196, 141, 0.4)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#def7ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0e9f6e' }}>
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', color: '#03543f', marginBottom: '6px' }}>¡Contraseña actualizada!</h3>
                  <p style={{ fontSize: '13px', color: '#046c4e', lineHeight: 1.4 }}>
                    Tu contraseña ha sido modificada con éxito en Supabase Auth. Ya puedes iniciar sesión con tu nueva clave.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setView('login'); setPasswordUpdated(false); setError(''); onNavigate('login'); }}
                  className="glass-btn primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  Iniciar sesión ahora
                </button>
              </div>
            ) : (
              <>
                {/* Nueva Contraseña */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' }}>
                    Nueva contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#9ca3af' }} />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="glass-input"
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' }}>
                    Confirmar nueva contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#9ca3af' }} />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="glass-input"
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="glass-btn primary"
                  style={{ padding: '14px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  <span>{loading ? 'Actualizando...' : 'Guardar nueva contraseña'}</span>
                  <Key size={16} />
                </button>

                <button 
                  type="button" 
                  onClick={() => { setView('login'); setError(''); onNavigate('login'); }}
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
