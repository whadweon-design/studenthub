import React from 'react';

/**
 * GlassPill - Capsule Liquid Glass Button / Nav item
 * @param {string} tint - mint | blue | coral
 * @param {boolean} active - Active navigation state
 * @param {node} icon - Optional Lucide or SVG icon
 * @param {string} className - Additional CSS classes
 * @param {function} onClick - Press action handler
 */
const GlassPill = ({ tint = 'mint', active = false, icon, children, className = '', onClick, ...props }) => {
  return (
    <button
      className={`glass-pill ${tint} ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="glass-pill-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default GlassPill;
