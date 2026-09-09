import React, { useState, useEffect } from 'react';
import { getSettings } from '../../services/db';
import GlassCard from '../../components/GlassCard';
import LegalModal from '../../components/LegalModal';
import { ArrowLeft, ArrowRight, Shield, User, Mail, Phone, Lock, Eye, EyeOff, Key, CheckSquare, Square } from 'lucide-react';
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

const PublicRegister = ({ onNavigate, onRegisterSubmit, initialData = {} }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const fullPhone = `${formData.phoneCode} ${formData.phoneNumber}`;
      onRegisterSubmit({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: fullPhone,
        rawPhone: formData.phoneNumber,
        phoneCode: formData.phoneCode
      });
    }
  };

  if (!settings) return null;

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
        
        {/* Form panel (Left on desktop, top on mobile) */}
        <GlassCard tint="neutral" className="public-register-card public-register-form-card">
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
                className="glass-btn primary public-register-submit-btn"
              >
                <span>Continuar al pago</span>
                <ArrowRight size={18} />
              </button>
            </div>

          </div>
        </GlassCard>

        {/* Course Summary Card (Right on desktop, below form on mobile) */}
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
              className="glass-btn primary public-register-submit-btn"
            >
              <span>Continuar al pago</span>
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
