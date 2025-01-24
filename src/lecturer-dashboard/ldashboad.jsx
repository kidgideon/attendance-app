import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../config/config';
import { doc, getDoc} from 'firebase/firestore';
import './ldashboard.css';

const Lecturer = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lecturerData, setLecturerData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Check authentication status and get the current user
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
  // Fetch courses
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
  
    const fetchCourses = async () => {
      try {
        setLoading(true); // Set loading state while fetching data
  
        // Reference to the lecturer's document in the 'users' collection
        const lecturerDocRef = doc(db, 'users', currentUser.uid);
        const lecturerDoc = await getDoc(lecturerDocRef);
  
        if (lecturerDoc.exists()) {
          const lecturerData = lecturerDoc.data();
          const courseIds = lecturerData.courses || []; // Array of course IDs
          console.log("Course IDs:", courseIds);
  
          if (courseIds.length === 0) {
            setCourses([]); // No courses found
            setLoading(false);
            return;
          }
  
          // Fetch details for each courseId individually
          const coursePromises = courseIds.map(async (courseId) => {
            const courseDocRef = doc(db, 'courses', courseId); // Reference to the course document
            const courseDoc = await getDoc(courseDocRef);
            return courseDoc.exists() ? { id: courseId, ...courseDoc.data() } : null;
          });
  
          // Wait for all promises to resolve
          const fetchedCourses = (await Promise.all(coursePromises)).filter(Boolean); // Remove null values
          setCourses(fetchedCourses); // Save fetched courses to state
        } else {
          console.error('No lecturer found!');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };
  
    fetchCourses();
  }, [isAuthenticated, currentUser]);
  
  
  if (!isAuthenticated) {
    return null;
  }

  const courseArea = (id) => {
    navigate(`/course/${id}`);
  };

  return (
    <div className="lecturer-dashboard">
      {/* Top Section */}
      <div className="top-section-lecturer">
        <div className="t-f-d">
          <img
            src={
              lecturerData?.profilePicture ||
              'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media'
            }
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
          courses.map((course) => (
            <div onClick={() => courseArea(course.courseId)} key={course.courseId} className="course-card">
              <div className="course-card-color"></div>
              <div className="course-details">
                <h3 className="c-h4">{course.courseCode}</h3>
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
          home
        </span>
        <Link to={`/upload/${currentUser?.uid}`}>
          <div className="c-s-c-t">
            <i className="fa-solid fa-plus"></i>
          </div>
        </Link>
        <span>
          <i className="fa-solid fa-gear"></i>
          settings
        </span>
      </div>
    </div>
  );
};

export default Lecturer;
