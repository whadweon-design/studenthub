import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { getSettings } from '../../services/db';
import GlassCard from '../../components/GlassCard';
import LegalModal from '../../components/LegalModal';
import { ArrowLeft, ArrowRight, Shield, User, Mail, Phone, Lock, Eye, EyeOff, Key, CheckSquare, Square, ShieldCheck, ShieldAlert } from 'lucide-react';
import './PublicRegister.css';

const COUNTRY_CODES = [
  { code: '+52', name: 'México', flag: '🇲🇽' },
  { code: '+1', name: 'USA / Canadá', flag: '🇺🇸' },
  { code: '+34', name: 'España', flag: '🇪🇸' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' }
];

const PublicRegister = ({ onNavigate, initialData = {} }) => {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    password: initialData.password || '',
    confirmPassword: initialData.confirmPassword || initialData.password || '',
    phoneCode: initialData.phoneCode || '+52',
    phoneNumber: initialData.phoneNumber || '',
    consent: initialData.consent || false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendFeedback, setResendFeedback] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre completo es obligatorio';
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Introduce un correo electrónico válido';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'El número de teléfono es obligatorio';
    } else if (!/^\d{8,15}$/.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = 'Introduce un número de teléfono válido';
    }

    if (!formData.password) {
      newErrors.password = 'Crea una contraseña para tu cuenta';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.consent) {
      newErrors.consent = 'Debes aceptar los términos y el aviso de privacidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setLoading(true);

    try {
      const fullPhone = `${formData.phoneCode} ${formData.phoneNumber}`.trim();

      // Registro real con Supabase Auth (desencadena trigger handle_new_user -> public.profiles)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}`,
          data: {
            full_name: formData.name.trim(),
            phone: fullPhone
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('User already exists')) {
          throw new Error('Este correo electrónico ya está registrado. Intenta iniciar sesión con tu contraseña.');
        }
        throw new Error(signUpError.message || 'No se pudo registrar la cuenta en Supabase Auth.');
      }

      // Registro aceptado por Supabase. Mostramos tarjeta "Confirma tu correo"
      setEmailSent(true);
    } catch (err) {
      setSubmitError(err.message || 'Error al procesar el registro.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendLoading) return;
    setResendLoading(true);
    setResendFeedback(null);

    try {
      const emailToResend = formData.email.trim();
      if (!emailToResend) {
        throw new Error('No se encontró la dirección de correo para reenviar.');
      }

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

  if (!settings) return null;

  if (emailSent) {
    return (
      <div className="public-register-wrapper fade-in" style={{ maxWidth: '560px', margin: '80px auto' }}>
        <div className="background-auras">
          <div className="aura aura-green" />
          <div className="aura aura-blue" />
        </div>

        <button 
          onClick={() => onNavigate('landing')} 
          className="glass-pill secondary public-register-back-btn"
          style={{ marginBottom: '24px' }}
        >
          <ArrowLeft size={16} />
          <span>Volver a Inicio</span>
        </button>

        <GlassCard tint="neutral" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(222, 247, 236, 0.8)', border: '1px solid rgba(49, 196, 141, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0e9f6e', margin: '0 auto 20px' }}>
            <ShieldCheck size={36} />
          </div>

          <h2 style={{ fontSize: '24px', letterSpacing: '-0.5px', marginBottom: '12px', color: '#111827' }}>
            ¡Registro recibido! Confirma tu correo
          </h2>

          <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
            Hemos enviado un mensaje de confirmación a: <br />
            <strong style={{ color: '#1e429f', wordBreak: 'break-all' }}>{formData.email.trim()}</strong>
          </p>

          <div style={{ background: 'rgba(239, 246, 255, 0.7)', border: '1px solid rgba(191, 219, 254, 0.8)', borderRadius: '16px', padding: '20px', textAlign: 'left', fontSize: '13px', color: '#1e40af', lineHeight: 1.5, marginBottom: '24px' }}>
            <strong>Siguiente paso obligatorio:</strong>
            <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
              <li>Abre tu bandeja de entrada o carpeta de spam.</li>
              <li>Haz clic en el enlace <strong>"Confirm your signup"</strong>.</li>
              <li>Al confirmar, regresarás automáticamente a Student Hub para continuar.</li>
            </ul>
          </div>

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
              marginBottom: '24px',
              textAlign: 'left',
              lineHeight: 1.4
            }}>
              {resendFeedback.type === 'success' ? <ShieldCheck size={18} style={{ flexShrink: 0 }} /> : <ShieldAlert size={18} style={{ flexShrink: 0 }} />}
              <span>{resendFeedback.message}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              type="button"
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="glass-btn secondary"
              style={{ width: '100%', padding: '12px', justifyContent: 'center', opacity: resendLoading ? 0.7 : 1 }}
            >
              <span>{resendLoading ? 'Reenviando correo...' : '¿No recibiste el correo? Reenviar confirmación'}</span>
            </button>

            <button 
              type="button"
              onClick={() => onNavigate('login')} 
              className="glass-btn primary"
              style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
            >
              <span>Ir al Inicio de Sesión</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="public-register-wrapper fade-in">
      
      {/* Background Decorative Auras */}
      <div className="background-auras">
        <div className="aura aura-green" />
        <div className="aura aura-blue" />
        <div className="aura aura-coral" />
      </div>

      {/* Navigation */}
      <button 
        onClick={() => onNavigate('landing')} 
        className="glass-pill secondary public-register-back-btn"
      >
        <ArrowLeft size={16} />
        <span>Volver a Inicio</span>
      </button>

      <div className="public-register-header">
        <span className="glass-pill mint public-register-step-pill">PASO 1 DE 2</span>
        <h1 className="public-register-title">Inscripción al curso</h1>
        <p className="public-register-subtitle">Completa tus datos personales y crea tus credenciales para acceder al aula virtual.</p>
      </div>

      <form onSubmit={handleSubmit} className="public-register-form-grid">
        
        {/* Form panel */}
        <GlassCard tint="neutral" className="public-register-card public-register-form-card">
          
          {submitError && (
            <div style={{ display: 'flex', gap: '10px', background: 'rgba(253, 232, 232, 0.6)', border: '1px solid rgba(249, 128, 128, 0.4)', borderRadius: '12px', padding: '12px', color: '#9b1c1c', fontSize: '13px', marginBottom: '20px', lineHeight: 1.4 }}>
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{submitError}</span>
            </div>
          )}

          <div className="public-register-fields-stack">
            
            {/* Name */}
            <div className="public-register-field-group">
              <label className="public-register-label">
                Nombre completo
              </label>
              <div className="public-register-input-wrapper">
                <User size={18} className="public-register-input-icon" />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Juan Pérez García" 
                  className="glass-input public-register-input"
                />
              </div>
              {errors.name && <span className="public-register-error">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="public-register-field-group">
              <label className="public-register-label">
                Correo electrónico <span className="public-register-label-hint">(Será tu usuario de acceso)</span>
              </label>
              <div className="public-register-input-wrapper">
                <Mail size={18} className="public-register-input-icon" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan.perez@ejemplo.com" 
                  className="glass-input public-register-input"
                />
              </div>
              {errors.email && <span className="public-register-error">{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className="public-register-field-group">
              <label className="public-register-label">
                Número de teléfono
              </label>
              <div className="public-register-phone-row">
                <div className="public-register-phone-code-wrapper">
                  <select
                    name="phoneCode"
                    value={formData.phoneCode}
                    onChange={handleChange}
                    className="glass-input public-register-phone-select"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code} style={{ background: '#f4f6f9' }}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="public-register-input-wrapper public-register-phone-num-wrapper">
                  <Phone size={18} className="public-register-input-icon" />
                  <input 
                    type="tel" 
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="55 1234 5678" 
                    className="glass-input public-register-input"
                  />
                </div>
              </div>
              {errors.phoneNumber && <span className="public-register-error">{errors.phoneNumber}</span>}
            </div>

            {/* Password Section */}
            <div className="public-register-password-box">
              <div className="public-register-password-box-title">
                <Key size={18} />
                <span>Crear contraseña para el Aula Virtual</span>
              </div>
              
              <p className="public-register-password-hint">
                Tu <strong>nombre de usuario</strong> para iniciar sesión será tu correo: <strong className="public-register-email-highlight">{formData.email.trim() || 'tu.correo@ejemplo.com'}</strong>. Podrás ingresar al aula virtual una vez que tu pago pase a <strong>Aprobado</strong> por el administrador.
              </p>

              {/* Password */}
              <div className="public-register-field-group">
                <label className="public-register-sublabel">
                  Contraseña
                </label>
                <div className="public-register-input-wrapper">
                  <Lock size={18} className="public-register-input-icon" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres" 
                    className="glass-input public-register-input public-register-input-pass"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="public-register-eye-btn"
                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="public-register-error">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="public-register-field-group">
                <label className="public-register-sublabel">
                  Confirmar contraseña
                </label>
                <div className="public-register-input-wrapper">
                  <Lock size={18} className="public-register-input-icon" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repite tu contraseña" 
                    className="glass-input public-register-input public-register-input-pass"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="public-register-eye-btn"
                    title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="public-register-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="public-register-consent-group">
              <label className="public-register-consent-label">
                <input 
                  type="checkbox" 
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <div className="public-register-checkbox-icon" style={{ color: formData.consent ? '#3f83f8' : '#9ca3af' }}>
                  {formData.consent ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <span className="public-register-consent-text">
                  Acepto los <a href="#terms" onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }} className="public-register-legal-link">términos del curso</a> y el <a href="#privacy" onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }} className="public-register-legal-link">aviso de privacidad</a>, incluyendo la <a href="#refund" onClick={(e) => { e.preventDefault(); setActiveModal('refund'); }} className="public-register-legal-link">política de cancelación y reembolso</a>.
                </span>
              </label>
              {errors.consent && <span className="public-register-error" style={{ marginTop: '6px' }}>{errors.consent}</span>}
            </div>

            {/* Desktop Submit Button Container */}
            <div className="public-register-desktop-submit-container">
              <div className="public-register-divider" />
              <button 
                type="submit" 
                disabled={loading}
                className="glass-btn primary public-register-submit-btn"
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                <span>{loading ? 'Creando cuenta...' : 'Crear cuenta e inscribirse'}</span>
                <ArrowRight size={18} />
              </button>
            </div>

          </div>
        </GlassCard>

        {/* Course Summary Card */}
        <div className="public-register-summary-wrapper">
          <GlassCard tint="blue" className="public-register-card public-register-summary-card">
            <h3 className="public-register-summary-title">
              Resumen del pedido
            </h3>
            
            <div className="public-register-summary-content">
              <div>
                <div className="public-register-summary-label">Curso</div>
                <div className="public-register-summary-course">
                  {settings.courseName}
                </div>
              </div>

              <div className="public-register-summary-grid">
                <div>
                  <div className="public-register-summary-label">Modalidad</div>
                  <div className="public-register-summary-val">Online / En vivo</div>
                </div>
                <div>
                  <div className="public-register-summary-label">Duración</div>
                  <div className="public-register-summary-val">4 sesiones · 6h</div>
                </div>
              </div>

              <div className="public-register-summary-divider" />

              <div className="public-register-summary-total-row">
                <span className="public-register-summary-total-label">Total a pagar:</span>
                <span className="public-register-summary-price">
                  ${settings.price} MXN
                </span>
              </div>
              
              <div className="public-register-summary-badge">
                <Shield size={20} className="public-register-shield-icon" />
                <span className="public-register-shield-text">
                  Inscripción segura. Tus datos serán tratados de acuerdo a la Ley de Protección de Datos Personales.
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Mobile Submit Button Container */}
          <div className="public-register-mobile-submit-container">
            <button 
              type="submit" 
              disabled={loading}
              className="glass-btn primary public-register-submit-btn"
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              <span>{loading ? 'Creando cuenta...' : 'Crear cuenta e inscribirse'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

      </form>

      {/* Modal for Terms, Privacy Notice & Refund Policy */}
      <LegalModal 
        isOpen={!!activeModal} 
        modalType={activeModal} 
        onClose={() => setActiveModal(null)} 
      />
    </div>
  );
};

export default PublicRegister;
