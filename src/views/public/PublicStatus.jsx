import React, { useState, useEffect } from 'react';
import { getEnrollments } from '../../services/db';
import GlassCard from '../../components/GlassCard';
import { RefreshCw, CheckCircle, Clock, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

const PublicStatus = ({ enrollmentId, onNavigate }) => {
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEnrollment = () => {
    setLoading(true);
    setTimeout(() => {
      const enrollments = getEnrollments();
      const match = enrollments.find(e => e.id === enrollmentId);
      if (match) {
        setEnrollment(match);
      }
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    fetchEnrollment();
  }, [enrollmentId]);

  if (!enrollment) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="glass-panel blue" style={{ padding: '40px', fontSize: '18px', fontWeight: 600 }}>Cargando datos de registro...</div>
      </div>
    );
  }

  const renderStatusBadge = () => {
    switch (enrollment.status) {
      case 'PENDIENTE DE VALIDACIÓN ADMINISTRATIVA':
      case 'PENDIENTE DE VALIDACIÓN':
      case 'Pago en validación':
      case 'En validación':
        return (
          <div className="glass-panel blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', color: '#1e429f', fontWeight: 700 }}>
            <Clock size={16} />
            <span>PENDIENTE DE VALIDACIÓN ADMINISTRATIVA</span>
          </div>
        );
      case 'APROBADA':
      case 'Pago aprobado':
      case 'Inscripción activa':
        return (
          <div className="glass-panel mint" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', color: '#03543f', fontWeight: 700 }}>
            <CheckCircle size={16} />
            <span>APROBADA</span>
          </div>
        );
      case 'RECHAZADA':
      case 'Rechazado / requiere revisión':
        return (
          <div className="glass-panel coral" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', color: '#9b1c1c', fontWeight: 700 }}>
            <AlertTriangle size={16} />
            <span>RECHAZADA</span>
          </div>
        );
      default:
        return <span>{enrollment.status}</span>;
    }
  };

  const isApproved = enrollment.status === 'APROBADA' || enrollment.status === 'Pago aprobado' || enrollment.status === 'Inscripción activa';

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '600px', margin: '60px auto', padding: '20px' }}>
      
      {/* Background Auras */}
      <div className="background-auras">
        <div className="aura aura-blue" />
        <div className="aura aura-green" />
      </div>

      <GlassCard tint={isApproved ? 'mint' : 'blue'} style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* State Icon */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {isApproved ? (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(222, 247, 236, 0.8)', border: '2px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#31c48d', boxShadow: '0 8px 25px rgba(49, 196, 141, 0.2)' }}>
              <CheckCircle size={40} />
            </div>
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(225, 239, 254, 0.8)', border: '2px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f83f8', boxShadow: '0 8px 25px rgba(63, 131, 248, 0.2)' }}>
              <Clock size={40} />
            </div>
          )}
        </div>

        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            {isApproved ? '¡Tu registro ha sido aprobado!' : '¡Registro recibido con éxito!'}
          </h1>
          <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.6 }}>
            {isApproved 
              ? 'Ya tienes acceso completo al Aula Virtual. Utiliza tu correo electrónico y la contraseña que creaste durante tu inscripción para iniciar sesión.'
              : 'Estamos verificando tu comprobante de pago. En cuanto sea validado por administración (ESTADO: Aprobado), podrás acceder al Aula Virtual con tu correo y tu contraseña.'
            }
          </p>
        </div>

        {/* Enrollment Summary info */}
        <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.5)', padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Alumno:</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{enrollment.name}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Curso:</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{enrollment.courseName}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Importe:</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>${enrollment.price} MXN</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Estado:</span>
            <div>{renderStatusBadge()}</div>
          </div>
        </div>

        {/* Approved student credential instruction */}
        {isApproved && (
          <div style={{ background: 'rgba(222, 247, 236, 0.4)', borderRadius: '16px', border: '1px solid rgba(49, 196, 141, 0.2)', padding: '16px', fontSize: '14px', color: '#03543f', textAlign: 'left' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>Credenciales de acceso al Aula Virtual:</div>
            <div><strong>Usuario (Correo):</strong> {enrollment.email}</div>
            <div><strong>Contraseña:</strong> La que creaste durante tu proceso de inscripción</div>
          </div>
        )}

        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.4)' }} />

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isApproved ? (
            <>
              <button 
                onClick={fetchEnrollment}
                disabled={loading}
                className="glass-btn secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
              >
                <RefreshCw size={15} className={loading ? 'spin-animation' : ''} />
                <span>{loading ? 'Consultando...' : 'Actualizar Estado'}</span>
              </button>
              
              <button 
                onClick={() => onNavigate('landing')}
                className="glass-btn secondary"
              >
                Volver a inicio
              </button>
            </>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              className="glass-btn primary"
              style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span>Ingresar al Aula Virtual</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Simulated verification tip */}
        {!isApproved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.4)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.6)', color: '#4b5563', fontSize: '12px', textAlign: 'left' }}>
            <ShieldAlert size={18} style={{ color: '#3f83f8', flexShrink: 0 }} />
            <span>
              <strong>Modo de Prueba:</strong> Abre el menú de <strong>Administración</strong> en la esquina inferior para ver los registros recibidos y aprobar esta solicitud manualmente.
            </span>
          </div>
        )}

      </GlassCard>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>

    </div>
  );
};

export default PublicStatus;
