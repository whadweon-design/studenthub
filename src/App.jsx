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

  // Escuchar eventos de autenticación de Supabase (recuperación de contraseña, cierre de sesión, restauración de sesión y confirmación de correo)
  useEffect(() => {
    initDB();
    const activeSettings = getSettings();
    setSettings(activeSettings);
    setCourses(getCourses());

    setAuthLoading(true);

    let isMounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setCurrentPage('reset-password');
        setAuthLoading(false);
      } else if (event === 'SIGNED_OUT' || !session?.user) {
        setCurrentUser(null);
        localStorage.removeItem('aula_current_user');
        setSelectedCourse(null);
        setSelectedSession(null);

        // Restaurar borrador de pago si estaba en proceso activo
        const pendingCheckout = getActiveCheckout();
        if (pendingCheckout && pendingCheckout.studentData && pendingCheckout.step === 'payment') {
          setStudentRegisterData(pendingCheckout.studentData);
          setCurrentEnrollmentId(pendingCheckout.enrollmentId);
          setCurrentPage('payment');
        } else {
          setCurrentPage('landing');
        }
        setAuthLoading(false);
      } else if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user) {
        await restoreUserSession(session.user);
        if (isMounted) {
          setAuthLoading(false);
        }
      } else {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Función helper para consultar public.profiles, public.courses y public.enrollments para verificar rol e inscripción de forma segura (Fail Closed)
  const restoreUserSession = async (sbUser) => {
    if (!sbUser) {
      setCurrentUser(null);
      localStorage.removeItem('aula_current_user');
      return null;
    }

    try {
      // 1. Consulta de la fila correspondiente en public.profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone, role')
        .eq('id', sbUser.id)
        .maybeSingle();

      // Regla de Seguridad / Fail Closed: Si la consulta de perfiles falla o no existe el perfil, NO se asume 'student' ni se concede acceso
      if (profileError || !profile) {
        console.error('Error de autenticación/restauración: Perfil no encontrado o inaccesible en public.profiles', profileError);
        try {
          await supabase.auth.signOut();
        } catch (e) {
          // Ignorar error al desloguear usuario sin perfil
        }
        setCurrentUser(null);
        localStorage.removeItem('aula_current_user');
        setCurrentPage('landing');
        return null;
      }

      // isAdmin se deriva EXCLUSIVAMENTE de profile.role === 'admin'
      const userRole = profile.role;
      const isAdmin = userRole === 'admin';

      if (isAdmin) {
        const activeAdminUser = {
          id: sbUser.id,
          email: sbUser.email,
          name: profile.full_name || sbUser.user_metadata?.full_name || sbUser.email,
          phone: profile.phone || '',
          role: userRole,
          isAdmin: true,
          status: 'Inscripción activa'
        };
        localStorage.setItem('aula_current_user', JSON.stringify(activeAdminUser));
        setCurrentUser(activeAdminUser);
        setCurrentPage('admin');
        return activeAdminUser;
      }

      // 2. Para usuario estudiante: consultar el UUID real del curso LEVEL UP en public.courses mediante slug = 'level-up'
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', 'level-up')
        .maybeSingle();

      if (courseError || !courseData) {
        console.error('Fail closed: No se pudo obtener el curso LEVEL UP de public.courses', courseError);
        setCurrentUser(null);
        localStorage.removeItem('aula_current_user');
        setCurrentPage('landing');
        return null;
      }

      const realCourseId = courseData.id;

      // 3. Consultar la inscripción en public.enrollments usando user_id = sbUser.id y course_id = realCourseId
      let { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id, status, user_id, course_id')
        .eq('user_id', sbUser.id)
        .eq('course_id', realCourseId)
        .maybeSingle();

      if (enrollmentError) {
        console.error('Error al consultar inscripciones en public.enrollments:', enrollmentError);
        setCurrentUser(null);
        localStorage.removeItem('aula_current_user');
        setCurrentPage('landing');
        return null;
      }

      // 4. Si NO existe inscripción, intentar crearla con status = 'REGISTRO_INICIADO'
      if (!enrollment) {
        const { data: newEnrollment, error: insertError } = await supabase
          .from('enrollments')
          .insert({
            user_id: sbUser.id,
            course_id: realCourseId,
            status: 'REGISTRO_INICIADO'
          })
          .select('id, status, user_id, course_id')
          .single();

        if (insertError) {
          // Manejo del error PostgreSQL 23505 (violación de restricción UNIQUE por ejecución concurrente)
          if (insertError.code === '23505' || insertError.message?.includes('unique_user_course') || insertError.message?.includes('duplicate key')) {
            console.warn('Inserción concurrente detectada (PostgreSQL 23505). Recuperando inscripción existente...');
            const { data: existingAfterConflict, error: retryError } = await supabase
              .from('enrollments')
              .select('id, status, user_id, course_id')
              .eq('user_id', sbUser.id)
              .eq('course_id', realCourseId)
              .maybeSingle();

            if (retryError || !existingAfterConflict) {
              console.error('Fail closed: No se pudo recuperar la inscripción tras conflicto de concurrencia:', retryError);
              setCurrentUser(null);
              localStorage.removeItem('aula_current_user');
              setCurrentPage('landing');
              return null;
            }
            enrollment = existingAfterConflict;
          } else {
            console.error('Fail closed: Error al crear la inscripción en public.enrollments:', {
              code: insertError?.code,
              message: insertError?.message,
              details: insertError?.details
            });
            setCurrentUser(null);
            localStorage.removeItem('aula_current_user');
            setCurrentPage('landing');
            return null;
          }
        } else {
          enrollment = newEnrollment;
        }
      }

      const enrollmentStatus = enrollment?.status || 'REGISTRO_INICIADO';

      const activeStudentUser = {
        id: sbUser.id,
        email: sbUser.email,
        name: profile.full_name || sbUser.user_metadata?.full_name || sbUser.email,
        phone: profile.phone || '',
        role: 'student',
        isAdmin: false,
        status: enrollmentStatus,
        enrollmentId: enrollment?.id
      };

      // Espejo transitorio de compatibilidad visual en localStorage
      localStorage.setItem('aula_current_user', JSON.stringify(activeStudentUser));
      setCurrentUser(activeStudentUser);
      setCurrentEnrollmentId(enrollment?.id || null);

      // 5. Mapeo de Navegación Estricto / Fail Closed (Acceso al Aula ÚNICAMENTE si status === 'APROBADA')
      switch (enrollmentStatus) {
        case 'APROBADA':
          setCurrentPage('classroom');
          break;
        case 'REGISTRO_INICIADO':
          setCurrentPage('payment');
          break;
        case 'PENDIENTE_VALIDACION':
          setCurrentPage('status');
          break;
        case 'RECHAZADA':
          setCurrentPage('status');
          break;
        default:
          console.warn('Fail closed: Estado de inscripción no reconocido o no aprobado:', enrollmentStatus);
          setCurrentPage('status');
          break;
      }

      return activeStudentUser;
    } catch (err) {
      console.error('Fail closed: Excepción inesperada durante restoreUserSession:', err);
      setCurrentUser(null);
      localStorage.removeItem('aula_current_user');
      setCurrentPage('landing');
      return null;
    }
  };

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
    } else if (user.status === 'APROBADA') {
      setCurrentPage('classroom');
    } else if (user.status === 'REGISTRO_INICIADO') {
      setCurrentPage('payment');
    } else {
      setCurrentPage('status');
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
