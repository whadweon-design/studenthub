import React, { useState, useEffect, useCallback } from 'react';
import {
  getSettings, saveSettings, getUsers, getAdminUser, updateAdminUser
} from '../../services/db';
import { OFFICIAL_PAYMENT_CONFIG } from '../../config/paymentConfig';
import { supabase } from '../../services/supabaseClient';
import GlassCard from '../../components/GlassCard';
import {
  Users, Calendar, Settings, DollarSign, Check, X, ShieldAlert, Award, FileText, ExternalLink, Info, PhoneCall, Lock, Key, ShieldCheck, Eye, EyeOff, RefreshCw
} from 'lucide-react';

const AdminPortal = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('enrollments'); // enrollments | sessions | settings | students
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrollmentsError, setEnrollmentsError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [settings, setSettings] = useState(null);
  const [students, setStudents] = useState([]);

  // Configurations form state
  const [price, setPrice] = useState(499);
  const [bankName, setBankName] = useState('');
  const [bankBeneficiary, setBankBeneficiary] = useState('');
  const [bankClabe, setBankClabe] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankConcept, setBankConcept] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');

  // CEO / Admin Security Credentials state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminSecurityMessage, setAdminSecurityMessage] = useState('');

  // Sessions form state
  const [sessions, setSessions] = useState([]);

  const fetchEnrollments = useCallback(async () => {
    setLoadingEnrollments(true);
    setEnrollmentsError('');

    try {
      // 1. Intentar consulta directa con embedding PostgREST
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          status,
          payment_method,
          receipt_url,
          submitted_at,
          processed_at,
          processed_by,
          user_id,
          course_id,
          profiles!user_id (
            id,
            full_name,
            phone
          ),
          courses!course_id (
            id,
            title,
            price
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.warn('PostgREST join notice, ejecutando consulta relacional directa:', error);

        // Fallback resiliente: consultar enrollments y resolver perfiles y cursos asociados
        const { data: rawEnrollments, error: rawError } = await supabase
          .from('enrollments')
          .select('id, status, payment_method, receipt_url, submitted_at, processed_at, processed_by, user_id, course_id')
          .order('submitted_at', { ascending: false });

        if (rawError) {
          throw new Error(rawError.message || 'Error al consultar inscripciones en Supabase.');
        }

        const userIds = [...new Set((rawEnrollments || []).map(e => e.user_id).filter(Boolean))];
        const courseIds = [...new Set((rawEnrollments || []).map(e => e.course_id).filter(Boolean))];

        const [profilesRes, coursesRes] = await Promise.all([
          userIds.length > 0
            ? supabase.from('profiles').select('id, full_name, phone').in('id', userIds)
            : { data: [] },
          courseIds.length > 0
            ? supabase.from('courses').select('id, title, price').in('id', courseIds)
            : { data: [] }
        ]);

        const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
        const courseMap = new Map((coursesRes.data || []).map(c => [c.id, c]));

        const combined = (rawEnrollments || []).map(e => ({
          id: e.id,
          status: e.status,
          paymentMethod: e.payment_method || 'No especificado',
          receiptUrl: e.receipt_url,
          submittedAt: e.submitted_at,
          processedAt: e.processed_at,
          studentName: profileMap.get(e.user_id)?.full_name || 'Alumno sin nombre registrado',
          studentPhone: profileMap.get(e.user_id)?.phone || null,
          courseName: courseMap.get(e.course_id)?.title || 'Curso no disponible',
          price: courseMap.get(e.course_id)?.price || 0
        }));

        setEnrollments(combined);
        return;
      }

      // Si la consulta join tuvo éxito directo
      const mapped = (data || []).map(e => ({
        id: e.id,
        status: e.status,
        paymentMethod: e.payment_method || 'No especificado',
        receiptUrl: e.receipt_url,
        submittedAt: e.submitted_at,
        processedAt: e.processed_at,
        studentName: e.profiles?.full_name || 'Alumno sin nombre registrado',
        studentPhone: e.profiles?.phone || null,
        courseName: e.courses?.title || 'Curso no disponible',
        price: e.courses?.price || 0
      }));

      setEnrollments(mapped);
    } catch (err) {
      console.error('Error al cargar inscripciones de Supabase:', err);
      setEnrollmentsError(err.message || 'No se pudieron consultar las inscripciones de Supabase.');
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    fetchEnrollments();
  }, [fetchEnrollments]);

  const loadData = () => {
    setStudents(getUsers().filter(u => !u.isAdmin));

    const admin = getAdminUser();
    if (admin) {
      setAdminName(admin.name || 'CEO / Administrador');
      setAdminEmail(admin.email || '');
    }

    const s = getSettings();
    if (s) {
      setSettings(s);
      setPrice(OFFICIAL_PAYMENT_CONFIG.officialPrice);
      setBankName(OFFICIAL_PAYMENT_CONFIG.bankName);
      setBankBeneficiary(OFFICIAL_PAYMENT_CONFIG.bankBeneficiary);
      setBankClabe(OFFICIAL_PAYMENT_CONFIG.bankClabe);
      setBankAccount(OFFICIAL_PAYMENT_CONFIG.bankAccount);
      setBankConcept(OFFICIAL_PAYMENT_CONFIG.bankConcept);
      setWhatsappNumber(OFFICIAL_PAYMENT_CONFIG.whatsappDisplay);
      setCourseName(s.courseName);
      setCourseDescription(s.courseDescription);
      setSessions(s.sessions);
    }
  };

  const handleApprove = async (enrollment) => {
    if (!enrollment || enrollment.status !== 'PENDIENTE_VALIDACION') {
      alert('Solo es posible procesar solicitudes con estado PENDIENTE_VALIDACION.');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ ATENCIÓN: Estás a punto de APROBAR la inscripción de "${enrollment.studentName}".\n\n` +
      `Asegúrate de haber verificado previamente el comprobante o depósito bancario correspondiente ($${enrollment.price} MXN).\n\n` +
      `¿Confirmas la APROBACIÓN de esta inscripción?`
    );
    if (!confirmed) return;

    setProcessingId(enrollment.id);
    setActionFeedback(null);

    try {
      // 1. Validar sesión activa del administrador en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        throw new Error('No se detectó una sesión activa de administrador. Inicia sesión nuevamente.');
      }
      const adminUser = authData.user;

      // 2. Validar rol 'admin' en public.profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', adminUser.id)
        .maybeSingle();

      if (profileError || !profile || profile.role !== 'admin') {
        throw new Error('Permisos insuficientes: Se requiere rol de administrador (CEO) para aprobar inscripciones.');
      }

      // 3. Ejecutar UPDATE seguro en public.enrollments
      const nowIso = new Date().toISOString();
      const { data: updatedRows, error: updateError } = await supabase
        .from('enrollments')
        .update({
          status: 'APROBADA',
          processed_at: nowIso,
          processed_by: adminUser.id
        })
        .eq('id', enrollment.id)
        .eq('status', 'PENDIENTE_VALIDACION')
        .select('id, status, processed_at, processed_by');

      if (updateError) {
        throw new Error(updateError.message || 'Error al actualizar la inscripción en Supabase.');
      }

      if (!updatedRows || updatedRows.length !== 1) {
        throw new Error('No se pudo actualizar la inscripción. Es posible que el estado ya haya cambiado en otra sesión.');
      }

      setActionFeedback({
        type: 'success',
        message: `¡Inscripción de "${enrollment.studentName}" APROBADA con éxito! Se ha habilitado su acceso al Aula Virtual.`
      });

      // Recargar inscripciones desde Supabase
      await fetchEnrollments();
    } catch (err) {
      console.error('Error al aprobar inscripción:', err);
      setActionFeedback({
        type: 'error',
        message: err.message || 'Error al procesar la aprobación de la inscripción.'
      });
      await fetchEnrollments();
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (enrollment) => {
    if (!enrollment || enrollment.status !== 'PENDIENTE_VALIDACION') {
      alert('Solo es posible procesar solicitudes con estado PENDIENTE_VALIDACION.');
      return;
    }

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas RECHAZAR la solicitud de inscripción de "${enrollment.studentName}"?\n\n` +
      `Esta acción actualizará el estado de la inscripción a RECHAZADA en la base de datos.`
    );
    if (!confirmed) return;

    setProcessingId(enrollment.id);
    setActionFeedback(null);

    try {
      // 1. Validar sesión activa del administrador en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        throw new Error('No se detectó una sesión activa de administrador. Inicia sesión nuevamente.');
      }
      const adminUser = authData.user;

      // 2. Validar rol 'admin' en public.profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', adminUser.id)
        .maybeSingle();

      if (profileError || !profile || profile.role !== 'admin') {
        throw new Error('Permisos insuficientes: Se requiere rol de administrador (CEO) para rechazar inscripciones.');
      }

      // 3. Ejecutar UPDATE seguro en public.enrollments
      const nowIso = new Date().toISOString();
      const { data: updatedRows, error: updateError } = await supabase
        .from('enrollments')
        .update({
          status: 'RECHAZADA',
          processed_at: nowIso,
          processed_by: adminUser.id
        })
        .eq('id', enrollment.id)
        .eq('status', 'PENDIENTE_VALIDACION')
        .select('id, status, processed_at, processed_by');

      if (updateError) {
        throw new Error(updateError.message || 'Error al actualizar la inscripción en Supabase.');
      }

      if (!updatedRows || updatedRows.length !== 1) {
        throw new Error('No se pudo actualizar la inscripción. Es posible que el estado ya haya cambiado en otra sesión.');
      }

      setActionFeedback({
        type: 'success',
        message: `Inscripción de "${enrollment.studentName}" marcada como RECHAZADA en la base de datos.`
      });

      // Recargar inscripciones desde Supabase
      await fetchEnrollments();
    } catch (err) {
      console.error('Error al rechazar inscripción:', err);
      setActionFeedback({
        type: 'error',
        message: err.message || 'Error al procesar el rechazo de la inscripción.'
      });
      await fetchEnrollments();
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const updated = {
      ...settings,
      price: Number(price),
      bankName,
      bankBeneficiary,
      bankClabe,
      bankAccount,
      bankConcept,
      whatsappNumber,
      courseName,
      courseDescription,
      sessions
    };
    saveSettings(updated);
    alert('Configuraciones guardadas con éxito. Se han reflejado en toda la academia.');
    loadData();
  };

  const handleSaveAdminCredentials = (e) => {
    e.preventDefault();
    setAdminSecurityMessage('');

    if (!adminEmail.trim()) {
      alert('Por favor introduce tu correo electrónico de CEO / Administrador.');
      return;
    }

    if (newAdminPassword) {
      if (newAdminPassword.length < 8) {
        alert('La nueva contraseña debe tener al menos 8 caracteres para mayor seguridad.');
        return;
      }
      if (newAdminPassword !== confirmAdminPassword) {
        alert('Las contraseñas no coinciden. Por favor verifícalas.');
        return;
      }
    }

    updateAdminUser({
      name: adminName,
      email: adminEmail,
      newPassword: newAdminPassword || undefined
    });

    setNewAdminPassword('');
    setConfirmAdminPassword('');
    alert('¡Credenciales del CEO actualizadas con éxito! Tu usuario y contraseña han sido guardados de manera segura.');
    loadData();
  };

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'No ingresada', color: '#9ca3af' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1: return { score: 25, label: 'Débil', color: '#ef4444' };
      case 2: return { score: 50, label: 'Media', color: '#f59e0b' };
      case 3: return { score: 75, label: 'Segura', color: '#3b82f6' };
      case 4: return { score: 100, label: 'Muy Segura (Recomendada)', color: '#10b981' };
      default: return { score: 0, label: 'Débil', color: '#ef4444' };
    }
  };

  const handleSessionChange = (index, field, value) => {
    const updatedSessions = [...sessions];
    updatedSessions[index] = {
      ...updatedSessions[index],
      [field]: value
    };
    setSessions(updatedSessions);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APROBADA':
      case 'Inscripción activa':
        return 'mint';
      case 'PENDIENTE DE VALIDACIÓN ADMINISTRATIVA':
      case 'PENDIENTE DE VALIDACIÓN':
      case 'Pago en validación':
        return 'blue';
      case 'Pendiente de pago / comprobante':
      case 'Pendiente de pago':
        return 'yellow';
      case 'RECHAZADA':
      case 'Rechazado / requiere revisión':
        return 'coral';
      default:
        return 'neutral';
    }
  };

  const strength = calculatePasswordStrength(newAdminPassword);

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>

      {/* Background decoration */}
      <div className="background-auras">
        <div className="aura aura-coral" />
        <div className="aura aura-blue" />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <span className="glass-pill coral" style={{ marginBottom: '8px', pointerEvents: 'none' }}>Panel de Control</span>
          <h1 style={{ fontSize: '32px', letterSpacing: '-0.8px' }}>Administración Academia</h1>
        </div>

        <button onClick={onBack} className="glass-pill secondary">
          Volver al Aula Virtual
        </button>
      </div>

      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <button
          onClick={() => setActiveTab('enrollments')}
          className={`glass-pill ${activeTab === 'enrollments' ? 'blue active' : 'neutral'}`}
        >
          <Users size={16} />
          <span>Inscripciones</span>
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`glass-pill ${activeTab === 'sessions' ? 'mint active' : 'neutral'}`}
        >
          <Calendar size={16} />
          <span>Fechas y Sesiones</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`glass-pill ${activeTab === 'settings' ? 'coral active' : 'neutral'}`}
        >
          <Settings size={16} />
          <span>Configuración de Cuentas</span>
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`glass-pill ${activeTab === 'students' ? 'yellow active' : 'neutral'}`}
        >
          <Award size={16} />
          <span>Alumnos Registrados</span>
        </button>
      </div>

      {/* Content Areas */}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Solicitudes de Inscripción</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                Datos en tiempo real desde Supabase (<code>public.enrollments</code>)
              </p>
            </div>

            <button
              onClick={fetchEnrollments}
              disabled={loadingEnrollments}
              className="glass-pill blue"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: loadingEnrollments ? 'not-allowed' : 'pointer' }}
            >
              <RefreshCw size={14} className={loadingEnrollments ? 'spin-animation' : ''} />
              <span>{loadingEnrollments ? 'Actualizando...' : 'Actualizar inscripciones'}</span>
            </button>
          </div>

          {/* Action Feedback Message */}
          {actionFeedback && (
            <GlassCard
              tint={actionFeedback.type === 'success' ? 'mint' : 'coral'}
              style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: actionFeedback.type === 'success' ? '#03543f' : '#9b1c1c' }}>
                {actionFeedback.type === 'success' ? <Check size={20} /> : <ShieldAlert size={20} />}
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{actionFeedback.message}</span>
              </div>
              <button
                onClick={() => setActionFeedback(null)}
                className="glass-pill secondary"
                style={{ padding: '4px 12px', fontSize: '11px' }}
              >
                Cerrar
              </button>
            </GlassCard>
          )}

          {/* Error Message */}
          {enrollmentsError && (
            <GlassCard tint="coral" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#9b1c1c' }}>
                <ShieldAlert size={22} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '14px' }}>
                  <strong>Error de consulta:</strong> {enrollmentsError}
                </div>
              </div>
              <button
                onClick={fetchEnrollments}
                className="glass-pill secondary"
                style={{ marginTop: '12px', padding: '6px 14px', fontSize: '12px' }}
              >
                Reintentar consulta
              </button>
            </GlassCard>
          )}

          {/* Loading State */}
          {loadingEnrollments && enrollments.length === 0 && (
            <div className="glass-panel blue" style={{ textAlign: 'center', padding: '40px 20px', color: '#1e429f', fontSize: '15px', fontWeight: 600 }}>
              <RefreshCw size={24} className="spin-animation" style={{ margin: '0 auto 12px auto', display: 'block' }} />
              Cargando inscripciones reales desde Supabase...
            </div>
          )}

          {/* Empty State */}
          {!loadingEnrollments && !enrollmentsError && enrollments.length === 0 && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', color: '#4b5563', fontSize: '15px' }}>
              <Info size={32} style={{ color: '#6b7280', margin: '0 auto 12px auto', display: 'block' }} />
              <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>No hay solicitudes de inscripción registradas</p>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                No se encontraron registros en la tabla <code>public.enrollments</code> de Supabase.
              </p>
            </div>
          )}

          {/* Enrollments List */}
          {enrollments.length > 0 && (
            enrollments.map(env => (
              <GlassCard key={env.id} tint={getStatusBadgeClass(env.status)} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>

                  {/* Student Details */}
                  <div>
                    <h4 style={{ fontSize: '18px', color: '#111827', fontWeight: 700 }}>{env.studentName}</h4>
                    <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {env.studentPhone && (
                        <div>📞 <strong>Teléfono:</strong> {env.studentPhone}</div>
                      )}
                      <div>📚 <strong>Curso:</strong> {env.courseName}</div>
                      <div>📅 <strong>Fecha de registro:</strong> {env.submittedAt ? new Date(env.submittedAt).toLocaleString('es-MX') : 'Fecha no disponible'}</div>
                      <div>💰 <strong>Importe:</strong> ${env.price} MXN ({env.paymentMethod || 'Transferencia'})</div>
                      {env.processedAt && (
                        <div style={{ marginTop: '4px', color: env.status === 'APROBADA' ? '#03543f' : '#9b1c1c', fontWeight: 600 }}>
                          ⏱️ <strong>Fecha de resolución:</strong> {new Date(env.processedAt).toLocaleString('es-MX')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attachment receipts */}
                  <div style={{ minWidth: '180px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Comprobante de pago:</span>
                    {env.receiptUrl ? (
                      <div style={{ marginTop: '6px' }}>
                        <a
                          href={env.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-pill"
                          style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#1f2937' }}
                        >
                          <FileText size={12} />
                          <span>Ver Archivo Comprobante</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    ) : env.paymentMethod && env.paymentMethod.toLowerCase().includes('whatsapp') ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#03543f', background: 'rgba(222, 247, 236, 0.6)', padding: '8px 12px', borderRadius: '10px', marginTop: '6px', fontSize: '12px', fontWeight: 600 }}>
                        <PhoneCall size={14} />
                        <span>Vía WhatsApp / Banca Móvil</span>
                      </div>
                    ) : (
                      <div style={{ color: '#6b7280', fontSize: '13px', fontStyle: 'italic', marginTop: '4px' }}>
                        Sin archivo digital adjunto
                      </div>
                    )}
                  </div>

                  {/* Actions & Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <span className={`glass-pill ${getStatusBadgeClass(env.status)}`} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', pointerEvents: 'none' }}>
                      {env.status}
                    </span>

                    {env.status === 'PENDIENTE_VALIDACION' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          onClick={() => handleApprove(env)}
                          disabled={processingId !== null}
                          className="glass-pill mint"
                          style={{
                            padding: '8px 14px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600,
                            opacity: processingId !== null ? 0.6 : 1,
                            cursor: processingId !== null ? 'not-allowed' : 'pointer'
                          }}
                          title="Aprobar inscripción tras verificar comprobante de pago"
                        >
                          <Check size={14} />
                          <span>{processingId === env.id ? 'Aprobando...' : 'Aprobar inscripción'}</span>
                        </button>
                        <button
                          onClick={() => handleReject(env)}
                          disabled={processingId !== null}
                          className="glass-pill coral"
                          style={{
                            padding: '8px 14px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600,
                            opacity: processingId !== null ? 0.6 : 1,
                            cursor: processingId !== null ? 'not-allowed' : 'pointer'
                          }}
                          title="Rechazar inscripción"
                        >
                          <X size={14} />
                          <span>{processingId === env.id ? 'Rechazando...' : 'Rechazar inscripción'}</span>
                        </button>
                      </div>
                    )}

                    {env.status === 'APROBADA' && (
                      <span style={{ fontSize: '11px', color: '#03543f', fontWeight: 600, marginTop: '4px' }}>
                        ✓ Inscripción validada y habilitada
                      </span>
                    )}

                    {env.status === 'RECHAZADA' && (
                      <span style={{ fontSize: '11px', color: '#9b1c1c', fontWeight: 600, marginTop: '4px' }}>
                        ✕ Inscripción rechazada
                      </span>
                    )}

                    {env.status === 'REGISTRO_INICIADO' && (
                      <span style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', marginTop: '4px' }}>
                        Esperando confirmación de pago del alumno
                      </span>
                    )}
                  </div>

                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <form onSubmit={handleSaveSettings} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Configuración de Sesiones</h3>
            <button type="submit" className="glass-btn primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
              Guardar Cambios
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sessions.map((session, index) => (
              <GlassCard key={session.id} tint={index % 2 === 0 ? 'mint' : 'blue'} style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', color: '#111827' }}>
                  {session.name} — {session.day} (Temario)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#4b5563' }}>Título del Tema</label>
                    <input
                      type="text"
                      value={session.title}
                      onChange={(e) => handleSessionChange(index, 'title', e.target.value)}
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#4b5563' }}>Estado de la Sesión</label>
                    <select
                      value={session.status}
                      onChange={(e) => handleSessionChange(index, 'status', e.target.value)}
                      className="glass-input"
                      style={{ appearance: 'none' }}
                    >
                      <option value="Próxima">Próxima (Aún no impartida)</option>
                      <option value="En vivo">En vivo (Impartiendo ahora)</option>
                      <option value="Finalizada">Finalizada (Grabación disponible)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '20px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#4b5563' }}>Fecha del directo</label>
                    <input
                      type="text"
                      value={session.date}
                      onChange={(e) => handleSessionChange(index, 'date', e.target.value)}
                      placeholder="Ej. Lunes 31 de Agosto"
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#4b5563' }}>Hora de la sesión</label>
                    <input
                      type="text"
                      value={session.time}
                      onChange={(e) => handleSessionChange(index, 'time', e.target.value)}
                      placeholder="Ej. 7:00 PM"
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#4b5563' }}>Transmisión de YouTube Live (URL)</label>
                    <input
                      type="text"
                      value={session.liveUrl !== undefined ? session.liveUrl : (session.meetLink || '')}
                      onChange={(e) => handleSessionChange(index, 'liveUrl', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="glass-input"
                    />
                  </div>
                </div>

                {session.status === 'Finalizada' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#4b5563' }}>Grabación de YouTube (URL)</label>
                    <input
                      type="text"
                      value={session.youtubeUrl}
                      onChange={(e) => handleSessionChange(index, 'youtubeUrl', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="glass-input"
                    />
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </form>
      )}

      {/* Global Config Settings Tab */}
      {activeTab === 'settings' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {/* CEO / Admin Security Credentials Card */}
          <GlassCard tint="coral" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.8)', color: '#9b1c1c' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', color: '#9b1c1c', fontWeight: 800 }}>Credenciales Privadas del CEO / Administrador</h3>
                <p style={{ fontSize: '13px', color: '#4b5563', marginTop: '2px' }}>
                  Configura aquí tu usuario y contraseña personal de máxima seguridad. Solo tú tendrás acceso.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAdminCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Nombre del CEO / Director</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Ej. Carlos Ramírez (CEO)"
                    className="glass-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Correo Electrónico del CEO</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="ceo@tuorganizacion.com"
                    className="glass-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Nueva Contraseña Segura</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres (letras, números, símbolos)"
                      className="glass-input"
                      style={{ paddingRight: '45px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {newAdminPassword && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '4px', color: strength.color }}>
                        <span>Seguridad: {strength.label}</span>
                        <span>{strength.score}%</span>
                      </div>
                      <div className="progress-bar-container" style={{ height: '6px' }}>
                        <div style={{ width: `${strength.score}%`, height: '100%', background: strength.color, borderRadius: '4px', transition: 'all 0.3s ease' }} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Confirmar Nueva Contraseña</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="glass-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="glass-btn primary" style={{ padding: '12px 28px', background: 'linear-gradient(135deg, rgba(253, 232, 232, 0.9) 0%, rgba(254, 226, 226, 0.9) 100%)', color: '#9b1c1c', borderColor: 'rgba(255, 255, 255, 0.9)' }}>
                  Guardar Credenciales del CEO
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Notice about Centralized Payment Configuration */}
          <GlassCard tint="blue" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#1e429f' }}>
              <Info size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
                <strong style={{ display: 'block', marginBottom: '4px', fontSize: '15px' }}>
                  Datos oficiales de pago centralizados (Solo lectura)
                </strong>
                Los datos oficiales de pago y contacto se gestionan mediante la configuración centralizada de la aplicación y la tabla <code>public.courses</code> de Supabase para garantizar que todos los alumnos visualicen exactamente la misma información en cualquier dispositivo. La edición local desde este panel se encuentra deshabilitada temporalmente.
              </div>
            </div>
          </GlassCard>

          {/* Payment & Settings Read-Only View */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'start' }}>

            <GlassCard tint="neutral" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>Datos de Transferencia Bancaria</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Nombre del Banco</label>
                  <input
                    type="text"
                    value={bankName}
                    disabled
                    readOnly
                    className="glass-input"
                    style={{ opacity: 0.75, cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Nombre del Beneficiario</label>
                  <input
                    type="text"
                    value={bankBeneficiary}
                    disabled
                    readOnly
                    className="glass-input"
                    style={{ opacity: 0.75, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>CLABE Interbancaria</label>
                <input
                  type="text"
                  value={bankClabe}
                  disabled
                  readOnly
                  className="glass-input"
                  style={{ opacity: 0.75, cursor: 'not-allowed' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Número de Cuenta (Opcional)</label>
                  <input
                    type="text"
                    value={bankAccount}
                    disabled
                    readOnly
                    className="glass-input"
                    style={{ opacity: 0.75, cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Concepto sugerido</label>
                  <input
                    type="text"
                    value={bankConcept}
                    disabled
                    readOnly
                    className="glass-input"
                    style={{ opacity: 0.75, cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            </GlassCard>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <GlassCard tint="blue" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Precios y Contacto</h3>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Precio del Curso (MXN)</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: '#9ca3af' }} />
                    <input
                      type="number"
                      value={price}
                      disabled
                      readOnly
                      className="glass-input"
                      style={{ paddingLeft: '40px', opacity: 0.75, cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>WhatsApp Administrativo</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    disabled
                    readOnly
                    className="glass-input"
                    style={{ opacity: 0.75, cursor: 'not-allowed' }}
                  />
                </div>
              </GlassCard>

              <button
                type="button"
                disabled
                className="glass-btn secondary"
                style={{ width: '100%', padding: '14px', opacity: 0.65, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Lock size={15} />
                <span>Edición deshabilitada (Configuración centralizada)</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Students List Tab */}
      {activeTab === 'students' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Alumnos en la Plataforma</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {students.length > 0 ? (
              students.map(std => (
                <GlassCard key={std.email} tint="neutral" style={{ padding: '20px 28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <h4 style={{ fontSize: '17px', fontWeight: 700 }}>{std.name}</h4>
                      <span style={{ fontSize: '13px', color: '#4b5563' }}>📧 {std.email} · 📞 {std.phone}</span>
                    </div>

                    {/* Progress details */}
                    <div style={{ minWidth: '220px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                        <span>Progreso Curso IA</span>
                        <span>{std.progress?.['ia-trabajo'] || 0}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill mint"
                          style={{ width: `${std.progress?.['ia-trabajo'] || 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="glass-pill mint" style={{ padding: '4px 12px', fontSize: '12px', pointerEvents: 'none' }}>
                        {std.status}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))
            ) : (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>No hay alumnos habilitados en este momento.</div>
            )}
          </div>
        </div>
      )}

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

export default AdminPortal;
