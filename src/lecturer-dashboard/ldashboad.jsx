import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../config/config';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import Navbar from '../../resuable/navbar/navbar';
import Panel from '../../resuable/sidepanel/panel';
import hand from './Waving Hand.svg';
import group from './Group.svg';
import time from './time.svg';
import search from './search.svg';
import './ldashboard.css';

const Lecturer = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lecturerData, setLecturerData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Check authentication status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      } else {
        setIsAuthenticated(false);
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch lecturer data
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const fetchLecturerData = async () => {
      try {
        const lecturerRef = doc(db, 'users', currentUser.uid);
        const lecturerSnapshot = await getDoc(lecturerRef);
        if (lecturerSnapshot.exists()) {
          setLecturerData(lecturerSnapshot.data());
        }
      } catch (error) {
        console.error('Error fetching lecturer data:', error);
      }
    };

    fetchLecturerData();
  }, [isAuthenticated, currentUser]);

  // Fetch courses
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const fetchCourses = async () => {
      try {
        setLoading(true);

        const lecturerDocRef = doc(db, 'users', currentUser.uid);
        const lecturerDoc = await getDoc(lecturerDocRef);

        if (lecturerDoc.exists()) {
          const courseIds = lecturerDoc.data().courses || [];

          if (courseIds.length === 0) {
            setCourses([]);
            setLoading(false);
            return;
          }

          const coursePromises = courseIds.map(async (courseId) => {
            const courseDocRef = doc(db, 'courses', courseId);
            const courseDoc = await getDoc(courseDocRef);
            return courseDoc.exists() ? { id: courseId, ...courseDoc.data() } : null;
          });

          const fetchedCourses = (await Promise.all(coursePromises)).filter(Boolean);
          setCourses(fetchedCourses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated) return null;

  const todayDate = format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="lecturer-dashboard">
      <Navbar currentPage="lecturerDashboard"  lecturerId={currentUser.uid}/>

      <div className="dashboard-area">
        <div className="top-dashboard-area">
          <p>Dashboard</p>
          <p>{todayDate}</p>
        </div>

        <div className="user-welcome-field">
          <div className="top-welcome-field">
            <p>Welcome</p>
            <img src={hand} alt="" />
          </div>
          <div className="lecturer-info-desc">
            <div className="the-info">
              <h2>{lecturerData.firstName} {lecturerData.lastName}</h2>
              <p>Keeping track of attendance has never been easier. Stay on top of your classes and ensure better engagement with your students.</p>
            </div>
            <div className="the-image">
              <img src={group} alt="" />
            </div>
          </div>
        </div>

        {loading ? (
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
                <div className="course-card" key={course.id} onClick={() => navigate(`/course/${course.id}`)}>
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

        <div className="directional-texts-ds">
          <div className="instance">
            <h3>Students insight at a Glance</h3>
            <div className="img-div-in">
              <img src={search} alt="" />
            </div>
            <p>Monitor each student's attendance trends and performance with detailed analytics.</p>
          </div>
          <div className="instance">
            <h3>Lecture and attendance record</h3>
            <div className="img-div-in">
              <img src={time} alt="" />
            </div>
            <p>Access a history of all your lectures and attendance records for better organization and evaluation.</p>
          </div>
        </div>

        <div className="history-div-if-any">
  <div className="history-area-top">
    <p>History</p>
    <p>View all &gt;</p>
  </div>
  <div className="course-history-display">
    <div className="initial-table">
      <div>Course</div>
      <div>Teacher Name</div>
      <div>Members</div>
      <div>Date</div>
    </div>
  </div>
</div>
      </div>

      <Panel />
    </div>
  );
};

export default Lecturer;
