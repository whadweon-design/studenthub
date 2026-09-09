import React from 'react';
import GlassCard from './GlassCard';
import { X, FileText, Shield, HelpCircle } from 'lucide-react';

const LegalModal = ({ isOpen, onClose, modalType }) => {
  if (!isOpen) return null;

  const getContent = () => {
    switch (modalType) {
      case 'terms':
        return {
          title: 'Términos y Condiciones del Curso',
          icon: <FileText size={24} style={{ color: '#3f83f8' }} />,
          badgeBg: 'rgba(63, 131, 248, 0.12)',
          paragraphs: [
            'Al inscribirte, obtienes acceso de por vida a todas las grabaciones de las sesiones en vivo y al material del curso para repasarlo cuando quieras.',
            'La inasistencia a las sesiones en vivo no dará derecho a reembolsos parciales ni totales. El contenido grabado estará siempre disponible en el aula virtual para tu consulta.'
          ]
        };
      case 'privacy':
        return {
          title: 'Aviso de Privacidad',
          icon: <Shield size={24} style={{ color: '#31c48d' }} />,
          badgeBg: 'rgba(49, 196, 141, 0.12)',
          paragraphs: [
            'Tus datos personales se recaban e información se almacena de forma local y segura con fines de gestión académica y de acceso al aula virtual. Garantizamos la confidencialidad y el uso protegido de tu información personal.'
          ]
        };
      case 'refund':
        return {
          title: 'Política de Cancelación y Reembolso',
          icon: <HelpCircle size={24} style={{ color: '#f98080' }} />,
          badgeBg: 'rgba(249, 128, 128, 0.12)',
          paragraphs: [
            'La inasistencia a las sesiones en vivo no dará derecho a reembolsos parciales ni totales. El contenido grabado estará siempre disponible en el aula virtual para tu consulta.'
          ]
        };
      default:
        return null;
    }
  };

  const data = getContent();
  if (!data) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '520px' }}
      >
        <GlassCard tint="neutral" style={{ padding: '28px', background: 'rgba(255, 255, 255, 0.94)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '12px',
                background: data.badgeBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {data.icon}
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111827' }}>
                {data.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', color: '#374151', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
            {data.paragraphs.map((p, idx) => (
              <p key={idx} style={{ margin: 0 }}>{p}</p>
            ))}
          </div>

          {/* Footer CTA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              className="glass-btn primary"
              style={{ padding: '10px 24px', fontSize: '14px', width: '100%', justifyContent: 'center' }}
            >
              Entendido
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default LegalModal;
