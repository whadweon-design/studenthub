import React from 'react';
import logoImg from '../assets/logo-nobg.png';

const GlassSculpture = ({ className = '', size = 200, style = {} }) => {
  return (
    <div 
      className={`glass-sculpture-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...style
      }}
    >
      <style>{`
        @keyframes float-sculpture {
          0% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-8px) rotate(2deg) scale(1.03); }
          100% { transform: translateY(0px) rotate(0deg) scale(1); }
        }
        @keyframes pulse-glow {
          0% { opacity: 0.55; transform: scale(0.96); }
          50% { opacity: 0.9; transform: scale(1.06); }
          100% { opacity: 0.55; transform: scale(0.96); }
        }
        .glass-sculpture-img {
          animation: float-sculpture 7s ease-in-out infinite;
          filter: drop-shadow(0 15px 25px rgba(59, 130, 246, 0.22));
          transition: transform 0.3s ease;
        }
        .glass-sculpture-wrapper:hover .glass-sculpture-img {
          transform: scale(1.06) translateY(-10px);
        }
        .sculpture-glow {
          animation: pulse-glow 5s ease-in-out infinite;
        }
      `}</style>
      
      {/* Background radial glow */}
      <div 
        className="sculpture-glow" 
        style={{
          position: 'absolute',
          width: '85%',
          height: '85%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(52, 211, 153, 0.35) 50%, rgba(255,255,255,0) 80%)',
          filter: 'blur(28px)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      {/* Main 3D Logo Image from Image 2 */}
      <img 
        src={logoImg} 
        alt="Student Hub Logo"
        className="glass-sculpture-img"
        style={{
          width: '92%',
          height: '92%',
          objectFit: 'contain',
          zIndex: 1,
          position: 'relative'
        }}
      />
    </div>
  );
};

export default GlassSculpture;

