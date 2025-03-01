import "./CP.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { auth, db } from "../../../config/config";
import { doc, getDoc } from "firebase/firestore";
import WelcomeDiv from "../../../resuable/WelcomeDiv/welcome";
import Navbar from "../../../resuable/navbar/navbar";
import Panel from "../../../resuable/sidepanel/panel";

const fetchCourses = async (userId) => {
  if (!userId) return [];

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return [];

    const userData = userSnap.data();
    const courseIds = userData.courses || [];

    if (courseIds.length === 0) return [];

    const fetchedCourses = await Promise.all(
      courseIds.map(async (courseId) => {
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        return courseSnap.exists() ? { id: courseSnap.id, ...courseSnap.data() } : null;
      })
    );

    return fetchedCourses.filter(Boolean).sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

const CoursesPage = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(uid || auth.currentUser?.uid);

  useEffect(() => {
    if (!userId) {
      setUserId(auth.currentUser?.uid);
    }
  }, []);

  // Fetch courses using React Query
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses", userId],
    queryFn: () => fetchCourses(userId),
    enabled: !!userId, // Runs only if userId is available
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    cacheTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });

  return (
    <div className="courses-page">
      <Navbar currentPage="coursesPage" lecturerId={userId} />
      <div className="dashboard-area">
        <WelcomeDiv />
        <div className="courses-area">
          <div className="courses-presented-course-section">
            {isLoading ? (
              <div className="skeleton-wrapper">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="skeleton-card skeleton-glow"></div>
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
