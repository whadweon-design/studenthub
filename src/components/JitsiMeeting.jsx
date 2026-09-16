import React, { useEffect, useRef, useState } from 'react';
import GlassCard from './GlassCard';
import { ArrowLeft, Video, ShieldCheck, UserCheck, AlertCircle, LogOut } from 'lucide-react';

const JitsiMeeting = ({ session, user, onClose }) => {
  const containerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate deterministic independent room name per session ID
  const roomName = `StudentHub_LevelUp_Sesion_${String(session.id).padStart(2, '0')}_v1`;

  useEffect(() => {
    let isMounted = true;

    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const existingScript = document.getElementById('jitsi-external-api-script');
        if (existingScript) {
          existingScript.addEventListener('load', resolve);
          existingScript.addEventListener('error', reject);
          return;
        }

        const script = document.createElement('script');
        script.id = 'jitsi-external-api-script';
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar la API de videollamada de Jitsi'));
        document.body.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();
        if (!isMounted || !containerRef.current) return;

        // Clean container before rendering new iframe
        containerRef.current.innerHTML = '';

        const isTeacher = user?.isAdmin || false;
        const displayName = isTeacher 
          ? `👨‍🏫 ${user?.name || 'Profesor Carlos'} (Anfitrión)`
          : user?.name || 'Alumno Student Hub';

        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          width: '100%',
          height: '560px',
          parentNode: containerRef.current,
          userInfo: {
            displayName: displayName,
            email: user?.email || 'alumno@studenthub.com'
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false, // Direct smooth join
            disableDeepLinking: true, // Prevents mobile browsers from forcing app redirect
            enableWelcomePage: false,
            enableClosePage: false
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: 'rgba(15, 23, 42, 0.95)',
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'f当地', 'hangup', 'chat', 'raisehand', 'videoquality', 'filmstrip',
              'participants-pane', 'tileview', 'select-background', 'settings'
            ]
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        api.addEventListener('videoConferenceJoined', () => {
          if (isMounted) setLoading(false);
        });

        api.addEventListener('videoConferenceLeft', () => {
          if (isMounted && onClose) onClose();
        });

        api.addEventListener('readyToClose', () => {
          if (isMounted && onClose) onClose();
        });

        setLoading(false);
      } catch (err) {
        console.error('Error inicializando Jitsi Meet:', err);
        if (isMounted) {
          setError('Ocurrió un inconveniente al conectar con la clase en vivo. Revisa tu conexión a internet.');
          setLoading(false);
        }
      }
    };

    initJitsi();

    return () => {
      isMounted = false;
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (e) {
          console.error(e);
        }
        jitsiApiRef.current = null;
      }
    };
  }, [session.id, user, roomName, onClose]);

  const handleLeaveCall = () => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.executeCommand('hangup');
      } catch (e) {
        console.error(e);
      }
    }
    if (onClose) onClose();
  };

  return (
    <GlassCard tint="blue" style={{ padding: '24px', borderRadius: '24px', overflow: 'hidden' }}>
      
      {/* Embedded Meeting Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={handleLeaveCall}
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

        {/* User Role Badge & Exit Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user?.isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(225, 239, 254, 0.9)', color: '#1e429f', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(63, 131, 248, 0.4)' }}>
              <ShieldCheck size={16} />
              <span>Modo Anfitrión (Profesor)</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.7)', color: '#374151', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 600 }}>
              <UserCheck size={16} />
              <span>Participante ({user?.name})</span>
            </div>
          )}

          <button 
            onClick={handleLeaveCall}
            className="glass-pill coral"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 700 }}
          >
            <LogOut size={15} />
            <span>Salir de la clase</span>
          </button>
        </div>
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div style={{ height: '560px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '20px', color: '#fff' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)', borderTopColor: '#3f83f8', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>Conectando a la sala en vivo ({session.name})...</div>
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>Identificador de sala: {roomName}</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ padding: '30px', background: 'rgba(254, 226, 226, 0.9)', color: '#9b1c1c', borderRadius: '20px', textAlign: 'center' }}>
          <AlertCircle size={32} style={{ marginBottom: '10px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{error}</h3>
          <button onClick={onClose} className="glass-pill secondary" style={{ marginTop: '16px' }}>
            Volver
          </button>
        </div>
      )}

      {/* Jitsi Native Embed Container */}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '560px', 
          borderRadius: '20px', 
          overflow: 'hidden',
          display: loading || error ? 'none' : 'block',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }} 
      />

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
        🔒 Sala en vivo aislada e independiente para {session.name} · Transmisión integrada dentro de Student Hub
      </div>
    </GlassCard>
  );
};

export default JitsiMeeting;
