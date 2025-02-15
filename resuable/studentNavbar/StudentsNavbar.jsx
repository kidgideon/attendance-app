import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import logo from '../navbar/logo.svg';
import settings from '../navbar/settings.svg';
import logouticon from './logout.svg';
import history from './history.svg';
import dashboard from './dashboard.svg';
import courses from './courses.svg';
import registerCourse from './register-courses.svg';
import hoverDashboard from './greenDashboard.svg';
import hoverCourse from './greenCourse.svg';
import hoverRegister from './greenRegister.svg';
import hoverHistory from './greenHistory.svg';

const StudentNavbar = ({ currentPage }) => {
  const [hoveredPage, setHoveredPage] = useState(null);
  const [studentUid, setStudentUid] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setStudentUid(user.uid);
      } else {
        setStudentUid(null);
        navigate('/login'); // Redirect if not logged in
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // Navigation items (URLs depend on student UID)
  const navItems = studentUid
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: dashboard, hoverIcon: hoverDashboard, path: `/student/${studentUid}` },
        { id: 'courses', label: 'Courses', icon: courses, hoverIcon: hoverCourse, path: `/student/courses/${studentUid}` },
        { id: 'history', label: 'History', icon: history, hoverIcon: hoverHistory, path: `/student/history/${studentUid}` },
      ]
    : [];

  return (
    <div className="navbar">
      <div className="top-section-nav">
        <img src={logo} alt="Eclassify Logo" />
        <h2>Eclassify</h2>
      </div>

      <div className="middle-section-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`container-div ${currentPage === item.id && hoveredPage !== item.id ? 'highlight' : ''}`}
            onMouseEnter={() => setHoveredPage(item.id)}
            onMouseLeave={() => setHoveredPage(null)}
            onClick={() => navigate(item.path)}
          >
            <div className="img-div">
              <img src={hoveredPage === item.id || currentPage === item.id ? item.hoverIcon : item.icon} alt={item.label} />
            </div>
            <p>{item.label}</p>
          </div>
        ))}
      </div>

      <div className="bottom-section-nav">
        <div className="container-div">
          <div className="img-div">
            <img src={settings} alt="Settings" />
          </div>
          <p>Settings</p>
        </div>
        <div className="container-div" onClick={() => auth.signOut()}>
          <div className="img-div">
            <img src={logouticon} alt="Logout" />
          </div>
          <p>Logout</p>
        </div>
      </div>
    </div>
  );
};

export default StudentNavbar;
