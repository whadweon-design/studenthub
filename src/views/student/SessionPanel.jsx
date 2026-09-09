import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/GlassCard';
import { 
  ArrowLeft, FileText, Download, Link as LinkIcon, Calendar, Video, Clock, CheckCircle, Circle, Play 
} from 'lucide-react';
import { updateUserProgress } from '../../services/db';

const SessionPanel = ({ session, course, user, onBack, onProgressUpdate }) => {
  const [completed, setCompleted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const courseId = course?.id || 'ia-trabajo';
    const list = user.completedSessions?.[courseId] || [];
    setCompleted(list.includes(session.id));
  }, [session.id, user, course]);

  const handleToggleComplete = () => {
    const courseId = course?.id || 'ia-trabajo';
    const freshCompletedList = [...(user.completedSessions?.[courseId] || [])];
    const index = freshCompletedList.indexOf(session.id);
    
    if (index === -1) {
      freshCompletedList.push(session.id);
    } else {
      freshCompletedList.splice(index, 1);
    }

    // Recalculate course completion percentage based on total sessions (4)
    const newProgress = Math.round((freshCompletedList.length / 4) * 100);

    // Save database progress
    updateUserProgress(user.email, course.id, newProgress, freshCompletedList);
    setCompleted(!completed);
    
    if (onProgressUpdate) {
      onProgressUpdate();
    }
  };

  // Convert youtube standard URL to embed format
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
    <div className="fade-in" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Navigation */}
      <button 
        onClick={onBack} 
        className="glass-pill secondary" 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}
      >
        <ArrowLeft size={16} />
        <span>Volver a Clases</span>
      </button>

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
        <div>
          <span className="glass-pill blue" style={{ marginBottom: '8px', pointerEvents: 'none' }}>
            {session.name} — {session.day}
          </span>
          <h1 style={{ fontSize: '30px', marginTop: '6px', letterSpacing: '-0.5px' }}>{session.title}</h1>
          <div style={{ display: 'flex', gap: '15px', marginTop: '8px', color: '#4b5563', fontSize: '14px', flexWrap: 'wrap' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Main session content (Video & files) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Recording Player (Youtube) */}
          {session.status === 'Finalizada' && (
            <GlassCard tint="neutral" style={{ padding: '0px', overflow: 'hidden', aspectRatio: '16/9' }}>
              {showVideo && session.youtubeUrl ? (
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
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}>
                    <Play size={28} style={{ marginLeft: '4px' }} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '15px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Ver Grabación de la Sesión</span>
                </div>
              )}
            </GlassCard>
          )}

          {/* En Vivo Modality Meet panel */}
          {session.status === 'En vivo' && (
            <GlassCard tint="blue" style={{ padding: '36px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(225, 239, 254, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f83f8', animation: 'pulse-live 2.5s infinite' }}>
                  <Video size={30} />
                </div>
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>¡Esta sesión está programada en vivo!</h3>
              <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                Conéctate a la sesión en vivo a través de Google Meet / Zoom en la fecha programada. Prepárate con tus preguntas y proyectos.
              </p>
              {session.meetLink ? (
                <a 
                  href={session.meetLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="glass-btn primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Video size={18} />
                  <span>Unirse a la clase en vivo</span>
                </a>
              ) : (
                <span className="glass-pill" style={{ pointerEvents: 'none' }}>El enlace se habilitará antes de iniciar</span>
              )}
            </GlassCard>
          )}

          {/* Upcoming placeholders */}
          {session.status === 'Próxima' && (
            <GlassCard tint="neutral" style={{ padding: '36px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  <Calendar size={30} />
                </div>
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Próxima Sesión</h3>
              <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.5 }}>
                El contenido de la grabación y materiales complementarios se subirán automáticamente una vez finalizada la clase en vivo.
              </p>
            </GlassCard>
          )}

          {/* Presentation detail */}
          {session.status === 'Finalizada' && (
            <GlassCard tint="neutral" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 700 }}>Presentación de la sesión</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.4)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.7)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(253, 232, 232, 0.6)', color: '#f98080' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>Presentación_{session.name}.pdf</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>PDF · 4.8 MB</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a 
                    href={session.presentationUrl}
                    onClick={(e) => { e.preventDefault(); alert(`Visualizando Presentación de la ${session.name}`); }}
                    className="glass-pill" 
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                  >
                    Visualizar
                  </a>
                  <a 
                    href={session.presentationUrl}
                    onClick={(e) => { e.preventDefault(); alert(`Descargando Presentación de la ${session.name}`); }}
                    className="glass-pill mint" 
                    style={{ padding: '6px 12px', fontSize: '12px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Download size={14} />
                  </a>
                </div>
              </div>
            </GlassCard>
          )}

        </div>

        {/* Right column: Activities and Resources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Activities */}
          <GlassCard tint="coral" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', color: '#9b1c1c', marginBottom: '16px', fontWeight: 700 }}>Actividades</h3>
            
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
                  No hay actividades pendientes en esta sesión.
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

      </div>

    </div>
  );
};

export default SessionPanel;
