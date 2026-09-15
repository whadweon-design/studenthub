import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/GlassCard';
import { 
  ArrowLeft, FileText, Download, Link as LinkIcon, Calendar, Video, Clock, CheckCircle, Circle, Play, MessageSquare, Send, Radio, Info 
} from 'lucide-react';
import { updateUserProgress } from '../../services/db';

const SessionPanel = ({ session, course, user, onBack, onProgressUpdate }) => {
  const [completed, setCompleted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'live' | 'chat' | 'resources' | 'recording'

  // Independent Chat state per session ID
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [liveNotice, setLiveNotice] = useState(false);

  const storageChatKey = `aula_chat_session_${session?.id || '1'}`;

  // Load completed state and session-specific chat messages
  useEffect(() => {
    const courseId = course?.id || 'ia-trabajo';
    const list = user.completedSessions?.[courseId] || [];
    setCompleted(list.includes(session.id));

    // Load independent session chat from localStorage or initialize defaults
    try {
      const savedChat = localStorage.getItem(storageChatKey);
      if (savedChat) {
        setChatMessages(JSON.parse(savedChat));
      } else {
        const defaultChat = [
          {
            id: 'm1',
            sender: 'Profesor Carlos (CEO)',
            role: 'Profesor',
            text: `¡Bienvenidos al espacio interactivo de la ${session.name}! Escribe aquí tus dudas y aportes sobre: "${session.title}".`,
            time: '19:00',
            isTeacher: true
          }
        ];
        setChatMessages(defaultChat);
        localStorage.setItem(storageChatKey, JSON.stringify(defaultChat));
      }
    } catch (e) {
      console.error(e);
    }
  }, [session.id, user, course, storageChatKey]);

  const handleToggleComplete = () => {
    const courseId = course?.id || 'ia-trabajo';
    const freshCompletedList = [...(user.completedSessions?.[courseId] || [])];
    const index = freshCompletedList.indexOf(session.id);
    
    if (index === -1) {
      freshCompletedList.push(session.id);
    } else {
      freshCompletedList.splice(index, 1);
    }

    const newProgress = Math.round((freshCompletedList.length / 4) * 100);

    updateUserProgress(user.email, courseId, newProgress, freshCompletedList);
    setCompleted(!completed);
    
    if (onProgressUpdate) {
      onProgressUpdate();
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageObj = {
      id: 'msg_' + Date.now(),
      sender: user.name || 'Alumno',
      role: 'Alumno',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      isTeacher: false
    };

    const updated = [...chatMessages, messageObj];
    setChatMessages(updated);
    try {
      localStorage.setItem(storageChatKey, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setNewMessage('');
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    try {
      let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      let match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    } catch (e) {
      console.error(e);
    }
    return url;
  };

  const getYoutubeThumbnail = (url) => {
    if (!url) return '';
    try {
      let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      let match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  };

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '1080px', margin: '0 auto' }}>
      
      {/* Navigation */}
      <button 
        onClick={onBack} 
        className="glass-pill secondary" 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}
      >
        <ArrowLeft size={16} />
        <span>Volver a Clases</span>
      </button>

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
        <div>
          <span className="glass-pill blue" style={{ marginBottom: '8px', pointerEvents: 'none' }}>
            {session.name} — {session.day}
          </span>
          <h1 style={{ fontSize: '30px', marginTop: '6px', letterSpacing: '-0.5px' }}>{session.title}</h1>
          <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '4px', maxWidth: '650px' }}>
            {session.description}
          </p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px', color: '#4b5563', fontSize: '14px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              <span>{session.date || 'Fecha por confirmar'}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} />
              <span>{session.time ? `${session.time} (1h 30m)` : 'Hora por confirmar'}</span>
            </span>
          </div>
        </div>

        {/* Checkbox completion */}
        <button 
          onClick={handleToggleComplete}
          className={`glass-pill ${completed ? 'mint' : 'neutral'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
        >
          {completed ? <CheckCircle size={18} /> : <Circle size={18} />}
          <span>{completed ? 'Clase Completada' : 'Marcar como Completada'}</span>
        </button>
      </div>

      {/* Session Interactive Tabs Navigation */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '14px' }}>
        <button 
          onClick={() => setActiveSection('all')} 
          className={`glass-pill ${activeSection === 'all' ? 'mint active' : 'neutral'}`}
          style={{ fontSize: '13px', padding: '8px 16px' }}
        >
          <span>Todas las secciones</span>
        </button>
        <button 
          onClick={() => setActiveSection('live')} 
          className={`glass-pill ${activeSection === 'live' ? 'blue active' : 'neutral'}`}
          style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Radio size={14} style={{ color: '#3f83f8' }} />
          <span>🔴 Entrar a clase</span>
        </button>
        <button 
          onClick={() => setActiveSection('chat')} 
          className={`glass-pill ${activeSection === 'chat' ? 'coral active' : 'neutral'}`}
          style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <MessageSquare size={14} style={{ color: '#f98080' }} />
          <span>💬 Chat</span>
        </button>
        <button 
          onClick={() => setActiveSection('resources')} 
          className={`glass-pill ${activeSection === 'resources' ? 'yellow active' : 'neutral'}`}
          style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FileText size={14} style={{ color: '#e3a008' }} />
          <span>📚 Actividades / Recursos</span>
        </button>
        <button 
          onClick={() => setActiveSection('recording')} 
          className={`glass-pill ${activeSection === 'recording' ? 'mint active' : 'neutral'}`}
          style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Play size={14} style={{ color: '#31c48d' }} />
          <span>▶️ Grabación</span>
        </button>
      </div>

      {/* Main Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: activeSection === 'chat' || activeSection === 'live' ? '1fr' : '1.2fr 0.8fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Column: Live Class, Recording & Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* SECTION 1: 🔴 Entrar a clase */}
          {(activeSection === 'all' || activeSection === 'live') && (
            <GlassCard tint="blue" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(225, 239, 254, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f83f8' }}>
                    <Video size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800 }}>🔴 Entrar a clase en vivo</h3>
                    <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '2px' }}>
                      {session.name} · {session.day} {session.time ? `a las ${session.time}` : ''}
                    </div>
                  </div>
                </div>

                <span className={`glass-pill ${session.status === 'En vivo' ? 'blue' : 'neutral'}`} style={{ pointerEvents: 'none', fontSize: '12px' }}>
                  {session.status === 'En vivo' ? 'En Vivo Ahora' : session.status === 'Finalizada' ? 'Finalizada' : 'Programada'}
                </span>
              </div>

              <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
                Accede a la sala interactiva en vivo para interactuar con el profesor y resolver dudas de la <strong>{session.name}</strong>.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setLiveNotice(true)} 
                  className="glass-pill blue"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: 700 }}
                >
                  <Video size={18} />
                  <span>🔴 Entrar a clase ({session.name})</span>
                </button>

                <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={14} />
                  <span>Integración Jitsi (Etapa 2)</span>
                </div>
              </div>

              {liveNotice && (
                <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(225, 239, 254, 0.7)', borderRadius: '12px', border: '1px solid rgba(63, 131, 248, 0.3)', color: '#1e429f', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>ℹ️ Estructura de la sesión lista. La videollamada interactiva en vivo (Jitsi) se integrará aquí en la <strong>Etapa 2</strong>.</span>
                  <button onClick={() => setLiveNotice(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#1e429f', marginLeft: '10px' }}>✕</button>
                </div>
              )}
            </GlassCard>
          )}

          {/* SECTION 2: 💬 Chat independiente por sesión */}
          {(activeSection === 'all' || activeSection === 'chat') && (
            <GlassCard tint="neutral" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(254, 226, 226, 0.8)', color: '#f98080', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800 }}>💬 Chat — {session.name}</h3>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Canal de discusión independiente</div>
                  </div>
                </div>

                <span className="glass-pill neutral" style={{ pointerEvents: 'none', fontSize: '11px' }}>
                  Supabase Realtime (Etapa 3)
                </span>
              </div>

              {/* Message Feed */}
              <div style={{ 
                maxHeight: '280px', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                marginBottom: '20px', 
                paddingRight: '6px' 
              }}>
                {chatMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    style={{ 
                      padding: '12px 16px', 
                      borderRadius: '16px', 
                      background: msg.isTeacher ? 'rgba(225, 239, 254, 0.7)' : 'rgba(255, 255, 255, 0.6)', 
                      border: msg.isTeacher ? '1px solid rgba(63, 131, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.8)',
                      alignSelf: msg.sender === user.name ? 'flex-end' : 'flex-start',
                      maxWidth: '85%'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: msg.isTeacher ? '#1e429f' : '#111827' }}>
                        {msg.sender} {msg.isTeacher && '👨‍🏫'}
                      </span>
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>{msg.time}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: 1.4 }}>
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Escribe un mensaje en el chat de la ${session.name}...`}
                  className="glass-input"
                  style={{ flex: 1, fontSize: '13px' }}
                />
                <button 
                  type="submit" 
                  className="glass-pill coral" 
                  style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={15} />
                  <span>Enviar</span>
                </button>
              </form>
            </GlassCard>
          )}

          {/* SECTION 4: ▶️ Grabación */}
          {(activeSection === 'all' || activeSection === 'recording') && (
            <div>
              {session.youtubeUrl ? (
                <GlassCard tint="neutral" style={{ padding: '0px', overflow: 'hidden', aspectRatio: '16/9' }}>
                  {showVideo ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`${getYoutubeEmbedUrl(session.youtubeUrl)}?autoplay=1`}
                      title={session.title}
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                      style={{ border: 'none', display: 'block' }}
                    />
                  ) : (
                    <div 
                      onClick={() => setShowVideo(true)}
                      style={{ 
                        position: 'relative', 
                        width: '100%', 
                        height: '100%', 
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.6)), url(${getYoutubeThumbnail(session.youtubeUrl) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000'})`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        color: '#fff',
                        gap: '12px'
                      }}
                    >
                      <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.9)', 
                        color: '#e53e3e', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                      }}>
                        <Play size={28} style={{ marginLeft: '4px' }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                        ▶️ Ver Grabación de la {session.name}
                      </span>
                    </div>
                  )}
                </GlassCard>
              ) : (
                <GlassCard tint="neutral" style={{ padding: '36px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                      <Play size={26} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
                    ▶️ Grabación disponible próximamente
                  </h3>
                  <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.5, maxWidth: '500px', margin: '0 auto' }}>
                    Una vez impartida la clase en vivo de la <strong>{session.name}</strong>, el video grabado estará publicado y accesible en este espacio.
                  </p>
                </GlassCard>
              )}
            </div>
          )}

          {/* Presentation detail */}
          {(activeSection === 'all' || activeSection === 'resources') && (
            <GlassCard tint="neutral" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 700 }}>Presentación de la {session.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.4)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.7)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(253, 232, 232, 0.6)', color: '#f98080' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Presentación_{session.name}.pdf</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>PDF · Material oficial</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => alert(`Visualizando Presentación de la ${session.name}`)}
                    className="glass-pill" 
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                  >
                    Visualizar
                  </button>
                  <button 
                    onClick={() => alert(`Descargando Presentación de la ${session.name}`)}
                    className="glass-pill mint" 
                    style={{ padding: '6px 12px', fontSize: '12px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </GlassCard>
          )}

        </div>

        {/* Right column: Activities and Resources */}
        {(activeSection === 'all' || activeSection === 'resources') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Activities */}
            <GlassCard tint="coral" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', color: '#9b1c1c', marginBottom: '16px', fontWeight: 700 }}>📚 Actividades</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {session.activities && session.activities.length > 0 ? (
                  session.activities.map((act, index) => (
                    <div 
                      key={index}
                      style={{ 
                        padding: '16px', 
                        background: 'rgba(255,255,255,0.4)', 
                        borderRadius: '16px', 
                        border: '1px solid rgba(255,255,255,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{act.title}</span>
                          <span className="glass-pill" style={{ padding: '2px 8px', fontSize: '10px', pointerEvents: 'none', background: act.status === 'Entregada' ? 'rgba(49, 196, 141, 0.2)' : 'rgba(255,255,255,0.6)', border: 'none', color: act.status === 'Entregada' ? '#03543f' : '#374151' }}>
                            {act.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#4b5563', marginTop: '6px', lineHeight: 1.4 }}>
                          {act.desc}
                        </p>
                      </div>

                      <button 
                        onClick={() => alert(`Abriendo detalles para: ${act.title}`)}
                        className="glass-pill coral" 
                        style={{ width: '100%', padding: '6px', justifyContent: 'center', fontSize: '12px' }}
                      >
                        Ver actividad
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                    No hay actividades asignadas a esta sesión.
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Resources */}
            <GlassCard tint="yellow" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', color: '#723b13', marginBottom: '16px', fontWeight: 700 }}>Material complementario</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {session.resources && session.resources.length > 0 ? (
                  session.resources.map((res, index) => (
                    <div 
                      key={index}
                      style={{ 
                        padding: '12px 16px', 
                        background: 'rgba(255,255,255,0.4)', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {res.type === 'PDF' || res.type === 'DOCX' ? <FileText size={16} style={{ color: '#e3a008' }} /> : <LinkIcon size={16} style={{ color: '#e3a008' }} />}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{res.name}</span>
                      </div>

                      <button 
                        onClick={() => alert(`Accediendo a recurso complementario: ${res.name}`)}
                        className="glass-pill" 
                        style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(255,255,255,0.7)' }}
                      >
                        {res.type === 'Web' ? 'Abrir Enlace' : 'Descargar'}
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                    No se han cargado recursos complementarios.
                  </div>
                )}
              </div>
            </GlassCard>

          </div>
        )}

      </div>

    </div>
  );
};

export default SessionPanel;

