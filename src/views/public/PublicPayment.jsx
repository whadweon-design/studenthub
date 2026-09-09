import React, { useState, useEffect } from 'react';
import { getSettings } from '../../services/db';
import GlassCard from '../../components/GlassCard';
import { ArrowLeft, Check, Clipboard, Send, Upload, FileText, Smartphone } from 'lucide-react';

const PublicPayment = ({ onNavigate, studentData, onPaymentSubmit }) => {
  const [settings, setSettings] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Solo se aceptan comprobantes en formato JPG, PNG o PDF');
      return;
    }

    setUploading(true);
    // Convert to Base64 to save in localStorage database mock
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedFile({
        name: file.name,
        type: file.type,
        data: reader.result // base64 string
      });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const [waOpened, setWaOpened] = useState(false);

  const getWhatsAppLink = () => {
    if (!settings) return '#';
    const cleanNumber = settings.whatsappNumber.replace(/[+\s-]/g, '');
    const message = `Hola, realicé mi inscripción al curso IA para estudiantes.\n\nNombre: ${studentData?.name || ''}\nCorreo: ${studentData?.email || ''}\nTeléfono: ${studentData?.phone || ''}\nImporte: $${settings.price} MXN\n\nAdjunto mi comprobante de pago.`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleWhatsAppClick = () => {
    setWaOpened(true);
    window.open(getWhatsAppLink(), '_blank');
  };

  const handleConfirmWhatsAppSent = () => {
    setSubmitting(true);
    setTimeout(() => {
      onPaymentSubmit({
        receiptFile: 'whatsapp_receipt',
        paymentMethod: 'Transferencia (WhatsApp)'
      });
      setSubmitting(false);
    }, 600);
  };

  const handleUploadSubmit = () => {
    if (!uploadedFile) {
      alert('Por favor selecciona un archivo antes de continuar.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      onPaymentSubmit({
        receiptFile: uploadedFile.data,
        receiptFileName: uploadedFile.name,
        paymentMethod: 'Transferencia (Subida Directa)'
      });
      setSubmitting(false);
    }, 1000);
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
        onClick={() => onNavigate('register')} 
        className="glass-pill secondary" 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}
      >
        <ArrowLeft size={16} />
        <span>Atrás</span>
      </button>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="glass-pill blue" style={{ marginBottom: '12px', pointerEvents: 'none' }}>PASO 2 DE 2</span>
        <h1 style={{ fontSize: '32px', letterSpacing: '-0.8px', marginBottom: '8px' }}>Método de pago</h1>
        <p style={{ color: '#6b7280' }}>Realiza la transferencia bancaria y envía tu comprobante.</p>
      </div>

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
                {studentData?.name ? studentData.name : (settings.bankConcept || 'Nombre Completo del Alumno')}
              </div>
              <span style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic', marginTop: '2px', display: 'block' }}>
                (Utiliza tu <strong>Nombre Completo</strong> como concepto al hacer la transferencia)
              </span>
            </div>
            <button 
              onClick={() => copyToClipboard(studentData?.name || settings.bankConcept || 'Nombre Completo del Alumno', 'concept')} 
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
      <h3 style={{ fontSize: '18px', marginBottom: '18px', textAlign: 'center' }}>¿Cómo deseas enviar tu comprobante?</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Option A: WhatsApp */}
        <GlassCard tint="mint" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#03543f', fontWeight: 700, fontSize: '16px', marginBottom: '10px' }}>
              <Smartphone size={20} />
              <span>Opción A: WhatsApp</span>
            </div>
            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}>
              Envía tu captura de pantalla de forma instantánea a nuestro WhatsApp administrativo (<strong>{settings.whatsappNumber || '5641439566'}</strong>).
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={handleWhatsAppClick}
              className="glass-pill mint" 
              style={{ width: '100%', padding: '12px', justifyContent: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.8)' }}
            >
              <Send size={15} />
              <span>Abrir WhatsApp ({settings.whatsappNumber || '5641439566'})</span>
            </button>

            <button 
              onClick={handleConfirmWhatsAppSent}
              disabled={submitting}
              className="glass-btn primary"
              style={{ width: '100%', padding: '10px', fontSize: '13px' }}
            >
              <span>{submitting ? 'Procesando...' : 'Ya envié mi comprobante por WhatsApp'}</span>
            </button>
          </div>
        </GlassCard>

        {/* Option B: Upload Comprobante */}
        <GlassCard tint="neutral" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1f2937', fontWeight: 700, fontSize: '16px', marginBottom: '10px' }}>
              <Upload size={20} />
              <span>Opción B: Subir comprobante</span>
            </div>
            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5 }}>
              Carga tu archivo (PDF, JPG, PNG) directamente a la plataforma para validación administrativa interna.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {!uploadedFile ? (
              <label 
                className="glass-pill" 
                style={{ width: '100%', padding: '12px', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)', fontSize: '13px' }}
              >
                <Upload size={15} />
                <span>{uploading ? 'Procesando...' : 'Seleccionar comprobante'}</span>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.5)', padding: '8px 12px', borderRadius: '12px', fontSize: '13px', overflow: 'hidden' }}>
                  <FileText size={16} style={{ color: '#3f83f8', flexShrink: 0 }} />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>{uploadedFile.name}</span>
                  <button 
                    onClick={() => setUploadedFile(null)} 
                    style={{ background: 'none', border: 'none', color: '#b91c1c', fontWeight: 'bold', cursor: 'pointer', padding: '0 4px' }}
                  >
                    ×
                  </button>
                </div>
                
                <button 
                  onClick={handleUploadSubmit}
                  disabled={submitting}
                  className="glass-btn primary"
                  style={{ width: '100%', padding: '10px', fontSize: '13px' }}
                >
                  <span>{submitting ? 'Enviando...' : 'Confirmar Envío'}</span>
                </button>
              </div>
            )}
          </div>
        </GlassCard>

      </div>

    </div>
  );
};

export default PublicPayment;
