import React, { useEffect, useState } from 'react';
import { getSettings } from '../../services/db';
import GlassCard from '../../components/GlassCard';
import LegalModal from '../../components/LegalModal';
import { Calendar, Clock, Monitor, BookOpen, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import './PublicLanding.css';

const PublicLanding = ({ onNavigate, onEnterLogin }) => {
  const [settings, setSettings] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  if (!settings) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="glass-panel mint" style={{ padding: '40px', fontSize: '18px', fontWeight: 600 }}>Cargando convocatoria...</div>
      </div>
    );
  }

  // Format dates text
  const renderDatesInfo = () => {
    const hasDates = settings.sessions.some(s => s.date !== '');
    if (!hasDates) {
      return 'Fechas por confirmar · Próxima edición próximamente';
    }
    return 'Fechas programadas';
  };

  return (
    <div className="fade-in public-landing-wrapper">
      
      {/* Background Decorative Auras */}
      <div className="background-auras">
        <div className="aura aura-green" />
        <div className="aura aura-blue" />
        <div className="aura aura-coral" />
        <div className="aura aura-yellow" />
      </div>

      {/* Header section */}
      <div className="public-landing-header">
        <div className="public-landing-logo">
          <div className="public-landing-logo-icon">
            <BookOpen style={{ color: '#fff', width: '22px', height: '22px' }} />
          </div>
          <span className="public-landing-logo-text">Convocatoria <span style={{ color: '#3f83f8' }}>Student Hub</span></span>
        </div>
        
        <button onClick={onEnterLogin} className="glass-pill blue" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={15} />
          <span>Ingreso Alumnos</span>
        </button>
      </div>

      {/* Hero section */}
      <div className="public-landing-hero-grid">
        <div className="public-landing-hero-content">
          <span className="glass-pill mint public-landing-pill-badge">
            NUEVA EDICIÓN REGISTROS ABIERTOS
          </span>
          <h1 className="public-landing-hero-title">
            {settings.courseName}
          </h1>
          <p className="public-landing-hero-desc">
            {settings.courseDescription}
          </p>

          <div className="public-landing-cta-group">
            <button 
              onClick={() => onNavigate('register')} 
              className="glass-btn primary"
              style={{ padding: '16px 36px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <span>Inscribirme al curso</span>
              <ArrowRight size={18} />
            </button>
            <a href="#syllabus" className="glass-btn secondary" style={{ padding: '16px 28px', fontSize: '16px' }}>
              Ver temario
            </a>
          </div>
        </div>

        {/* Floating Glass Display Card */}
        <GlassCard tint="multi" className="public-landing-investment-card">
          <div className="public-landing-card-circle-wrapper">
            {/* Elegant glass design circle */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(49, 196, 141, 0.45), rgba(63, 131, 248, 0.45))',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              boxShadow: '0 10px 30px rgba(63, 131, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <BookOpen size={48} style={{ color: '#1e429f' }} />
            </div>
            <div style={{
              position: 'absolute',
              top: '5px',
              right: '25%',
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              background: 'rgba(253, 232, 232, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(5px)'
            }}>
              <ShieldCheck size={20} style={{ color: '#9b1c1c' }} />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className="public-landing-card-price-title">Inversión Única</div>
            <div className="public-landing-card-price-value">
              ${settings.price} <span style={{ fontSize: '18px', fontWeight: 600, color: '#4b5563' }}>MXN</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.4)' }} />

          <div className="public-landing-card-modality-grid">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: '18px', color: '#111827' }}>Online</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Modalidad en vivo</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: '18px', color: '#111827' }}>6 horas</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Capacitación total</div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Info grids */}
      <div className="public-landing-features-grid">
        <GlassCard tint="mint">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.8)', color: '#31c48d' }}>
              <Calendar size={22} />
            </div>
            <h3 style={{ fontSize: '18px' }}>4 Sesiones</h3>
          </div>
          <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.5 }}>
            Diseñado en sesiones dinámicas de lunes, miércoles y viernes para una asimilación práctica.
          </p>
        </GlassCard>

        <GlassCard tint="blue">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.8)', color: '#3f83f8' }}>
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '18px' }}>1h 30m por sesión</h3>
          </div>
          <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.5 }}>
            Tiempo ideal enfocado al desarrollo de habilidades prácticas reales sin aburrirte.
          </p>
        </GlassCard>

        <GlassCard tint="coral">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.8)', color: '#f98080' }}>
              <Monitor size={22} />
            </div>
            <h3 style={{ fontSize: '18px' }}>Capacitación total</h3>
          </div>
          <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.5 }}>
            Plataforma virtual, grabaciones en HD, plantillas descargables, actividades y recursos listos.
          </p>
        </GlassCard>
      </div>

      {/* Syllabus / Dates section */}
      <div id="syllabus" className="public-landing-syllabus-section">
        <h2 className="public-landing-section-title">Estructura del Curso</h2>
        <p className="public-landing-section-subtitle">
          {renderDatesInfo()}
        </p>

        <div className="public-landing-sessions-list">
          {(() => {
            const OFFICIAL_TITLES = [
              'Descubriendo la IA: ¿Qué es y cómo funciona en realidad',
              'Ingeniería de Prompts para Estudiantes: Estudia y Trabaja',
              'Creatividad Digital: Generación de Imágenes y Presentaciones',
              'El Futuro y Tu Proyecto Final: La IA en la Vida Profesional'
            ];
            return settings.sessions.map((session, index) => {
              const hasDateConfig = session.date !== '';
              const officialTitle = OFFICIAL_TITLES[index] || session.title;
              return (
                <GlassCard 
                  key={session.id} 
                  tint={index % 2 === 0 ? 'mint' : 'blue'}
                  className="public-landing-session-card"
                >
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: index % 2 === 0 ? '#14532d' : '#1e429f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {session.name} — {session.day}
                    </span>
                    <h3 style={{ fontSize: '20px', marginTop: '4px', marginBottom: '6px' }}>{officialTitle}</h3>
                    <p style={{ fontSize: '14px', color: '#4b5563' }}>Duración: 1h 30m · Materiales e IA aplicados</p>
                  </div>
                  
                  <div className="glass-panel" style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                      {hasDateConfig ? `${session.date} a las ${session.time}` : 'Fecha por confirmar'}
                    </span>
                  </div>
                </GlassCard>
              );
            });
          })()}
        </div>
      </div>

      {/* CTA Footer banner */}
      <GlassCard tint="multi" className="public-landing-cta-banner">
        <h2 className="public-landing-section-title" style={{ marginBottom: '16px' }}>Empieza a utilizar IA como ventaja académica</h2>
        <p style={{ maxWidth: '600px', margin: '0 auto 32px auto', color: '#4b5563', lineHeight: 1.6 }}>
          Domina herramientas de productividad y marca la diferencia en tus proyectos, investigaciones y trabajos universitarios.
        </p>
        <button 
          onClick={() => onNavigate('register')}
          className="glass-btn primary"
          style={{ padding: '16px 40px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
        >
          <span>Asegurar mi lugar por ${settings.price} MXN</span>
          <ArrowRight size={18} />
        </button>
      </GlassCard>
      
      {/* Footer information links */}
      <div className="public-landing-footer">
        <div className="public-landing-footer-links">
          <a href="#privacy" onClick={(e) => { e.preventDefault(); setActiveModal('privacy'); }} style={{ color: '#6b7280', textDecoration: 'none' }}>Aviso de Privacidad</a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }} style={{ color: '#6b7280', textDecoration: 'none' }}>Términos del Curso</a>
          <a href="#refund" onClick={(e) => { e.preventDefault(); setActiveModal('refund'); }} style={{ color: '#6b7280', textDecoration: 'none' }}>Política de Reembolso</a>
        </div>
        <p>© 2026 Convocatoria Student Hub. Todos los derechos reservados.</p>
      </div>

      {/* Modal for Terms, Privacy Notice & Refund Policy */}
      <LegalModal 
        isOpen={!!activeModal} 
        modalType={activeModal} 
        onClose={() => setActiveModal(null)} 
      />
    </div>
  );
};

export default PublicLanding;
