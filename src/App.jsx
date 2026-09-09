import React, { useState, useEffect } from 'react';
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
import { Settings, ShieldCheck } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // landing | register | payment | status | login | classroom | admin
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [courses, setCourses] = useState([]);
  
  // Registration checkout states
  const [studentRegisterData, setStudentRegisterData] = useState(null);
  const [currentEnrollmentId, setCurrentEnrollmentId] = useState(null);

  // Classroom Navigation states
  const [classroomTab, setClassroomTab] = useState('inicio'); // inicio | cursos | biblioteca
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  // Trigger DB initialization & restore persistent checkout if exists
  useEffect(() => {
    initDB();
    const activeSettings = getSettings();
    setSettings(activeSettings);
    setCourses(getCourses());
    
    // Check if there is an active logged-in session
    const active = getCurrentUser();
    if (active) {
      setCurrentUser(active);
      if (active.isAdmin) {
        setCurrentPage('admin');
        return;
      } else if (active.status === 'APROBADA' || active.status === 'Inscripción activa') {
        setCurrentPage('classroom');
        return;
      }
    }

    // Restore active checkout state if student was viewing payment transfer instructions
    const pendingCheckout = getActiveCheckout();
    if (pendingCheckout && pendingCheckout.studentData && pendingCheckout.step === 'payment') {
      setStudentRegisterData(pendingCheckout.studentData);
      setCurrentEnrollmentId(pendingCheckout.enrollmentId);
      setCurrentPage('payment');
    }
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

  const handleLogout = () => {
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

        {currentPage === 'login' && (
          <StudentAuth 
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
              <StudentLibrary />
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
