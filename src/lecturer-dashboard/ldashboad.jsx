import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Removed useParams
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase auth
import { db } from '../../config/config'; // Firebase config
import { doc, getDoc } from 'firebase/firestore';
import './ldashboard.css';

const Lecturer = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lecturerData, setLecturerData] = useState({});
  const [currentUser, setCurrentUser] = useState(null); // Store authenticated user

  // Check authentication status and get the current user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user); // Set the authenticated user
      } else {
        setIsAuthenticated(false);
        navigate('/login'); // Redirect to login page if not authenticated
      }
    });
    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, [navigate]);

  // Fetch lecturer data
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const fetchLecturerData = async () => {
      try {
        const lecturerRef = doc(db, 'users', currentUser.uid); // Use currentUser.uid
        const lecturerSnapshot = await getDoc(lecturerRef);

        if (lecturerSnapshot.exists()) {
          setLecturerData(lecturerSnapshot.data());
        } else {
          console.warn('No lecturer data found for user:', currentUser.uid);
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
        const lecturerDocRef = doc(db, 'users', currentUser.uid); // Use currentUser.uid
        const lecturerDoc = await getDoc(lecturerDocRef);

        if (lecturerDoc.exists()) {
          const lecturerData = lecturerDoc.data();
          setCourses(lecturerData.courses || []);
        } else {
          console.error('No lecturer found!');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated) {
    return null; // Optionally display a loading spinner or blank screen during redirection
  }

  const courseArea = (id) => {
    navigate(`/course/${id}`)
  }

  return (
    <div className="lecturer-dashboard">
      {/* Top Section */}
      <div className="top-section-lecturer">
        <div className="t-f-d">
          <img
            src={lecturerData?.profilePicture ||
              'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media'}
            alt="Lecturer Profile"
          />
        </div>
        <div className="t-m-d">eclassify</div>
        <div className="t-l-d">
          <i className="fa-regular fa-bell"></i>
        </div>
      </div>

      {/* Middle Section */}
      <div className="middle-div">
        {loading ? (
          <div className="middle-skeleton">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="course-skeleton">
                <div className="skeleton color"></div>
                <div className="skeleton details">
                  <div className="line"></div>
                  <div className="line short"></div>
                  <div className="line short"></div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="no-courses">
            <h1>HI, {lecturerData.username}</h1>
            <p>Register courses</p>
          </div>
        ) : (
          courses.map((course, index) => (
             <div onClick={() => courseArea(course.courseId)} key={index} className="course-card">
              <div className="course-card-color"></div>
              <div className="course-details">
                <h4>{course.courseCode}</h4>
                <p>{course.courseName}</p>
                <p>{course.description}</p>
              </div>
              <div className="course-link">
                <div>
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
                <div>
                  <i className="fa-solid fa-trash"></i>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Section */}
      <div className="footer-l-d">
        <span>
          <i className="fa-solid fa-house"></i>
        </span>
        <Link to={`/upload/${currentUser?.uid}`}>
          <span>
            <i className="fa-solid fa-plus"></i>
          </span>
        </Link>
        <span>
          <i className="fa-solid fa-gear"></i>
        </span>
      </div>
    </div>
  );
};

export default Lecturer;
