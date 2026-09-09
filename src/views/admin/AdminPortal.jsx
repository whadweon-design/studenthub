import React, { useState, useEffect } from 'react';
import { 
  getEnrollments, updateEnrollmentStatus, getSettings, saveSettings, getUsers, getAdminUser, updateAdminUser 
} from '../../services/db';
import GlassCard from '../../components/GlassCard';
import { 
  Users, Calendar, Settings, DollarSign, Check, X, ShieldAlert, Award, FileText, ExternalLink, Info, PhoneCall, Lock, Key, ShieldCheck, Eye, EyeOff 
} from 'lucide-react';

const AdminPortal = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('enrollments'); // enrollments | sessions | settings | students
  const [enrollments, setEnrollments] = useState([]);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setEnrollments(getEnrollments());
    setStudents(getUsers().filter(u => !u.isAdmin));
    
    const admin = getAdminUser();
    if (admin) {
      setAdminName(admin.name || 'CEO / Administrador');
      setAdminEmail(admin.email || '');
    }

    const s = getSettings();
    if (s) {
      setSettings(s);
      setPrice(s.price);
      setBankName(s.bankName);
      setBankBeneficiary(s.bankBeneficiary);
      setBankClabe(s.bankClabe);
      setBankAccount(s.bankAccount);
      setBankConcept(s.bankConcept);
      setWhatsappNumber(s.whatsappNumber);
      setCourseName(s.courseName);
      setCourseDescription(s.courseDescription);
      setSessions(s.sessions);
    }
  };

  const handleApprove = (id) => {
    updateEnrollmentStatus(id, 'APROBADA');
    alert('¡Inscripción APROBADA con éxito! Se ha habilitado la cuenta de acceso del alumno.');
    loadData();
  };

  const handleReject = (id) => {
    updateEnrollmentStatus(id, 'RECHAZADA');
    alert('Inscripción RECHAZADA. El registro ha quedado actualizado en la base de datos.');
    loadData();
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
          <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Solicitudes de Inscripción</h3>
          {enrollments.length > 0 ? (
            enrollments.map(env => (
              <GlassCard key={env.id} tint={getStatusBadgeClass(env.status)} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                  
                  {/* Student Details */}
                  <div>
                    <h4 style={{ fontSize: '18px', color: '#111827', fontWeight: 700 }}>{env.name}</h4>
                    <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>📧 <strong>Correo:</strong> {env.email}</div>
                      <div>📞 <strong>Teléfono:</strong> {env.phone}</div>
                      <div>📅 <strong>Fecha y hora de registro:</strong> {new Date(env.date).toLocaleString('es-MX')}</div>
                      <div>💰 <strong>Importe:</strong> ${env.price} MXN ({env.paymentMethod || 'Transferencia Bancaria'})</div>
                      {env.processedDate && (
                        <div style={{ marginTop: '4px', color: env.status === 'APROBADA' ? '#03543f' : '#9b1c1c', fontWeight: 600 }}>
                          ⏱️ <strong>Fecha de resolución:</strong> {new Date(env.processedDate).toLocaleString('es-MX')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attachment receipts */}
                  <div style={{ minWidth: '180px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Comprobante enviado:</span>
                    {env.receiptFile ? (
                      env.receiptFile === 'whatsapp_receipt' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#03543f', background: 'rgba(222, 247, 236, 0.6)', padding: '8px 12px', borderRadius: '10px', marginTop: '6px', fontSize: '12px', fontWeight: 600 }}>
                          <PhoneCall size={14} />
                          <span>Vía WhatsApp / Banca Móvil</span>
                        </div>
                      ) : (
                        <div style={{ marginTop: '6px' }}>
                          <button 
                            onClick={() => {
                              const win = window.open();
                              win.document.write(`<iframe src="${env.receiptFile}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                            }}
                            className="glass-pill"
                            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <FileText size={12} />
                            <span>Ver Archivo Comprobante</span>
                            <ExternalLink size={10} />
                          </button>
                        </div>
                      )
                    ) : (
                      <div style={{ color: '#9b1c1c', fontSize: '13px', fontStyle: 'italic', marginTop: '4px' }}>Sin comprobante cargado en la plataforma</div>
                    )}
                  </div>

                  {/* Actions & Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                    <span className={`glass-pill ${getStatusBadgeClass(env.status)}`} style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', pointerEvents: 'none' }}>
                      {env.status}
                    </span>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      {env.status !== 'APROBADA' && env.status !== 'Inscripción activa' && (
                        <button 
                          onClick={() => handleApprove(env.id)}
                          className="glass-pill mint" 
                          style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                        >
                          <Check size={14} />
                          <span>Aprobar inscripción</span>
                        </button>
                      )}
                      {env.status !== 'RECHAZADA' && (
                        <button 
                          onClick={() => handleReject(env.id)}
                          className="glass-pill coral" 
                          style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                        >
                          <X size={14} />
                          <span>Rechazar inscripción</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </GlassCard>
            ))
          ) : (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: '#4b5563', fontSize: '15px' }}>
              Aún no hay solicitudes de inscripción.
            </div>
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: '#4b5563' }}>Enlace del directo (Zoom / Meet)</label>
                    <input 
                      type="text" 
                      value={session.meetLink}
                      onChange={(e) => handleSessionChange(index, 'meetLink', e.target.value)}
                      placeholder="https://meet.google.com/abc-def-ghi" 
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

          {/* Payment & Settings Form */}
          <form onSubmit={handleSaveSettings} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>
            
            <GlassCard tint="neutral" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>Datos de Transferencia Bancaria</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Nombre del Banco</label>
                  <input 
                    type="text" 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="glass-input" 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Nombre del Beneficiario</label>
                  <input 
                    type="text" 
                    value={bankBeneficiary}
                    onChange={(e) => setBankBeneficiary(e.target.value)}
                    className="glass-input" 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>CLABE Interbancaria</label>
                <input 
                  type="text" 
                  value={bankClabe}
                  onChange={(e) => setBankClabe(e.target.value)}
                  className="glass-input" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Número de Cuenta (Opcional)</label>
                  <input 
                    type="text" 
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="glass-input" 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>Concepto sugerido</label>
                  <input 
                    type="text" 
                    value={bankConcept}
                    onChange={(e) => setBankConcept(e.target.value)}
                    className="glass-input" 
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
                      onChange={(e) => setPrice(e.target.value)}
                      className="glass-input" 
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151' }}>WhatsApp Administrativo (Lada + Número)</label>
                  <input 
                    type="text" 
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+52 55 1234 5678" 
                    className="glass-input" 
                  />
                </div>
              </GlassCard>

              <button type="submit" className="glass-btn primary" style={{ width: '100%', padding: '14px' }}>
                Guardar Configuración General
              </button>
            </div>

          </form>

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

    </div>
  );
};

export default AdminPortal;
