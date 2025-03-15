import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../config/config";
import { doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";
import Navbar from "../../resuable/navbar/navbar";
import Panel from "../../resuable/sidepanel/panel";
import search from "./search.svg";
import time from "./time.svg";
import WelcomeDiv from "../../resuable/WelcomeDiv/welcome";
import "./ldashboard.css";
import hamburger from "../../resuable/navbar/hamburger.svg";

const fetchCourses = async (userId) => {
  if (!userId) return [];

  try {
    const lecturerDocRef = doc(db, "users", userId);
    const lecturerDoc = await getDoc(lecturerDocRef);

    if (!lecturerDoc.exists()) return [];

    const courseIds = lecturerDoc.data().courses || [];
    if (courseIds.length === 0) return [];

    const coursePromises = courseIds.map(async (courseId) => {
      const courseDocRef = doc(db, "courses", courseId);
      const courseDoc = await getDoc(courseDocRef);
      return courseDoc.exists() ? { id: courseId, ...courseDoc.data() } : null;
    });

    return (await Promise.all(coursePromises)).filter(Boolean);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

const Lecturer = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false); // Navbar toggle state

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses", userId],
    queryFn: () => fetchCourses(userId),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  });

  if (authLoading) return null;

  const todayDate = format(new Date(), "MMMM d, yyyy");

  const toggleNavbar = () => {
    setIsNavbarOpen((prev) => !prev);
  };

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };

  return (
    <div className={`lecturer-dashboard ${isNavbarOpen ? "navbar-show-now" : ""}`}>

      <Navbar currentPage={"lecturerDashboard"} isOpen={isNavbarOpen}/>

      {isNavbarOpen && <div className="overlay" onClick={closeNavbar}></div>}

      <div className="dashboard-area">
        
<img className="theHamburger" src={hamburger} alt="Menu" onClick={toggleNavbar} />

        <div className="top-dashboard-area">
          <p>Dashboard</p>
          <p>{todayDate}</p>
        </div>

        <img className="theHamburger" src={hamburger} alt="Menu" onClick={toggleNavbar} />

        <WelcomeDiv />

        {coursesLoading ? (
          <div className="courses-available-area">
            <div className="top-courses-available">
              <p>Courses</p>
            </div>
            <div className="courses-presented">
              {[1, 2, 3, 4].map((_, index) => (
                <div className="course-card skeleton-loader" key={index}>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-subtitle"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              ))}
            </div>
          </div>
        ) : courses.length > 0 ? (
          <div className="courses-available-area">
            <div className="top-courses-available">
              <p>Courses</p>
            </div>
            <div className="courses-presented">
              {courses.map((course) => (
                <div
                  className="course-card"
                  key={course.id}
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <h2>{course.courseCode}</h2>
                  <h3>{course.courseName}</h3>
                  <h4>{course.description}</h4>
                  <div className="see-details">
                    <p>See details &gt;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="register-courses-prompt">
            <h2>Register Your Courses</h2>
            <p>Registering your courses helps you track attendance seamlessly.</p>
            <button>Register</button>
          </div>
        )}

        {/* ✅ Your directional texts section is intact */}
        <div className="directional-texts-ds">
          <div className="instance">
            <h3>Students insight at a Glance</h3>
            <div className="img-div-in">
              <img src={search} alt="" />
            </div>
            <p>
              Monitor each student's attendance trends and performance with detailed
              analytics.
            </p>
          </div>
          <div className="instance">
            <h3>Lecture and attendance record</h3>
            <div className="img-div-in">
              <img src={time} alt="" />
            </div>
            <p>
              Access a history of all your lectures and attendance records for better
              organization and evaluation.
            </p>
          </div>
        </div>
      </div>

      <Panel />
    </div>
  );
};

export default Lecturer;
