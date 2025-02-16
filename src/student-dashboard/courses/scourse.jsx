import './scourse.css';
import StudentNavbar from '../../../resuable/studentNavbar/StudentsNavbar';
import StudentPanel from '../../../resuable/studentPanel/StudentPanel';
import StudentWelcome from '../../../resuable/student-welcome/welcomeDivStudent';
import { useEffect, useState } from "react";
import { auth, db } from "../../../config/config";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const StudentCourse = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setStudentId(user.uid);
            } else {
                setStudentId(null);
                setCourses([]);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!studentId) return;

        const fetchCourses = async () => {
            setLoading(true);
            try {
                const studentRef = doc(db, "users", studentId);
                const studentSnap = await getDoc(studentRef);

                if (!studentSnap.exists()) {
                    console.error("Student not found");
                    setCourses([]);
                    return;
                }

                const studentData = studentSnap.data();
                const courseIds = studentData.courses || [];

                if (courseIds.length === 0) {
                    setCourses([]);
                    return;
                }

                const coursePromises = courseIds.map(async (courseId) => {
                    const courseRef = doc(db, "courses", courseId);
                    const courseSnap = await getDoc(courseRef);
                    return courseSnap.exists() ? { id: courseId, ...courseSnap.data() } : null;
                });

                const courseData = (await Promise.all(coursePromises)).filter(course => course !== null);
                setCourses(courseData);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [studentId]);

    return (
        <div className='student-courses-div'>
            <StudentNavbar currentPage={"courses"} />
            <div className="dashboard-area">
                <StudentWelcome />

                <div className="direction-c-s">
                    <p>Courses</p>
                </div>

                <div className="courses-area-for-students">
                    {loading ? (
                        <div className="courses-grid">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className=" skeleton-card-azm"></div>
                            ))}
                        </div>
                    ) : courses.length === 0 ? (
                        <p className="no-courses">No courses yet</p>
                    ) : (
                        <div className="courses-grid">
                            {courses.map((course) => (
                                <div 
                                    key={course.id} 
                                    className="course-card-azm"
                                    onClick={() => navigate(`/student/analysis/${course.id}/${studentId}`)}
                                >
                                    <h3>{course.courseCode}</h3>
                                    <p>{course.courseName}</p>
                                    <p className="desc">{course.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <StudentPanel />
        </div>
    );
};

export default StudentCourse;
