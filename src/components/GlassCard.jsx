import React from 'react';

/**
 * GlassCard - Translucent Glassmorphic Container
 * @param {string} tint - mint | blue | coral | yellow | multi | neutral
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline styles
 * @param {node} children - Nested components
 */
const GlassCard = ({ tint = 'neutral', className = '', style = {}, children, ...props }) => {
  const tintClass = tint ? `${tint}` : '';
  return (
    <div 
      className={`glass-panel ${tintClass} ${className}`} 
      style={style} 
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
