
import { useState } from 'react';
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

const StudentNavbar = ({ currentPage, lecturerId }) => {
  const [hoveredPage, setHoveredPage] = useState(null);

  // Navigation items
  const navItems = [
    { id: 'lecturerDashboard', label: 'Dashboard', icon: dashboard, hoverIcon: hoverDashboard },
    { id: 'coursesPage', label: 'Courses', icon: courses, hoverIcon: hoverCourse },
    { id: 'historyPage', label: 'History', icon: history, hoverIcon: hoverHistory }
  ];

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
        <div className="container-div">
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
