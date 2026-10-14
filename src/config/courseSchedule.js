// Calendario y temario oficial centralizado de estud-IA y CREA (Solo lectura)
// Zona horaria oficial: America/Mexico_City (UTC-6 permanente en Ciudad de México)

export const OFFICIAL_COURSE_SCHEDULE = Object.freeze({
  courseName: 'estud-IA y CREA',
  courseShortName: 'estud-IA y CREA',
  courseDescription: 'Un curso práctico para estudiantes que quieren descubrir cómo utilizar la Inteligencia Artificial para aprender mejor, desarrollar ideas, crear contenido y prepararse para el mundo profesional.',
  officialStartDateIso: '2026-10-26',
  officialStartDateLabel: 'Lunes 26 de octubre de 2026',
  officialStartDateShort: '26 de octubre de 2026',
  timezone: 'America/Mexico_City',
  timezoneLabel: 'Hora de Ciudad de México',
  modalityLabel: 'Online / En vivo',
  totalDurationLabel: '4 sesiones · 6 horas',
  totalHours: 6,
  sessionDurationMinutes: 90,
  sessionDurationLabel: '1h 30m',
  startTime: '7:00 PM',
  endTime: '8:30 PM',
  scheduleRangeLabel: '7:00 PM a 8:30 PM',
  fullScheduleLabel: '7:00 PM a 8:30 PM (Hora de Ciudad de México)',
  sessions: Object.freeze([
    Object.freeze({
      id: '1',
      number: 1,
      name: 'Sesión 01',
      title: 'Explora la IA: Cómo Funciona y Para Qué Sirve',
      description: 'Descubre qué es la inteligencia artificial, cómo funciona, cuáles son sus capacidades y limitaciones, y cómo aprovecharla responsablemente en tus estudios.',
      day: 'Lunes',
      date: '26 de octubre de 2026',
      fullDateLabel: 'Lunes 26 de octubre de 2026',
      startTime: '7:00 PM',
      endTime: '8:30 PM',
      time: '7:00 PM a 8:30 PM',
      timezone: 'America/Mexico_City',
      timezoneLabel: 'Hora de Ciudad de México',
      startIso: '2026-10-26T19:00:00-06:00',
      endIso: '2026-10-26T20:30:00-06:00',
      status: 'Próxima',
      liveUrl: '',
      youtubeUrl: '',
      meetLink: '',
      presentationUrl: '#',
      activities: [
        {
          title: 'Actividad 1: Exploración e Introducción',
          desc: 'Configura tus primeras consultas de Inteligencia Artificial.',
          file: 'actividad_01.pdf',
          status: 'No iniciada'
        }
      ],
      resources: [
        { name: 'Guía de Prompting Básico', type: 'PDF' },
        { name: 'Enlace a ChatGPT', type: 'Web' }
      ]
    }),
    Object.freeze({
      id: '2',
      number: 2,
      name: 'Sesión 02',
      title: 'Prompts Inteligentes: Consigue Mejores Respuestas de la IA',
      description: 'Aprende qué son los prompts, cómo dar instrucciones claras a la inteligencia artificial y cómo mejorarlas para tareas, investigaciones y proyectos académicos.',
      day: 'Miércoles',
      date: '28 de octubre de 2026',
      fullDateLabel: 'Miércoles 28 de octubre de 2026',
      startTime: '7:00 PM',
      endTime: '8:30 PM',
      time: '7:00 PM a 8:30 PM',
      timezone: 'America/Mexico_City',
      timezoneLabel: 'Hora de Ciudad de México',
      startIso: '2026-10-28T19:00:00-06:00',
      endIso: '2026-10-28T20:30:00-06:00',
      status: 'Próxima',
      liveUrl: '',
      youtubeUrl: '',
      meetLink: '',
      presentationUrl: '#',
      activities: [
        {
          title: 'Actividad 2: Estructuración de Prompts Avanzados',
          desc: 'Aplica plantillas de investigación y resumen.',
          file: 'actividad_02.pdf',
          status: 'No iniciada'
        }
      ],
      resources: [
        { name: 'Plantilla de Prompts', type: 'DOCX' }
      ]
    }),
    Object.freeze({
      id: '3',
      number: 3,
      name: 'Sesión 03',
      title: 'Creatividad con IA: Imágenes, Diseños y Presentaciones',
      description: 'Transforma tus ideas en contenido digital utilizando herramientas de inteligencia artificial para crear imágenes, diseños y presentaciones.',
      day: 'Viernes',
      date: '30 de octubre de 2026',
      fullDateLabel: 'Viernes 30 de octubre de 2026',
      startTime: '7:00 PM',
      endTime: '8:30 PM',
      time: '7:00 PM a 8:30 PM',
      timezone: 'America/Mexico_City',
      timezoneLabel: 'Hora de Ciudad de México',
      startIso: '2026-10-30T19:00:00-06:00',
      endIso: '2026-10-30T20:30:00-06:00',
      status: 'Próxima',
      liveUrl: '',
      youtubeUrl: '',
      meetLink: '',
      presentationUrl: '#',
      activities: [
        {
          title: 'Actividad 3: Creación de Material Visual',
          desc: 'Genera gráficos e imágenes para tus proyectos.',
          file: 'actividad_03.pdf',
          status: 'No iniciada'
        }
      ],
      resources: [
        { name: 'Banco de Herramientas de IA Visual', type: 'PDF' }
      ]
    }),
    Object.freeze({
      id: '4',
      number: 4,
      name: 'Sesión 04',
      title: 'La IA en Tu Futuro: Oportunidades y Proyecto Final',
      description: 'Explora cómo se aplica la inteligencia artificial en diferentes profesiones, descubre oportunidades para tu futuro y pon en práctica lo aprendido mediante un proyecto final.',
      day: 'Lunes',
      date: '2 de noviembre de 2026',
      fullDateLabel: 'Lunes 2 de noviembre de 2026',
      startTime: '7:00 PM',
      endTime: '8:30 PM',
      time: '7:00 PM a 8:30 PM',
      timezone: 'America/Mexico_City',
      timezoneLabel: 'Hora de Ciudad de México',
      startIso: '2026-11-02T19:00:00-06:00',
      endIso: '2026-11-02T20:30:00-06:00',
      status: 'Próxima',
      liveUrl: '',
      youtubeUrl: '',
      meetLink: '',
      presentationUrl: '',
      activities: [
        {
          title: 'Proyecto Final',
          desc: 'Presenta tu proyecto académico integrando IA.',
          file: '',
          status: 'No iniciada'
        }
      ],
      resources: [
        { name: 'Plantilla de Presentación Final', type: 'Web' }
      ]
    })
  ])
});

/**
 * Selecciona la próxima sesión activa o programada evaluando tanto el estado de la sesión
 * como su hora de cierre oficial en America/Mexico_City (endIso con offset -06:00).
 */
export const getNextUpcomingSession = (sessionsList = OFFICIAL_COURSE_SCHEDULE.sessions, now = new Date()) => {
  const list = Array.isArray(sessionsList) && sessionsList.length > 0
    ? sessionsList
    : OFFICIAL_COURSE_SCHEDULE.sessions;

  const nowMs = now instanceof Date ? now.getTime() : Date.now();

  // 1. Si alguna sesión está explícitamente "En vivo", tiene prioridad inmediata
  const liveSession = list.find(s => s.status === 'En vivo');
  if (liveSession) return liveSession;

  // 2. Buscar la primera sesión no finalizada cuyo horario de cierre (endIso en UTC-6) aún no haya pasado
  const upcomingByTime = list.find(s => {
    if (s.status === 'Finalizada') return false;
    if (!s.endIso) return true;
    const endMs = Date.parse(s.endIso);
    return isNaN(endMs) ? true : nowMs <= endMs;
  });

  if (upcomingByTime) return upcomingByTime;

  // 3. Respaldo: primera sesión no marcada como Finalizada, o la última sesión del curso
  return list.find(s => s.status !== 'Finalizada') || list[list.length - 1];
};
