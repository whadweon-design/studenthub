import React from 'react';
import GlassCard from '../../components/GlassCard';
import GlassPill from '../../components/GlassPill';
import GlassSculpture from '../../components/GlassSculpture';
import logoImg from '../../assets/logo-nobg.png';
import { 
  Home, BookOpen, Library, Calendar, Folder, Star, Brain, ArrowRight, LogOut, User 
} from 'lucide-react';

const StudentDashboard = ({ 
  user, 
  settings, 
  courses, 
  activeTab, 
  setActiveTab, 
  onLogout, 
  onSelectCourse, 
  onSelectSession 
}) => {
  // Find next session that is not finished
  const nextSession = settings.sessions.find(s => s.status !== 'Finalizada') || settings.sessions[3];

  // Dynamic real counts for Biblioteca (no hardcoded mock numbers)
  const presentacionesCount = settings.sessions.filter(s => s.status === 'Finalizada' && s.presentationUrl && s.presentationUrl !== '#' && s.presentationUrl !== '').length;
  const plantillasCount = settings.sessions.reduce((acc, s) => acc + (s.resources ? s.resources.filter(r => r.type === 'DOCX' || r.type === 'XLSX').length : 0), 0);
  const grabacionesCount = settings.sessions.filter(s => s.youtubeUrl && s.youtubeUrl.trim() !== '').length;

  const getCourseProgress = (courseId) => {
    const id = courseId || 'level-up';
    return user.progress?.[id] !== undefined ? user.progress[id] : (user.progress?.['ia-trabajo'] || 0);
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'brain': return <Brain size={20} />;
      case 'folder': return <Folder size={20} />;
      case 'star': return <Star size={20} />;
      default: return <BookOpen size={20} />;
    }
  };

  const handleNextSessionClick = () => {
    onSelectSession(nextSession);
  };

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Student Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={logoImg} 
            alt="Student Hub Logo" 
            style={{ 
              width: '42px', 
              height: '42px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(63, 131, 248, 0.3))' 
            }} 
          />
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>
            Aula<span style={{ color: '#3f83f8' }}>Virtual</span>
          </span>
        </div>

        {/* User profile info & logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', background: 'rgba(255,255,255,0.4)', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.6)' }}>
            <User size={15} style={{ color: '#4b5563' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{user.name}</span>
          </div>
          <button 
            onClick={onLogout} 
            className="glass-pill coral" 
            style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={14} />
            <span>Salir</span>
          </button>
        </div>
      </div>

      <div className="desktop-grid">
        
        {/* Navigation Sidebar (Desktop) / Nav Header (Mobile) */}
        <div className="sidebar-nav">
          <GlassPill 
            tint="mint" 
            active={activeTab === 'inicio'} 
            onClick={() => setActiveTab('inicio')}
            icon={<Home size={18} />}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            Inicio
          </GlassPill>

          <GlassPill 
            tint="blue" 
            active={activeTab === 'cursos'} 
            onClick={() => setActiveTab('cursos')}
            icon={<BookOpen size={18} />}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            Cursos
          </GlassPill>

          <GlassPill 
            tint="coral" 
            active={activeTab === 'biblioteca'} 
            onClick={() => setActiveTab('biblioteca')}
            icon={<Library size={18} />}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            Biblioteca
          </GlassPill>
        </div>

        {/* Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Main Course Hero Card */}
          <GlassCard tint="multi" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '28px', lineHeight: 1.2, marginBottom: '10px', letterSpacing: '-0.5px' }}>
                  {settings.courseName}
                </h2>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.5, marginBottom: '28px' }}>
                  {settings.courseDescription}
                </p>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    <span>Progreso del curso</span>
                    <span>{getCourseProgress(courses[0]?.id || 'level-up')}% completado</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill mint" 
                      style={{ width: `${getCourseProgress(courses[0]?.id || 'level-up')}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => onSelectCourse(courses[0] || { id: 'level-up', name: settings.courseName })} 
                  className="glass-pill mint" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>Continuar curso</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* 3D Glass Sculpture Render */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <GlassSculpture size={180} />
              </div>
            </div>
          </GlassCard>


          {/* Mobile Display of side cards (shows underneath main hero in tablet/mobile) */}
          <div className="mobile-only-grid" style={{ display: 'none', gap: '16px' }}>
            <style>{`
              @media (max-width: 1024px) {
                .mobile-only-grid {
                  display: grid !important;
                  grid-template-columns: 1fr 1fr;
                }
              }
              @media (max-width: 480px) {
                .mobile-only-grid {
                  grid-template-columns: 1fr;
                }
              }
            `}</style>
            
            {/* Próxima Sesión Card */}
            <GlassCard tint="blue" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#1e429f', fontWeight: 600 }}>Próxima sesión</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginTop: '6px' }}>
                    {nextSession.date ? `${nextSession.day} · ${nextSession.time}` : 'Fechas por confirmar'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>
                    {nextSession.title}
                  </div>
                </div>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.4)', color: '#3f83f8' }}>
                  <Calendar size={18} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  onClick={handleNextSessionClick} 
                  className="glass-pill blue" 
                  style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center', borderRadius: '50%' }}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </GlassCard>

            {/* Biblioteca Summary Card */}
            <GlassCard tint="yellow" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#723b13' }}>Biblioteca</span>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.4)', color: '#e3a008' }}>
                  <Folder size={18} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '4px' }}>
                  <span style={{ color: '#4b5563' }}>Presentaciones</span>
                  <span style={{ fontWeight: 700 }}>{presentacionesCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '4px' }}>
                  <span style={{ color: '#4b5563' }}>Plantillas</span>
                  <span style={{ fontWeight: 700 }}>{plantillasCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#4b5563' }}>Grabaciones</span>
                  <span style={{ fontWeight: 700 }}>{grabacionesCount}</span>
                </div>
              </div>
            </GlassCard>
          </div>


        </div>

        {/* Right Sidebar (Desktop) */}
        <div className="desktop-only-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <style>{`
            @media (max-width: 1024px) {
              .desktop-only-sidebar {
                display: none !important;
              }
            }
          `}</style>
          
          {/* Próxima Sesión Card */}
          <GlassCard tint="blue" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#1e429f', fontWeight: 600 }}>Próxima sesión</span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginTop: '8px', color: '#111827' }}>
                  {nextSession.date ? `${nextSession.day} · ${nextSession.time}` : 'Fechas por confirmar'}
                </h3>
              </div>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.4)', color: '#3f83f8' }}>
                <Calendar size={20} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{nextSession.title}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Capacitación en vivo</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px' }}>
              <button 
                onClick={handleNextSessionClick}
                className="glass-pill blue" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }}
              >
                <span>Ir a la sesión</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </GlassCard>

          {/* Biblioteca Card */}
          <GlassCard tint="yellow" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', color: '#723b13' }}>Biblioteca</h3>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.4)', color: '#e3a008' }}>
                <Folder size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '6px' }}>
                <span style={{ color: '#4b5563' }}>Presentaciones</span>
                <span className="glass-panel" style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '11px', background: 'rgba(255,255,255,0.5)', border: 'none', fontWeight: 700 }}>
                  {presentacionesCount}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '6px' }}>
                <span style={{ color: '#4b5563' }}>Plantillas</span>
                <span className="glass-panel" style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '11px', background: 'rgba(255,255,255,0.5)', border: 'none', fontWeight: 700 }}>
                  {plantillasCount}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#4b5563' }}>Grabaciones</span>
                <span className="glass-panel" style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '11px', background: 'rgba(255,255,255,0.5)', border: 'none', fontWeight: 700 }}>
                  {grabacionesCount}
                </span>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('biblioteca')}
              className="glass-btn secondary"
              style={{ width: '100%', marginTop: '20px', padding: '10px', fontSize: '13px' }}
            >
              Explorar recursos
            </button>
          </GlassCard>
        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;
