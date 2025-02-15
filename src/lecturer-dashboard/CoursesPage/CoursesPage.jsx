import './CP.css';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../../config/config';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import WelcomeDiv from '../../../resuable/WelcomeDiv/welcome';
import Navbar from '../../../resuable/navbar/navbar';
import Panel from '../../../resuable/sidepanel/panel';

const CoursesPage = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const userId = uid || auth.currentUser?.uid;
        if (!userId) return;

        // Get the user's document
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const courseIds = userData.courses || [];

          if (courseIds.length > 0) {
            // Fetch courses one by one to allow sorting
            const coursesCollection = collection(db, 'courses');
            const fetchedCourses = [];

            for (const courseId of courseIds) {
              const courseRef = doc(coursesCollection, courseId);
              const courseSnap = await getDoc(courseRef);
              if (courseSnap.exists()) {
                fetchedCourses.push({ id: courseSnap.id, ...courseSnap.data() });
              }
            }

            // Sort courses by dateCreated (newest first)
            fetchedCourses.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

            setCourses(fetchedCourses);
          } else {
            setCourses([]);
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
      setLoading(false);
    };

    fetchCourses();
  }, [uid]);

  return (
    <div className="courses-page">
      <Navbar currentPage="coursesPage" lecturerId={uid || auth.currentUser?.uid} />
      <div className="dashboard-area">
        <WelcomeDiv />
        <div className="courses-area">
          <div className="courses-presented-course-section">
            {loading ? (
              <div className="skeleton-wrapper">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="skeleton-card"></div>
                ))}
              </div>
            ) : courses.length > 0 ? (
              courses.map((course) => (
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
              ))
            ) : (
              <div className="empty-courses">No courses available.</div>
            )}
          </div>
        </div>
      </div>
      <Panel />
    </div>
  );
};

export default CoursesPage;
