import React from 'react';

const GlassSculpture = ({ className = '', size = 200 }) => {
  return (
    <div 
      className={`glass-sculpture-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <style>{`
        @keyframes float-sculpture {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes pulse-glow {
          0% { opacity: 0.6; }
          50% { opacity: 0.95; }
          100% { opacity: 0.6; }
        }
        .glass-sculpture-svg {
          animation: float-sculpture 8s ease-in-out infinite;
        }
        .sculpture-glow {
          animation: pulse-glow 6s ease-in-out infinite;
        }
      `}</style>
      
      {/* Background radial glow */}
      <div 
        className="sculpture-glow" 
        style={{
          position: 'absolute',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(134,239,172,0.4) 0%, rgba(56,189,248,0.2) 50%, rgba(255,255,255,0) 80%)',
          filter: 'blur(30px)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="glass-sculpture-svg"
        style={{ zIndex: 1, position: 'relative' }}
      >
        <defs>
          {/* Main Translucent Gradients */}
          <linearGradient id="sculpture-grad-primary" x1="20" y1="30" x2="180" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.9" />
          </linearGradient>
          
          <linearGradient id="sculpture-grad-inner" x1="160" y1="20" x2="40" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#86efac" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
          </linearGradient>
          
          <radialGradient id="specular-highlight" cx="35%" cy="35%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Frosted Glass Shadow Filter */}
          <filter id="glass-shadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#1e3a8a" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Torus / Ribbon Sculpture Layers */}
        {/* Layer 1: Back shadows and glow */}
        <path 
          d="M 100,30 C 145,30 175,70 170,110 C 165,150 120,175 90,165 C 60,155 35,120 40,80 C 45,40 65,30 100,30 Z" 
          fill="url(#sculpture-grad-primary)" 
          fillOpacity="0.25"
          filter="url(#glass-shadow)"
        />

        {/* Layer 2: Main Body Loop (Curved Torus shape) */}
        <path 
          d="M 100,35 C 138,35 168,68 168,105 C 168,138 135,165 100,165 C 65,165 32,138 32,105 C 32,68 62,35 100,35 Z" 
          fill="url(#sculpture-grad-primary)" 
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.5"
        />

        {/* Layer 3: Overlay Inner Loop creating refraction depth */}
        <path 
          d="M 100,45 C 128,45 152,70 152,100 C 152,125 125,148 100,148 C 75,148 48,125 48,100 C 48,70 72,45 100,45 Z" 
          fill="url(#sculpture-grad-inner)" 
          fillOpacity="0.65"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1"
        />

        {/* Layer 4: Specular highlights & reflections */}
        {/* Top-left outer rim reflection */}
        <path 
          d="M 50,60 C 65,45 80,40 100,40 C 120,40 135,45 150,60" 
          stroke="url(#specular-highlight)" 
          strokeWidth="4" 
          strokeLinecap="round"
          opacity="0.9"
        />
        
        {/* Core highlight stripe */}
        <path 
          d="M 100,38 C 130,38 158,62 162,95 C 164,115 155,135 140,148" 
          stroke="rgba(255, 255, 255, 0.8)" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />

        {/* Inner highlight loop */}
        <path 
          d="M 68,90 C 70,72 82,58 100,58 C 118,58 128,70 130,88" 
          stroke="rgba(255, 255, 255, 0.6)" 
          strokeWidth="1" 
          strokeLinecap="round"
        />

        {/* Tiny glass bubbles inside loop for authentic glass feel */}
        <circle cx="70" cy="70" r="3" fill="#ffffff" fillOpacity="0.8" />
        <circle cx="135" cy="120" r="4.5" fill="#ffffff" fillOpacity="0.6" />
        <circle cx="120" cy="140" r="2" fill="#ffffff" fillOpacity="0.9" />
        <circle cx="65" cy="115" r="3.5" fill="#ffffff" fillOpacity="0.5" />
      </svg>
    </div>
  );
};

export default GlassSculpture;
