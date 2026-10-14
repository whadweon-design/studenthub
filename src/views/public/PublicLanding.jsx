import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { getSettings } from '../../services/db';
import { OFFICIAL_PAYMENT_CONFIG } from '../../config/paymentConfig';
import { OFFICIAL_COURSE_SCHEDULE } from '../../config/courseSchedule';
import GlassCard from '../../components/GlassCard';
import LegalModal from '../../components/LegalModal';
import logoImg from '../../assets/logo-nobg.png';
import { Calendar, Clock, Monitor, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import './PublicLanding.css';

const PublicLanding = ({ onNavigate, onEnterLogin }) => {
  const [settings, setSettings] = useState(null);
  const [coursePrice, setCoursePrice] = useState(OFFICIAL_PAYMENT_CONFIG.officialPrice);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    setSettings(getSettings());

    let isMounted = true;
    supabase
      .from('courses')
      .select('price')
      .eq('slug', OFFICIAL_PAYMENT_CONFIG.courseSlug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!isMounted || error || !data) return;
        const verifiedPrice = Number(data.price);
        if (!isNaN(verifiedPrice) && verifiedPrice > 0) {
          setCoursePrice(verifiedPrice);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!settings) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="glass-panel mint" style={{ padding: '40px', fontSize: '18px', fontWeight: 600 }}>Cargando convocatoria...</div>
      </div>
    );
  }

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
        <div className="public-landing-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={logoImg} 
            alt="Student Hub Logo" 
            style={{ width: '42px', height: '42px', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(63, 131, 248, 0.3))' }} 
          />
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
            INICIO OFICIAL: LUNES 26 DE OCTUBRE DE 2026
          </span>
          <h1 className="public-landing-hero-title">
            {OFFICIAL_COURSE_SCHEDULE.courseName}
          </h1>
          <h2 className="public-landing-hero-subtitle">
            Potencia tu forma de estudiar, crear y trabajar con IA.
          </h2>
          <p className="public-landing-hero-desc">
            {OFFICIAL_COURSE_SCHEDULE.courseDescription}
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
              width: '125px',
              height: '125px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(49, 196, 141, 0.25), rgba(63, 131, 248, 0.25))',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              boxShadow: '0 10px 30px rgba(63, 131, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <img 
                src={logoImg} 
                alt="Student Hub" 
                style={{ width: '90px', height: '90px', objectFit: 'contain', filter: 'drop-shadow(0 8px 15px rgba(63, 131, 248, 0.3))' }} 
              />
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
              ${coursePrice} <span style={{ fontSize: '18px', fontWeight: 600, color: '#4b5563' }}>MXN</span>
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

          <div style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.55)', border: '1px solid rgba(255, 255, 255, 0.8)', textAlign: 'center', fontSize: '13px', color: '#1f2937', lineHeight: 1.45 }}>
            <div><strong>Inicio:</strong> {OFFICIAL_COURSE_SCHEDULE.officialStartDateLabel}</div>
            <div style={{ color: '#1e429f', fontWeight: 600, marginTop: '2px' }}>
              {OFFICIAL_COURSE_SCHEDULE.scheduleRangeLabel} · {OFFICIAL_COURSE_SCHEDULE.timezoneLabel}
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
            <h3 style={{ fontSize: '18px' }}>4 Sesiones en Vivo</h3>
          </div>
          <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.5 }}>
            Lunes 26, miércoles 28 y viernes 30 de octubre, y lunes 2 de noviembre de 2026.
          </p>
        </GlassCard>

        <GlassCard tint="blue">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.8)', color: '#3f83f8' }}>
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '18px' }}>7:00 PM a 8:30 PM</h3>
          </div>
          <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.5 }}>
            1h 30m por sesión (hora de Ciudad de México), enfocadas al desarrollo de habilidades prácticas reales.
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
          Inicio oficial: {OFFICIAL_COURSE_SCHEDULE.officialStartDateLabel} · {OFFICIAL_COURSE_SCHEDULE.scheduleRangeLabel} ({OFFICIAL_COURSE_SCHEDULE.timezoneLabel})
        </p>

        <div className="public-landing-sessions-list">
          {OFFICIAL_COURSE_SCHEDULE.sessions.map((session, index) => (
            <GlassCard
              key={session.id}
              tint={index % 2 === 0 ? 'mint' : 'blue'}
              className="public-landing-session-card"
            >
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: index % 2 === 0 ? '#14532d' : '#1e429f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {session.name} — {session.day} {session.date}
                </span>
                <h3 style={{ fontSize: '20px', marginTop: '4px', marginBottom: '6px' }}>{session.title}</h3>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>{session.description}</p>
              </div>

              <div className="glass-panel" style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                  {session.fullDateLabel}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e429f', marginTop: '2px' }}>
                  {session.time} ({session.timezoneLabel})
                </div>
              </div>
            </GlassCard>
          ))}
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
          <span>Asegurar mi lugar por ${coursePrice} MXN</span>
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
