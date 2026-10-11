import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import GlassCard from '../../components/GlassCard';
import { RefreshCw, CheckCircle, Clock, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

const PublicStatus = ({ enrollmentId, currentUser, onNavigate }) => {
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEnrollmentFromSupabase = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Obtener usuario autenticado de Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        throw new Error('No se pudo verificar la sesión de usuario. Inicia sesión nuevamente.');
      }
      const sbUser = authData.user;

      // 2. Obtener el UUID real del curso LEVEL UP
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', 'level-up')
        .maybeSingle();

      if (courseError || !courseData) {
        throw new Error('No se pudo obtener la información del curso LEVEL UP.');
      }

      // 3. Consultar la inscripción real desde public.enrollments
      const { data: realEnrollment, error: queryError } = await supabase
        .from('enrollments')
        .select('id, status, payment_method, submitted_at')
        .eq('user_id', sbUser.id)
        .eq('course_id', courseData.id)
        .maybeSingle();

      if (queryError) {
        console.error('Error al consultar estado de inscripción en Supabase:', queryError);
        throw new Error(`Error de base de datos: ${queryError.message}`);
      }

      if (!realEnrollment) {
        throw new Error('No se encontró una inscripción registrada para tu usuario en Supabase.');
      }

      setEnrollment({
        id: realEnrollment.id,
        status: realEnrollment.status,
        paymentMethod: realEnrollment.payment_method || 'Transferencia (WhatsApp)',
        submittedAt: realEnrollment.submitted_at,
        name: currentUser?.name || sbUser.email,
        email: sbUser.email,
        courseName: 'LEVEL UP: IA para Estudiantes',
        price: 950
      });
    } catch (err) {
      console.error('Error al consultar estado:', err);
      setError(err.message || 'Error al obtener el estado de tu inscripción.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchEnrollmentFromSupabase();
  }, [fetchEnrollmentFromSupabase]);

  if (loading && !enrollment) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="glass-panel blue" style={{ padding: '40px', fontSize: '16px', fontWeight: 600, textAlign: 'center' }}>
          Consultando estado real en Supabase...
        </div>
      </div>
    );
  }

  if (error && !enrollment) {
    return (
      <div style={{ width: '100%', maxWidth: '600px', margin: '60px auto', padding: '20px' }}>
        <GlassCard tint="coral" style={{ padding: '36px', textAlign: 'center' }}>
          <ShieldAlert size={48} style={{ color: '#b91c1c', margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '22px', marginBottom: '12px' }}>Error al consultar inscripción</h2>
          <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={fetchEnrollmentFromSupabase}
            className="glass-btn primary"
            style={{ padding: '12px 24px' }}
          >
            Reintentar consulta
          </button>
        </GlassCard>
      </div>
    );
  }

  const status = enrollment?.status || 'REGISTRO_INICIADO';
  const isApproved = status === 'APROBADA';

  const renderStatusBadge = () => {
    switch (status) {
      case 'PENDIENTE_VALIDACION':
      case 'PENDIENTE DE VALIDACIÓN ADMINISTRATIVA':
        return (
          <div className="glass-panel blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', color: '#1e429f', fontWeight: 700 }}>
            <Clock size={16} />
            <span>PENDIENTE DE VALIDACIÓN ADMINISTRATIVA</span>
          </div>
        );
      case 'APROBADA':
        return (
          <div className="glass-panel mint" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', color: '#03543f', fontWeight: 700 }}>
            <CheckCircle size={16} />
            <span>APROBADA</span>
          </div>
        );
      case 'RECHAZADA':
        return (
          <div className="glass-panel coral" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', color: '#9b1c1c', fontWeight: 700 }}>
            <AlertTriangle size={16} />
            <span>RECHAZADA</span>
          </div>
        );
      case 'REGISTRO_INICIADO':
      case 'PAGO_PENDIENTE':
      default:
        return (
          <div className="glass-panel blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', color: '#1e429f', fontWeight: 700 }}>
            <Clock size={16} />
            <span>REGISTRO INICIADO / PAGO PENDIENTE</span>
          </div>
        );
    }
  };

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
              : 'Estamos verificando tu declaración de pago. En cuanto sea validada por administración (ESTADO: APROBADA), podrás acceder al Aula Virtual.'
            }
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(253, 232, 232, 0.6)', border: '1px solid rgba(249, 128, 128, 0.4)', borderRadius: '12px', padding: '12px', color: '#9b1c1c', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Enrollment Summary info */}
        <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.5)', padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Alumno:</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{enrollment?.name}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Curso:</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{enrollment?.courseName}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Importe:</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>${enrollment?.price} MXN</span>
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
            <div><strong>Usuario (Correo):</strong> {enrollment?.email}</div>
            <div><strong>Contraseña:</strong> La que creaste durante tu proceso de inscripción</div>
          </div>
        )}

        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.4)' }} />

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isApproved ? (
            <>
              <button 
                onClick={fetchEnrollmentFromSupabase}
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
