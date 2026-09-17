import React from 'react';
import GlassCard from './GlassCard';
import { ArrowLeft, Video, Info, XCircle, ShieldCheck, UserCheck } from 'lucide-react';

// Utility to parse YouTube URLs into clean embed URLs
export const getYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
  } catch (e) {
    console.error('Error parsing YouTube URL:', e);
  }
  return url.includes('youtube.com/embed/') ? url : '';
};

const YouTubeLivePlayer = ({ session, user, onClose }) => {
  // Retrieve live stream URL from session properties (liveUrl, youtubeLiveUrl, or meetLink if YouTube)
  const rawLiveUrl = session?.liveUrl || session?.youtubeLiveUrl || session?.meetLink || session?.youtubeUrl || '';
  const embedUrl = getYoutubeEmbedUrl(rawLiveUrl);

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <GlassCard tint="blue" style={{ padding: '24px', borderRadius: '24px', overflow: 'hidden' }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={handleClose} 
            className="glass-pill secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <ArrowLeft size={16} />
            <span>Volver a la Sesión</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="glass-pill blue" style={{ padding: '2px 10px', fontSize: '11px', fontWeight: 800 }}>
                🔴 CLASE EN VIVO
              </span>
              <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: 600 }}>
                {session.name} — Sala {session.id}
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px', color: '#111827' }}>
              {session.title}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user?.isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(225, 239, 254, 0.9)', color: '#1e429f', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(63, 131, 248, 0.4)' }}>
              <ShieldCheck size={16} />
              <span>Modo Anfitrión (Profesor)</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.7)', color: '#374151', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 600 }}>
              <UserCheck size={16} />
              <span>Participante ({user?.name || 'Alumno'})</span>
            </div>
          )}

          <button 
            onClick={handleClose} 
            className="glass-pill coral" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 700 }}
          >
            <XCircle size={15} />
            <span>Salir de la clase</span>
          </button>
        </div>
      </div>

      {/* Embedded Player or Upcoming State Container */}
      {embedUrl ? (
        <div style={{ width: '100%', aspectRatio: '16/9', maxHeight: '560px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', background: '#000' }}>
          <iframe 
            width="100%" 
            height="100%" 
            src={`${embedUrl}?autoplay=1&modestbranding=1&rel=0`}
            title={`Clase en vivo: ${session.title}`}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
            style={{ border: 'none', display: 'block', width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <div style={{ 
          minHeight: '420px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '16px', 
          background: 'rgba(15, 23, 42, 0.75)', 
          borderRadius: '20px', 
          color: '#fff',
          textAlign: 'center',
          padding: '36px 24px'
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', border: '2px solid rgba(59, 130, 246, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
            <Video size={32} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            🔴 Clase en vivo próximamente
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '520px', lineHeight: 1.6, margin: 0 }}>
            La transmisión en vivo de la <strong>{session.name}</strong> estará disponible en este espacio a la hora programada {session.day ? `(${session.day}${session.time ? ` a las ${session.time}` : ''})` : ''}.
          </p>
          <div style={{ fontSize: '12px', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.15)', padding: '6px 16px', borderRadius: '50px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            Transmisión oficial de YouTube Live embebida en Student Hub
          </div>
        </div>
      )}

      {/* Footer info badge */}
      <div style={{ marginTop: '14px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
        🔒 Transmisión en vivo independiente para {session.name} · Integrada dentro de Student Hub
      </div>
    </GlassCard>
  );
};

export default YouTubeLivePlayer;
