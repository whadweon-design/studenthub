import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/GlassCard';
import GlassPill from '../../components/GlassPill';
import { 
  Search, FileText, Download, Link as LinkIcon, Video, CheckSquare, Award, BookOpen
} from 'lucide-react';

const LIBRARY_RESOURCES = [
  // Presentaciones
  { id: 'p1', name: 'Presentación Sesión 01: Fundamentos de IA', category: 'Presentaciones', type: 'PDF', size: '4.8 MB', course: 'IA aplicada al trabajo' },
  { id: 'p2', name: 'Presentación Sesión 02: Prompt Engineering', category: 'Presentaciones', type: 'PDF', size: '5.2 MB', course: 'IA aplicada al trabajo' },
  { id: 'p3', name: 'Presentación Sesión 03: Redacción Académica', category: 'Presentaciones', type: 'PDF', size: '3.9 MB', course: 'IA aplicada al trabajo' },
  { id: 'p4', name: 'Presentación Sesión 04: Presentaciones de Impacto', category: 'Presentaciones', type: 'PDF', size: '6.1 MB', course: 'IA aplicada al trabajo' },
  { id: 'p5', name: 'Presentación: Introducción a Organización Digital', category: 'Presentaciones', type: 'PDF', size: '2.4 MB', course: 'Organización digital' },
  // Plantillas
  { id: 'pl1', name: 'Plantilla de Lectura Crítica Científica', category: 'Plantillas', type: 'DOCX', size: '1.2 MB', course: 'IA aplicada al trabajo' },
  { id: 'pl2', name: 'Ficha de Resumen por IA para Proyectos', category: 'Plantillas', type: 'XLSX', size: '840 KB', course: 'IA aplicada al trabajo' },
  { id: 'pl3', name: 'Plantilla de Prompts de Edición y Estilo', category: 'Plantillas', type: 'PDF', size: '340 KB', course: 'IA aplicada al trabajo' },
  { id: 'pl4', name: 'Calendario Editorial / Proyecto Académico', category: 'Plantillas', type: 'Notion', size: 'Link', course: 'Organización digital' },
  // Grabaciones
  { id: 'g1', name: 'Grabación Sesión 01: Búsqueda Avanzada', category: 'Grabaciones', type: 'Video', size: '1h 32m', course: 'IA aplicada al trabajo' },
  { id: 'g2', name: 'Grabación Sesión 02: Curación Científica', category: 'Grabaciones', type: 'Video', size: '1h 28m', course: 'IA aplicada al trabajo' },
  { id: 'g3', name: 'Grabación Sesión 03: Redacción e IA', category: 'Grabaciones', type: 'Video', size: '1h 41m', course: 'IA aplicada al trabajo' },
  // Actividades
  { id: 'a1', name: 'Actividad 1: Operadores de Búsqueda', category: 'Actividades', type: 'PDF', size: '1.1 MB', course: 'IA aplicada al trabajo' },
  { id: 'a2', name: 'Actividad 2: Extracción de Metadatos', category: 'Actividades', type: 'PDF', size: '920 KB', course: 'IA aplicada al trabajo' },
  { id: 'a3', name: 'Actividad 3: Paráfrasis Científica', category: 'Actividades', type: 'PDF', size: '1.4 MB', course: 'IA aplicada al trabajo' },
  // Recursos
  { id: 'r1', name: 'ChatGPT - Portal de Inteligencia Artificial', category: 'Recursos', type: 'Web', size: 'Link', course: 'Recursos Externos' },
  { id: 'r2', name: 'Claude AI - Redacción y Resúmenes', category: 'Recursos', type: 'Web', size: 'Link', course: 'Recursos Externos' },
  { id: 'r3', name: 'Consensus AI - Buscador Académico de IA', category: 'Recursos', type: 'Web', size: 'Link', course: 'Recursos Externos' },
  { id: 'r4', name: 'Guía Rápida de Prompts Académicos Avanzados', category: 'Recursos', type: 'PDF', size: '2.1 MB', course: 'IA aplicada al trabajo' }
];

const StudentLibrary = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResources, setFilteredResources] = useState(LIBRARY_RESOURCES);

  const categories = ['Todos', 'Presentaciones', 'Plantillas', 'Grabaciones', 'Actividades', 'Recursos'];

  useEffect(() => {
    let result = LIBRARY_RESOURCES;
    
    // Category filter
    if (activeCategory !== 'Todos') {
      result = result.filter(r => r.category === activeCategory);
    }
    
    // Search query filter
    if (searchQuery.trim() !== '') {
      result = result.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.course.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredResources(result);
  }, [activeCategory, searchQuery]);

  const getResourceIcon = (category) => {
    switch (category) {
      case 'Presentaciones':
        return <FileText size={18} style={{ color: '#f98080' }} />;
      case 'Plantillas':
        return <Award size={18} style={{ color: '#e3a008' }} />;
      case 'Grabaciones':
        return <Video size={18} style={{ color: '#3f83f8' }} />;
      case 'Actividades':
        return <CheckSquare size={18} style={{ color: '#31c48d' }} />;
      case 'Recursos':
      default:
        return <LinkIcon size={18} style={{ color: '#9f1239' }} />;
    }
  };

  const handleAction = (res) => {
    if (res.type === 'Web' || res.size === 'Link') {
      alert(`Abriendo enlace externo para: ${res.name}`);
    } else {
      alert(`Iniciando descarga del archivo: ${res.name}`);
    }
  };

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '30px' }}>
        <span className="glass-pill coral" style={{ marginBottom: '8px', pointerEvents: 'none' }}>Biblioteca general</span>
        <h1 style={{ fontSize: '32px', letterSpacing: '-0.8px', marginBottom: '8px' }}>Repositorio de Recursos</h1>
        <p style={{ color: '#4b5563' }}>Busca y descarga todas las presentaciones, plantillas y enlaces compartidos en clase.</p>
      </div>

      {/* Controls Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
        
        {/* Search bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={20} style={{ position: 'absolute', left: '18px', top: '16px', color: '#9ca3af' }} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre de recurso o curso..."
            className="glass-input"
            style={{ paddingLeft: '52px', height: '52px', borderRadius: '20px' }}
          />
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map(cat => {
            let tint = 'neutral';
            if (cat === 'Presentaciones') tint = 'coral';
            else if (cat === 'Plantillas') tint = 'yellow';
            else if (cat === 'Grabaciones') tint = 'blue';
            else if (cat === 'Actividades') tint = 'mint';
            
            return (
              <GlassPill
                key={cat}
                tint={tint}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                style={{ fontSize: '13px', padding: '8px 18px' }}
              >
                {cat}
              </GlassPill>
            );
          })}
        </div>
      </div>

      {/* Resources grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredResources.length > 0 ? (
          filteredResources.map(res => (
            <GlassCard 
              key={res.id} 
              tint={
                res.category === 'Presentaciones' ? 'coral' : 
                res.category === 'Plantillas' ? 'yellow' : 
                res.category === 'Grabaciones' ? 'blue' : 
                res.category === 'Actividades' ? 'mint' : 'neutral'
              }
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '22px' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="glass-panel" style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '10px', border: 'none', background: 'rgba(255,255,255,0.6)', fontWeight: 700, color: 'rgba(0,0,0,0.6)' }}>
                    {res.category}
                  </span>
                  <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>{res.course}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
                    {getResourceIcon(res.category)}
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', lineHeight: 1.4 }}>
                    {res.name}
                  </h4>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px' }}>
                <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: 500 }}>
                  Formato: <strong>{res.type}</strong> {res.size !== 'Link' && `· ${res.size}`}
                </span>
                
                <button 
                  onClick={() => handleAction(res)}
                  className="glass-pill" 
                  style={{ padding: '6px 14px', fontSize: '12px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {res.type === 'Web' || res.size === 'Link' ? <LinkIcon size={12} /> : <Download size={12} />}
                  <span>{res.type === 'Web' || res.size === 'Link' ? 'Abrir' : 'Bajar'}</span>
                </button>
              </div>
            </GlassCard>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }} className="glass-panel">
            <BookOpen size={40} style={{ color: '#9ca3af', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', color: '#374151' }}>No se encontraron recursos</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Prueba cambiando de categoría o ajustando los términos de búsqueda.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentLibrary;
