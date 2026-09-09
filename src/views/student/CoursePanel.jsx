import React from 'react';
import GlassCard from '../../components/GlassCard';
import { ArrowLeft, Play, Calendar, Video, FileText, CheckCircle, Circle } from 'lucide-react';

const CoursePanel = ({ course, settings, user, onBack, onSelectSession }) => {
  const getSessionStatusIcon = (status) => {
    switch (status) {
      case 'Finalizada':
        return <CheckCircle size={22} style={{ color: '#31c48d' }} />;
      case 'En vivo':
        return <Video size={22} style={{ color: '#3f83f8', animation: 'pulse-live 2s infinite' }} />;
      case 'Próxima':
      default:
        return <Circle size={22} style={{ color: '#9ca3af' }} />;
    }
  };

  const getSessionStatusBadge = (status) => {
    switch (status) {
      case 'Finalizada':
        return <span className="glass-pill mint" style={{ padding: '4px 10px', fontSize: '11px', pointerEvents: 'none' }}>Finalizada</span>;
      case 'En vivo':
        return <span className="glass-pill blue" style={{ padding: '4px 10px', fontSize: '11px', pointerEvents: 'none', animation: 'pulse-live 2s infinite' }}>En Vivo</span>;
      case 'Próxima':
      default:
        return <span className="glass-pill" style={{ padding: '4px 10px', fontSize: '11px', pointerEvents: 'none', background: 'rgba(255,255,255,0.4)', color: '#4b5563' }}>Próximamente</span>;
    }
  };

  const isSessionCompleted = (sessionId) => {
    return user.completedSessions?.[course.id]?.includes(sessionId) || false;
  };

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* CSS Pulse animation for live session */}
      <style>{`
        @keyframes pulse-live {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; box-shadow: 0 0 10px rgba(63, 131, 248, 0.4); }
          100% { transform: scale(1); opacity: 0.9; }
        }
      `}</style>

      {/* Navigation */}
      <button 
        onClick={onBack} 
        className="glass-pill secondary" 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px' }}
      >
        <ArrowLeft size={16} />
        <span>Volver a Mis Cursos</span>
      </button>

      {/* Course Main Details */}
      <div style={{ marginBottom: '35px' }}>
        <span className="glass-pill blue" style={{ marginBottom: '12px', pointerEvents: 'none' }}>Detalle de capacitación</span>
        <h1 style={{ fontSize: '32px', letterSpacing: '-0.8px', marginBottom: '10px' }}>{course.name}</h1>
        <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.6, maxWidth: '700px' }}>
          {course.id === 'ia-trabajo' ? settings.courseDescription : course.description}
        </p>
      </div>

      {/* Sessions Syllabus List */}
      <div>
        <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 700 }}>Calendario del temario</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {settings.sessions.map((session, index) => {
            const completed = isSessionCompleted(session.id);
            return (
              <GlassCard 
                key={session.id} 
                tint={session.status === 'En vivo' ? 'blue' : session.status === 'Finalizada' ? 'mint' : 'neutral'}
                style={{ 
                  padding: '20px 28px', 
                  display: 'grid', 
                  gridTemplateColumns: 'auto 1fr auto', 
                  alignItems: 'center', 
                  gap: '20px', 
                  cursor: 'pointer' 
                }}
                onClick={() => onSelectSession(session)}
              >
                {/* Status indicator */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {getSessionStatusIcon(session.status)}
                </div>

                {/* Session details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280' }}>
                      {session.name} — {session.day}
                    </span>
                    {getSessionStatusBadge(session.status)}
                    {completed && (
                      <span className="glass-pill mint" style={{ padding: '2px 8px', fontSize: '10px', pointerEvents: 'none', background: 'rgba(49, 196, 141, 0.2)', border: 'none', color: '#03543f', fontWeight: 700 }}>
                        Completada
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '18px', marginTop: '6px', marginBottom: '4px' }}>
                    {session.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563' }}>
                    <Calendar size={14} />
                    <span>
                      {session.date ? `${session.date} a las ${session.time}` : 'Fechas próximamente por confirmar'}
                    </span>
                  </div>
                </div>

                {/* Enter Action */}
                <div>
                  <button 
                    className={`glass-pill ${session.status === 'En vivo' ? 'blue' : session.status === 'Finalizada' ? 'mint' : 'neutral'}`}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    {session.status === 'Finalizada' ? 'Ver Grabación' : session.status === 'En vivo' ? 'Entrar Clase' : 'Ver Detalles'}
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default CoursePanel;
