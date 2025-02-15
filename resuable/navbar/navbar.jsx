import "./navbar.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import logo from "../navbar/logo.svg";
import settings from "../navbar/settings.svg";
import logouticon from "./logout.svg";
import history from "./history.svg";
import dashboard from "./dashboard.svg";
import courses from "./courses.svg";
import registerCourse from "./register-courses.svg";
import hoverDashboard from "./greenDashboard.svg";
import hoverCourse from "./greenCourse.svg";
import hoverRegister from "./greenRegister.svg";
import hoverHistory from "./greenHistory.svg";

const Navbar = ({ currentPage }) => {
  const [hoveredPage, setHoveredPage] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login"); // Redirect if not logged in
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const navItems = [
    { id: "lecturerDashboard", label: "Dashboard", icon: dashboard, hoverIcon: hoverDashboard, link: `/lecturer/${user?.uid}` },
    { id: "coursesPage", label: "Courses", icon: courses, hoverIcon: hoverCourse, link: `/courses/${user?.uid}` },
    { id: "registerPage", label: "Register", icon: registerCourse, hoverIcon: hoverRegister, link: `/register-course/${user?.uid}` },
    { id: "historyPage", label: "History", icon: history, hoverIcon: hoverHistory, link: `/course-history/${user?.uid}` },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

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
            className={`container-div ${currentPage === item.id && hoveredPage !== item.id ? "highlight" : ""}`}
            onMouseEnter={() => setHoveredPage(item.id)}
            onMouseLeave={() => setHoveredPage(null)}
            onClick={() => navigate(item.link)}
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
        <div className="container-div" onClick={handleLogout}>
          <div className="img-div">
            <img src={logouticon} alt="Logout" />
          </div>
          <p>Logout</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
