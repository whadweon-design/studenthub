import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { getSettings } from '../../services/db';
import GlassCard from '../../components/GlassCard';
import { ArrowLeft, Check, Clipboard, Send, Upload, Smartphone, ShieldAlert } from 'lucide-react';

const PublicPayment = ({ onNavigate, studentData, currentUser, onPaymentSubmit }) => {
  const [settings, setSettings] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [declaredTransfer, setDeclaredTransfer] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getWhatsAppLink = () => {
    if (!settings) return '#';
    const cleanNumber = settings.whatsappNumber ? settings.whatsappNumber.replace(/[+\s-]/g, '') : '5641439566';
    const message = `Hola, realicé mi inscripción al curso LEVEL UP.\n\nNombre: ${studentData?.name || currentUser?.name || ''}\nCorreo: ${studentData?.email || currentUser?.email || ''}\nTeléfono: ${studentData?.phone || currentUser?.phone || ''}\nImporte: $${settings.price || '950'} MXN\n\nAdjunto mi comprobante de pago.`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleWhatsAppClick = () => {
    // Abrir WhatsApp en una nueva pestaña. NO altera la base de datos ni el estado de inscripción.
    window.open(getWhatsAppLink(), '_blank');
  };

  const handleConfirmWhatsAppSent = async () => {
    if (submitting) return;

    if (!declaredTransfer) {
      setError('Por favor marca la casilla declarando que realizaste la transferencia y enviaste tu comprobante.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Obtener usuario autenticado de Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        throw new Error('No se pudo verificar la sesión activa. Por favor vuelve a iniciar sesión.');
      }
      const sbUser = authData.user;

      // 2. Obtener el UUID real del curso LEVEL UP
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', 'level-up')
        .maybeSingle();

      if (courseError || !courseData) {
        throw new Error('No se pudo obtener la información del curso LEVEL UP desde Supabase.');
      }

      // 3. Ejecutar el UPDATE estricto en public.enrollments
      // NOTA CRÍTICA DE SEGURIDAD: El trigger real enforce_enrollment_update_rules() prohíbe al estudiante
      // modificar submitted_at, processed_at, processed_by, created_at o updated_at.
      // El payload debe contener EXCLUSIVAMENTE status y payment_method.
      const { data: updatedRows, error: updateError } = await supabase
        .from('enrollments')
        .update({
          status: 'PENDIENTE_VALIDACION',
          payment_method: 'Transferencia (WhatsApp)'
        })
        .eq('user_id', sbUser.id)
        .eq('course_id', courseData.id)
        .eq('status', 'REGISTRO_INICIADO')
        .select('id, status');

      if (updateError) {
        console.error('Error al actualizar estado de inscripción en Supabase:', updateError);
        throw new Error(`Error de base de datos: ${updateError.message || 'No se pudo registrar la confirmación del pago.'}`);
      }

      // 4. Verificación estricta: Exigir exactamente 1 fila actualizada con status 'PENDIENTE_VALIDACION'
      if (!updatedRows || updatedRows.length !== 1 || updatedRows[0].status !== 'PENDIENTE_VALIDACION') {
        throw new Error('No se encontró una inscripción en estado REGISTRO_INICIADO para actualizar. Es posible que el estado ya haya cambiado.');
      }

      // 5. Éxito confirmado por la respuesta de Supabase
      onPaymentSubmit({
        status: 'PENDIENTE_VALIDACION',
        enrollmentId: updatedRows[0].id
      });
    } catch (err) {
      console.error('Error en confirmación de pago:', err);
      setError(err.message || 'Error al procesar la confirmación del pago.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      
      {/* Background Auras */}
      <div className="background-auras">
        <div className="aura aura-green" />
        <div className="aura aura-blue" />
        <div className="aura aura-coral" />
      </div>

      {/* Navigation */}
      <button 
        onClick={() => onNavigate('landing')} 
        className="glass-pill secondary" 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}
      >
        <ArrowLeft size={16} />
        <span>Ir a Inicio</span>
      </button>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="glass-pill blue" style={{ marginBottom: '12px', pointerEvents: 'none' }}>PASO 2 DE 2</span>
        <h1 style={{ fontSize: '32px', letterSpacing: '-0.8px', marginBottom: '8px' }}>Método de pago</h1>
        <p style={{ color: '#6b7280' }}>Realiza la transferencia bancaria y envía tu comprobante para validación.</p>
      </div>

      {error && (
        <div style={{ display: 'flex', gap: '10px', background: 'rgba(253, 232, 232, 0.7)', border: '1px solid rgba(249, 128, 128, 0.4)', borderRadius: '12px', padding: '14px', color: '#9b1c1c', fontSize: '13px', marginBottom: '24px', lineHeight: 1.4 }}>
          <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      {/* Payment Information Card */}
      <GlassCard tint="blue" style={{ padding: '30px', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.4)', paddingBottom: '10px' }}>
          Instrucciones de Transferencia Bancaria
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Bank */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Banco</span>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{settings.bankName || 'Por configurar'}</div>
            </div>
            <button 
              onClick={() => copyToClipboard(settings.bankName, 'bank')} 
              className="glass-pill" 
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              {copiedField === 'bank' ? <Check size={14} /> : <Clipboard size={14} />}
            </button>
          </div>

          {/* Beneficiary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Beneficiario</span>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{settings.bankBeneficiary || 'Por configurar'}</div>
            </div>
            <button 
              onClick={() => copyToClipboard(settings.bankBeneficiary, 'beneficiary')} 
              className="glass-pill" 
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              {copiedField === 'beneficiary' ? <Check size={14} /> : <Clipboard size={14} />}
            </button>
          </div>

          {/* CLABE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>CLABE</span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '0.5px' }}>{settings.bankClabe || 'Por configurar'}</div>
            </div>
            <button 
              onClick={() => copyToClipboard(settings.bankClabe, 'clabe')} 
              className="glass-pill" 
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              {copiedField === 'clabe' ? <Check size={14} /> : <Clipboard size={14} />}
            </button>
          </div>

          {/* Account */}
          {settings.bankAccount && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Número de Cuenta</span>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{settings.bankAccount}</div>
              </div>
              <button 
                onClick={() => copyToClipboard(settings.bankAccount, 'account')} 
                className="glass-pill" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {copiedField === 'account' ? <Check size={14} /> : <Clipboard size={14} />}
              </button>
            </div>
          )}

          {/* Concept */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Concepto sugerido</span>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                {studentData?.name || currentUser?.name || (settings.bankConcept || 'Nombre Completo del Alumno')}
              </div>
              <span style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic', marginTop: '2px', display: 'block' }}>
                (Utiliza tu <strong>Nombre Completo</strong> como concepto al hacer la transferencia)
              </span>
            </div>
            <button 
              onClick={() => copyToClipboard(studentData?.name || currentUser?.name || settings.bankConcept || 'Nombre Completo del Alumno', 'concept')} 
              className="glass-pill" 
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              {copiedField === 'concept' ? <Check size={14} /> : <Clipboard size={14} />}
            </button>
          </div>

          {/* WhatsApp Administrativo */}
          {settings.whatsappNumber && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>WhatsApp Administrativo</span>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{settings.whatsappNumber}</div>
              </div>
              <button 
                onClick={() => copyToClipboard(settings.whatsappNumber, 'whatsapp')} 
                className="glass-pill" 
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {copiedField === 'whatsapp' ? <Check size={14} /> : <Clipboard size={14} />}
              </button>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
            <span style={{ fontWeight: 600, color: '#374151' }}>Monto exacto a transferir:</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#1e429f' }}>${settings.price} MXN</span>
          </div>

        </div>
      </GlassCard>

      {/* Confirmation Options Container */}
      <h3 style={{ fontSize: '18px', marginBottom: '18px', textAlign: 'center' }}>Confirmación de Pago</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Option A: WhatsApp */}
        <GlassCard tint="mint" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#03543f', fontWeight: 700, fontSize: '16px', marginBottom: '10px' }}>
              <Smartphone size={20} />
              <span>Opción A: Notificación por WhatsApp</span>
            </div>
            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}>
              Envía tu comprobante de transferencia al WhatsApp administrativo (<strong>{settings.whatsappNumber || '5641439566'}</strong>).
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              type="button"
              onClick={handleWhatsAppClick}
              className="glass-pill mint" 
              style={{ width: '100%', padding: '12px', justifyContent: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.8)' }}
            >
              <Send size={15} />
              <span>1. Abrir WhatsApp ({settings.whatsappNumber || '5641439566'})</span>
            </button>

            {/* Declaración explícita obligatoria */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#1f2937', cursor: 'pointer', background: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.7)' }}>
              <input 
                type="checkbox"
                checked={declaredTransfer}
                onChange={(e) => setDeclaredTransfer(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <span>Declaro que realicé la transferencia bancaria y envié mi comprobante por WhatsApp.</span>
            </label>

            <button 
              type="button"
              onClick={handleConfirmWhatsAppSent}
              disabled={submitting || !declaredTransfer}
              className="glass-btn primary"
              style={{ width: '100%', padding: '12px', fontSize: '13px', opacity: (submitting || !declaredTransfer) ? 0.6 : 1, cursor: (submitting || !declaredTransfer) ? 'not-allowed' : 'pointer' }}
            >
              <span>{submitting ? 'Registrando en Supabase...' : '2. Confirmar declaración de pago'}</span>
            </button>
          </div>
        </GlassCard>

        {/* Option B: Upload Comprobante (Temporariamente Deshabilitado) */}
        <GlassCard tint="neutral" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between', opacity: 0.85 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontWeight: 700, fontSize: '16px', marginBottom: '10px' }}>
              <Upload size={20} />
              <span>Opción B: Subida directa</span>
            </div>
            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}>
              La carga directa de archivos se encuentra en mantenimiento técnico para configurar almacenamiento privado seguro.
            </p>
          </div>

          <div style={{ background: 'rgba(239, 246, 255, 0.8)', border: '1px solid rgba(191, 219, 254, 0.9)', borderRadius: '12px', padding: '14px', fontSize: '12px', color: '#1e40af', lineHeight: 1.4 }}>
            Por favor utiliza la <strong>Opción A (WhatsApp)</strong> para notificar tu transferencia bancaria a la administración.
          </div>
        </GlassCard>

      </div>

    </div>
  );
};

export default PublicPayment;
