import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { 
  initDB, getCurrentUser, getSettings, getCourses, addEnrollment, logoutUser,
  saveActiveCheckout, getActiveCheckout, clearActiveCheckout, confirmEnrollmentReceipt
} from './services/db';
import PublicLanding from './views/public/PublicLanding';
import PublicRegister from './views/public/PublicRegister';
import PublicPayment from './views/public/PublicPayment';
import PublicStatus from './views/public/PublicStatus';
import StudentAuth from './views/student/StudentAuth';
import StudentDashboard from './views/student/StudentDashboard';
import CoursePanel from './views/student/CoursePanel';
import SessionPanel from './views/student/SessionPanel';
import StudentLibrary from './views/student/StudentLibrary';
import AdminPortal from './views/admin/AdminPortal';
import logoImg from './assets/logo-nobg.png';
import { Settings, ShieldCheck } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // landing | register | payment | status | login | reset-password | classroom | admin
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [courses, setCourses] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Registration checkout states
  const [studentRegisterData, setStudentRegisterData] = useState(null);
  const [currentEnrollmentId, setCurrentEnrollmentId] = useState(null);

  // Classroom Navigation states
  const [classroomTab, setClassroomTab] = useState('inicio'); // inicio | cursos | biblioteca
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  // Escuchar eventos de autenticación de Supabase (recuperación de contraseña, cierre de sesión y confirmación de correo)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentPage('reset-password');
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem('aula_current_user');
        setSelectedCourse(null);
        setSelectedSession(null);
        setCurrentPage('landing');
      } else if (event === 'SIGNED_IN' && session?.user) {
        const activeUser = await restoreUserSession(session.user);
        if (activeUser) {
          if (activeUser.isAdmin) {
            setCurrentPage('admin');
          } else {
            setCurrentPage('classroom');
          }
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Función helper para consultar public.profiles y verificar rol de forma segura
  const restoreUserSession = async (sbUser) => {
    if (!sbUser) {
      setCurrentUser(null);
      localStorage.removeItem('aula_current_user');
      return null;
    }

    // Consulta de la fila correspondiente en public.profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone, role')
      .eq('id', sbUser.id)
      .maybeSingle();

    // Regla de Seguridad: Si la consulta de perfiles falla o no existe el perfil, NO se asume 'student' ni se concede acceso
    if (profileError || !profile) {
      console.error('Error de autenticación/restauración: Perfil no encontrado o inaccesible en public.profiles', profileError);
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // Ignorar error al desloguear usuario sin perfil
      }
      setCurrentUser(null);
      localStorage.removeItem('aula_current_user');
      return null;
    }

    // isAdmin se deriva EXCLUSIVAMENTE de profile.role === 'admin'
    const userRole = profile.role;
    const isAdmin = userRole === 'admin';

    const activeUser = {
      id: sbUser.id,
      email: sbUser.email,
      name: profile.full_name || sbUser.user_metadata?.full_name || sbUser.email,
      phone: profile.phone || '',
      role: userRole,
      isAdmin: isAdmin,
      status: 'Inscripción activa'
    };

    // Espejo transitorio de compatibilidad en localStorage
    localStorage.setItem('aula_current_user', JSON.stringify(activeUser));
    setCurrentUser(activeUser);
    return activeUser;
  };

  // Restauración de sesión mediante Supabase Auth como fuente de autoridad al iniciar
  useEffect(() => {
    initDB();
    const activeSettings = getSettings();
    setSettings(activeSettings);
    setCourses(getCourses());
    
    const initializeAuthSession = async () => {
      setAuthLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session?.user) {
          const activeUser = await restoreUserSession(session.user);
          if (activeUser) {
            if (activeUser.isAdmin) {
              setCurrentPage('admin');
            } else {
              setCurrentPage('classroom');
            }
          } else {
            setCurrentPage('landing');
          }
        } else {
          setCurrentUser(null);
          localStorage.removeItem('aula_current_user');

          // Restaurar borrador de pago si estaba en proceso activo
          const pendingCheckout = getActiveCheckout();
          if (pendingCheckout && pendingCheckout.studentData && pendingCheckout.step === 'payment') {
            setStudentRegisterData(pendingCheckout.studentData);
            setCurrentEnrollmentId(pendingCheckout.enrollmentId);
            setCurrentPage('payment');
          } else {
            setCurrentPage('landing');
          }
        }
      } catch (err) {
        console.error('Error al inicializar sesión en Supabase:', err);
        setCurrentUser(null);
        localStorage.removeItem('aula_current_user');
        setCurrentPage('landing');
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuthSession();
  }, []);

  // Update layout when database states change
  const refreshAppState = () => {
    setSettings(getSettings());
    setCourses(getCourses());
    const freshUser = getCurrentUser();
    if (freshUser) {
      setCurrentUser(freshUser);
    }
  };

  const handleRegisterSubmit = (data) => {
    setStudentRegisterData(data);
    const activeSettings = settings || getSettings();

    // Create or update enrollment record with initial status 'Pendiente de pago / comprobante'
    const newEnrollment = addEnrollment({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      paymentMethod: 'Transferencia Bancaria',
      price: activeSettings.price,
      courseName: activeSettings.courseName,
      status: 'Pendiente de pago / comprobante',
      receiptFile: null
    });

    setCurrentEnrollmentId(newEnrollment.id);

    // Save active checkout in localStorage so it persists across tab switches, app switching (BBVA / WhatsApp) & tab reloads
    saveActiveCheckout({
      studentData: data,
      enrollmentId: newEnrollment.id,
      step: 'payment'
    });

    setCurrentPage('payment');
  };

  const handlePaymentSubmit = ({ receiptFile, paymentMethod }) => {
    if (currentEnrollmentId) {
      confirmEnrollmentReceipt(currentEnrollmentId, receiptFile, paymentMethod);
    } else if (studentRegisterData) {
      const activeSettings = settings || getSettings();
      const newEnrollment = addEnrollment({
        name: studentRegisterData.name,
        email: studentRegisterData.email,
        password: studentRegisterData.password,
        phone: studentRegisterData.phone,
        paymentMethod: paymentMethod || 'Transferencia Bancaria',
        price: activeSettings.price,
        courseName: activeSettings.courseName,
        status: 'PENDIENTE DE VALIDACIÓN ADMINISTRATIVA',
        receiptFile
      });
      setCurrentEnrollmentId(newEnrollment.id);
    }

    // Clear active checkout since receipt was explicitly submitted
    clearActiveCheckout();
    setCurrentPage('status');
  };

  const handleCancelCheckout = () => {
    clearActiveCheckout();
    setStudentRegisterData(null);
    setCurrentEnrollmentId(null);
    setCurrentPage('landing');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.isAdmin) {
      setCurrentPage('admin');
    } else {
      setCurrentPage('classroom');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error al cerrar sesión en Supabase Auth:', err);
    }
    logoutUser();
    setCurrentUser(null);
    setSelectedCourse(null);
    setSelectedSession(null);
    setCurrentPage('landing');
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setSelectedSession(null);
  };

  const handleSelectSession = (session) => {
    setSelectedSession(session);
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
    setSelectedSession(null);
  };

  const handleBackToCourse = () => {
    setSelectedSession(null);
  };

  // Route Guard verification helper
  const navigateToClassroom = (pageName) => {
    const user = getCurrentUser();
    if (!user) {
      setCurrentPage('login');
      return;
    }
    if (user.status !== 'Inscripción activa' && !user.isAdmin) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(pageName);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', position: 'relative' }}>
        <div className="background-auras">
          <div className="aura aura-green" />
          <div className="aura aura-blue" />
        </div>
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <img 
            src={logoImg} 
            alt="Student Hub Logo" 
            style={{ width: '64px', height: '64px', marginBottom: '16px', filter: 'drop-shadow(0 6px 16px rgba(63, 131, 248, 0.3))' }} 
          />
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#374151' }}>Student Hub</div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Verificando sesión segura...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', paddingBottom: '80px' }}>
      
      {/* Background Decorative Auras */}
      <div className="background-auras">
        <div className="aura aura-green" />
        <div className="aura aura-blue" />
        <div className="aura aura-coral" />
        <div className="aura aura-yellow" />
      </div>

      {/* Main Pages Router */}
      <div style={{ padding: '20px' }}>
        
        {currentPage === 'landing' && (
          <PublicLanding 
            onNavigate={(page) => setCurrentPage(page)} 
            onEnterLogin={() => setCurrentPage('login')}
          />
        )}

        {currentPage === 'register' && (
          <PublicRegister 
            onNavigate={(page) => setCurrentPage(page)}
            onRegisterSubmit={handleRegisterSubmit}
            initialData={studentRegisterData || {}}
          />
        )}

        {currentPage === 'payment' && (
          <PublicPayment 
            onNavigate={(page) => setCurrentPage(page)}
            studentData={studentRegisterData}
            onPaymentSubmit={handlePaymentSubmit}
          />
        )}

        {currentPage === 'status' && (
          <PublicStatus 
            enrollmentId={currentEnrollmentId}
            onNavigate={(page) => {
              refreshAppState();
              setCurrentPage(page);
            }}
          />
        )}

        {(currentPage === 'login' || currentPage === 'reset-password') && (
          <StudentAuth 
            initialView={currentPage === 'reset-password' ? 'reset-password' : 'login'}
            onNavigate={(page) => setCurrentPage(page)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentPage === 'classroom' && currentUser && (
          <div className="app-layout">
            {selectedSession ? (
              <SessionPanel 
                session={selectedSession}
                course={selectedCourse}
                user={currentUser}
                onBack={handleBackToCourse}
                onProgressUpdate={refreshAppState}
              />
            ) : selectedCourse ? (
              <CoursePanel 
                course={selectedCourse}
                settings={settings}
                user={currentUser}
                onBack={handleBackToDashboard}
                onSelectSession={handleSelectSession}
              />
            ) : classroomTab === 'inicio' ? (
              <StudentDashboard 
                user={currentUser}
                settings={settings}
                courses={courses}
                activeTab={classroomTab}
                setActiveTab={setClassroomTab}
                onLogout={handleLogout}
                onSelectCourse={handleSelectCourse}
                onSelectSession={handleSelectSession}
              />
            ) : classroomTab === 'cursos' ? (
              <StudentDashboard 
                user={currentUser}
                settings={settings}
                courses={courses}
                activeTab={classroomTab}
                setActiveTab={setClassroomTab}
                onLogout={handleLogout}
                onSelectCourse={handleSelectCourse}
                onSelectSession={handleSelectSession}
              />
            ) : (
              <StudentLibrary settings={settings} />
            )}
          </div>
        )}

        {currentPage === 'admin' && (
          <div className="app-layout">
            <AdminPortal 
              onBack={() => {
                refreshAppState();
                if (currentUser && currentUser.isAdmin) {
                  // Admin can view classroom as well
                  setCurrentPage('classroom');
                  setClassroomTab('inicio');
                } else {
                  setCurrentPage('landing');
                }
              }}
            />
          </div>
        )}

      </div>

      {/* Floating Admin Mode Quick Trigger (ONLY visible for logged-in CEO / Admin) */}
      {currentUser && currentUser.isAdmin && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
          <button 
            onClick={() => {
              refreshAppState();
              if (currentPage === 'admin') {
                setCurrentPage('landing');
              } else {
                setCurrentPage('admin');
              }
            }}
            className="glass-pill coral"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(249, 128, 128, 0.3)', border: '1px solid rgba(255,255,255,0.8)', padding: '10px 18px', fontSize: '13px', cursor: 'pointer' }}
          >
            {currentPage === 'admin' ? (
              <>
                <ShieldCheck size={16} />
                <span>Ver Vista Pública / Alumno</span>
              </>
            ) : (
              <>
                <Settings size={16} />
                <span>Modo Administrador</span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
