// Local Storage Database Engine
// Simulates a full backend database with persistence in the browser.

const STORAGE_KEYS = {
  SETTINGS: 'aula_settings',
  ENROLLMENTS: 'aula_enrollments',
  USERS: 'aula_users',
  COURSES: 'aula_courses',
  CURRENT_USER: 'aula_current_user',
  ACTIVE_CHECKOUT: 'aula_active_checkout'
};

// Active Checkout Persistence Engine (Restores payment screen if tab reloads or app switches)
export const saveActiveCheckout = (checkoutData) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CHECKOUT, JSON.stringify(checkoutData));
};

export const getActiveCheckout = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHECKOUT);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const clearActiveCheckout = () => {
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHECKOUT);
};

// Initial Default Configurations
const DEFAULT_SETTINGS = {
  courseName: 'IA para estudiantes: de una idea a un proyecto académico',
  courseDescription: 'Curso práctico dirigido principalmente a estudiantes y jóvenes universitarios interesados en aprender a utilizar herramientas de Inteligencia Artificial para facilitar y mejorar sus proyectos académicos.',
  price: 499,
  bankName: 'BBVA (Bancomer)',
  bankBeneficiary: 'Carlos Eduardo Ramirez Salas',
  bankClabe: '012 180 01546317540 4',
  bankAccount: '154 631 7540',
  bankConcept: 'Nombre Completo del Alumno',
  whatsappNumber: '5641439566', // Real WhatsApp administrativio
  sessions: [
    { id: '1', name: 'Sesión 01', title: 'Fundamentos de IA y Búsqueda Inteligente', day: 'Lunes', date: '', time: '', status: 'Finalizada', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', meetLink: '', presentationUrl: '#', activities: [{ title: 'Actividad 1: Búsqueda Avanzada', desc: 'Configura consultas de búsqueda con operadores booleanos e IA.', file: 'actividad_01.pdf', status: 'Entregada' }], resources: [{ name: 'Guía de Prompting Básico', type: 'PDF' }, { name: 'Enlace a ChatGPT', type: 'Web' }] },
    { id: '2', name: 'Sesión 02', title: 'Automatización con IA en Investigación', day: 'Miércoles', date: '', time: '', status: 'Finalizada', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', meetLink: '', presentationUrl: '#', activities: [{ title: 'Actividad 2: Extracción de Papers', desc: 'Usa herramientas de curación científica para resumir 3 artículos.', file: 'actividad_02.pdf', status: 'Entregada' }], resources: [{ name: 'Plantilla de Lectura Crítica', type: 'DOCX' }] },
    { id: '3', name: 'Sesión 03', title: 'Redacción Académica y Curación de Textos', day: 'Viernes', date: '', time: '', status: 'Finalizada', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', meetLink: '', presentationUrl: '#', activities: [{ title: 'Actividad 3: Reescritura Científica', desc: 'Aplica prompts de reformulación y evita el plagio por IA.', file: 'actividad_03.pdf', status: 'Pendiente' }], resources: [{ name: 'Tabla de Prompts de Edición', type: 'PDF' }] },
    { id: '4', name: 'Sesión 04', title: 'Diseño de Presentaciones de Alto Impacto', day: 'Lunes siguiente', date: '', time: '', status: 'Próxima', youtubeUrl: '', meetLink: 'https://meet.google.com/abc-defg-hij', presentationUrl: '', activities: [{ title: 'Proyecto Final', desc: 'Crea una presentación ejecutiva usando las herramientas aprendidas.', file: '', status: 'No iniciada' }], resources: [{ name: 'Banco de Recursos de Diseño', type: 'Web' }] }
  ]
};

const DEFAULT_COURSES = [
  {
    id: 'ia-trabajo',
    name: 'IA aplicada al trabajo',
    description: 'Aprende a integrar la inteligencia artificial en tu día a día para trabajar mejor y lograr más.',
    progress: 68,
    status: 'En progreso',
    color: 'mint',
    icon: 'brain',
    sessionsCount: 6
  },
  {
    id: 'organizacion-digital',
    name: 'Organización digital',
    description: 'Domina metodologías de organización personal y herramientas para estructurar tu conocimiento.',
    progress: 35,
    status: 'En progreso',
    color: 'blue',
    icon: 'folder',
    sessionsCount: 4
  },
  {
    id: 'aula-virtual-premium',
    name: 'Aula virtual premium',
    description: 'Acceso ilimitado a todas nuestras grabaciones históricas, recursos VIP y mentorías mensuales.',
    progress: 12,
    status: 'Próximamente',
    color: 'coral',
    icon: 'star',
    sessionsCount: 12
  }
];

// Initialize localStorage values if they don't exist
export const initDB = () => {
  const existingSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!existingSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  } else {
    try {
      const parsed = JSON.parse(existingSettings);
      // Migrate from old mock values to actual real values if placeholder values exist
      if (
        !parsed.bankBeneficiary ||
        parsed.bankName === 'Banco del Futuro (BBVA)' ||
        parsed.bankBeneficiary === 'Academia Virtual S.A. de C.V.' ||
        parsed.bankClabe === '0121 8001 2345 6789 01' ||
        parsed.whatsappNumber === '+525512345678'
      ) {
        const updated = {
          ...parsed,
          bankName: DEFAULT_SETTINGS.bankName,
          bankBeneficiary: DEFAULT_SETTINGS.bankBeneficiary,
          bankClabe: DEFAULT_SETTINGS.bankClabe,
          bankAccount: DEFAULT_SETTINGS.bankAccount,
          bankConcept: DEFAULT_SETTINGS.bankConcept,
          price: DEFAULT_SETTINGS.price,
          whatsappNumber: DEFAULT_SETTINGS.whatsappNumber
        };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      }
    } catch (e) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(DEFAULT_COURSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    // Admin user default (CEO)
    const defaultUsers = [
      {
        email: 'whadweon@gmail.com',
        password: 'Ceorgnzdr/0917',
        name: 'Carlos Eduardo Ramirez Salas (CEO Student Hub)',
        isAdmin: true,
        status: 'Inscripción activa',
        progress: {}
      },
      {
        email: 'alumno@academia.com',
        password: 'alumno',
        name: 'Carlos Ramírez Salas',
        phone: '+525544332211',
        isAdmin: false,
        status: 'Inscripción activa',
        progress: {
          'ia-trabajo': 68,
          'organizacion-digital': 35,
          'aula-virtual-premium': 12
        },
        completedSessions: {
          'ia-trabajo': ['1', '2']
        }
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  } else {
    // Ensure CEO credentials are up to date in existing localStorage
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    let adminIdx = users.findIndex(u => u.isAdmin);
    if (adminIdx !== -1) {
      users[adminIdx].email = 'whadweon@gmail.com';
      users[adminIdx].password = 'Ceorgnzdr/0917';
      users[adminIdx].name = 'Carlos Eduardo Ramirez Salas (CEO Student Hub)';
    } else {
      users.unshift({
        email: 'whadweon@gmail.com',
        password: 'Ceorgnzdr/0917',
        name: 'Carlos Eduardo Ramirez Salas (CEO Student Hub)',
        isAdmin: true,
        status: 'Inscripción activa',
        progress: {}
      });
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  // Initialize or clean up enrollments in localStorage (Ensure NO mock data, seed real registrations)
  const existingEnrollmentsRaw = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
  let currentEnrollments = [];
  try {
    currentEnrollments = JSON.parse(existingEnrollmentsRaw) || [];
  } catch (e) {
    currentEnrollments = [];
  }

  // Purge any mock data (sofia@example.com, mateo@example.com)
  currentEnrollments = currentEnrollments.filter(e => {
    if (!e) return false;
    const email = (e.email || '').toLowerCase();
    const name = (e.name || '').toLowerCase();
    const id = (e.id || '').toLowerCase();
    return !email.includes('example.com') && !name.includes('sofía valenzuela') && !name.includes('mateo gonzález') && id !== 'env-1' && id !== 'env-2';
  });

  // Ensure the TWO real registrations for today exist in DB
  const realSeeds = [
    {
      id: 'env_josselin_1',
      name: 'Josselin Ramirez',
      email: 'rjosselin835@gmail.com',
      phone: '+52 9614249821',
      courseName: 'IA para estudiantes: de una idea a un proyecto académico',
      price: 499,
      date: '2026-09-05T20:00:00.000Z',
      paymentMethod: 'Transferencia Bancaria',
      status: 'PENDIENTE DE VALIDACIÓN',
      receiptFile: 'whatsapp_receipt'
    },
    {
      id: 'env_josselin_2',
      name: 'Josselin Ramirez Salas',
      email: 'rjosselin835@gmail.com',
      phone: '+52 9614249821',
      courseName: 'IA para estudiantes: de una idea a un proyecto académico',
      price: 499,
      date: '2026-09-05T21:00:00.000Z',
      paymentMethod: 'Transferencia Bancaria',
      status: 'PENDIENTE DE VALIDACIÓN',
      receiptFile: 'whatsapp_receipt'
    }
  ];

  realSeeds.forEach(seed => {
    const exists = currentEnrollments.some(e => e.id === seed.id || (e.name === seed.name && e.email === seed.email && e.date === seed.date));
    if (!exists) {
      currentEnrollments.push(seed);
    }
  });

  localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(currentEnrollments));
};

// Settings CRUD
export const getSettings = () => {
  initDB();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS));
};

export const saveSettings = (newSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  return newSettings;
};

// Enrollments CRUD
export const getEnrollments = () => {
  initDB();
  const raw = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
  let enrollments = [];
  try {
    enrollments = JSON.parse(raw) || [];
  } catch (e) {
    enrollments = [];
  }
  // Return cleaned enrollments free of mock data
  return enrollments.filter(e => {
    if (!e) return false;
    const email = (e.email || '').toLowerCase();
    const name = (e.name || '').toLowerCase();
    const id = (e.id || '').toLowerCase();
    return !email.includes('example.com') && !name.includes('sofía valenzuela') && !name.includes('mateo gonzález') && id !== 'env-1' && id !== 'env-2';
  });
};

export const addEnrollment = (enrollment) => {
  const enrollments = getEnrollments();
  const newEnrollment = {
    id: 'env_' + Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
    ...enrollment,
    status: enrollment.status || 'PENDIENTE DE VALIDACIÓN'
  };
  enrollments.push(newEnrollment);
  localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));

  // Also pre-register user account with pending status if password provided
  if (enrollment.email && enrollment.password) {
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.email === enrollment.email);
    if (existingIndex === -1) {
      users.push({
        email: enrollment.email,
        password: enrollment.password,
        name: enrollment.name,
        phone: enrollment.phone,
        isAdmin: false,
        status: newEnrollment.status,
        progress: {
          'ia-trabajo': 0,
          'organizacion-digital': 0,
          'aula-virtual-premium': 0
        },
        completedSessions: {}
      });
    } else {
      users[existingIndex].password = enrollment.password;
      users[existingIndex].name = enrollment.name;
      users[existingIndex].phone = enrollment.phone;
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  return newEnrollment;
};

export const confirmEnrollmentReceipt = (id, receiptFile, paymentMethod) => {
  const enrollments = getEnrollments();
  const index = enrollments.findIndex(e => e.id === id);
  if (index !== -1) {
    enrollments[index].status = 'PENDIENTE DE VALIDACIÓN ADMINISTRATIVA';
    if (receiptFile) enrollments[index].receiptFile = receiptFile;
    if (paymentMethod) enrollments[index].paymentMethod = paymentMethod;
    enrollments[index].submittedDate = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));

    // Update student user status to pending admin validation
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === enrollments[index].email);
    if (userIndex !== -1 && !users[userIndex].isAdmin) {
      users[userIndex].status = 'PENDIENTE DE VALIDACIÓN ADMINISTRATIVA';
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    return enrollments[index];
  }
  return null;
};

export const updateEnrollmentStatus = (id, status) => {
  const enrollments = getEnrollments();
  const index = enrollments.findIndex(e => e.id === id);
  if (index !== -1) {
    enrollments[index].status = status;
    enrollments[index].processedDate = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));

    // If approved, create or update a student user account with active status
    if (status === 'APROBADA' || status === 'Inscripción activa') {
      const enrollment = enrollments[index];
      createUserAccount(enrollment);
    } else {
      // If status changed to RECHAZADA or pending, reflect in user record
      const users = getUsers();
      const userIndex = users.findIndex(u => u.email === enrollments[index].email);
      if (userIndex !== -1 && !users[userIndex].isAdmin) {
        users[userIndex].status = status;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
    }
    return enrollments[index];
  }
  return null;
};

// Users & Auth
export const getUsers = () => {
  initDB();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
};

const createUserAccount = (enrollment) => {
  const users = getUsers();
  const existingUserIndex = users.findIndex(u => u.email === enrollment.email);

  if (existingUserIndex === -1) {
    // Create new student user with the user's registered password (or default if missing)
    const newUser = {
      email: enrollment.email,
      password: enrollment.password || '123456',
      name: enrollment.name,
      phone: enrollment.phone,
      isAdmin: false,
      status: 'Inscripción activa',
      progress: {
        'ia-trabajo': 0,
        'organizacion-digital': 0,
        'aula-virtual-premium': 0
      },
      completedSessions: {}
    };
    users.push(newUser);
  } else {
    // Activate existing user status and update password if provided
    users[existingUserIndex].status = 'Inscripción activa';
    users[existingUserIndex].name = enrollment.name;
    users[existingUserIndex].phone = enrollment.phone;
    if (enrollment.password) {
      users[existingUserIndex].password = enrollment.password;
    }
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const registerUser = (name, email, password, phone) => {
  const users = getUsers();
  if (users.some(u => u.email === email)) {
    throw new Error('El correo ya está registrado');
  }

  const newUser = {
    name,
    email,
    password,
    phone,
    isAdmin: false,
    status: 'Pendiente de pago', // Needs enrollment verification
    progress: {},
    completedSessions: {}
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return newUser;
};

export const loginUser = (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Correo o contraseña incorrectos');
  }
  
  // Save current logged in user
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  return user;
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userStr) return null;
  
  // Fetch fresh state from the database to match any updates
  const parsed = JSON.parse(userStr);
  const users = getUsers();
  const freshUser = users.find(u => u.email === parsed.email);
  return freshUser || parsed;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getAdminUser = () => {
  const users = getUsers();
  return users.find(u => u.isAdmin) || users[0];
};

export const updateAdminUser = ({ name, email, newPassword }) => {
  const users = getUsers();
  const index = users.findIndex(u => u.isAdmin);
  
  if (index !== -1) {
    if (name) users[index].name = name;
    if (email) users[index].email = email;
    if (newPassword) users[index].password = newPassword;

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Update active current user if currently logged in as admin
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.isAdmin) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[index]));
    }
    return users[index];
  }
  return null;
};

export const updateUserProgress = (email, courseId, progressPercent, completedSessions) => {
  const users = getUsers();
  const index = users.findIndex(u => u.email === email);
  if (index !== -1) {
    if (!users[index].progress) users[index].progress = {};
    if (!users[index].completedSessions) users[index].completedSessions = {};
    
    users[index].progress[courseId] = progressPercent;
    users[index].completedSessions[courseId] = completedSessions;
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update active session user if match
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email === email) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[index]));
    }
  }
};

// Courses List
export const getCourses = () => {
  initDB();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES)) || [];
};

export const updateCourse = (updatedCourse) => {
  const courses = getCourses();
  const idx = courses.findIndex(c => c.id === updatedCourse.id);
  if (idx !== -1) {
    courses[idx] = updatedCourse;
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    return courses[idx];
  }
  return null;
};
