import './scourse.css';
import StudentNavbar from '../../../resuable/studentNavbar/StudentsNavbar';
import StudentPanel from '../../../resuable/studentPanel/StudentPanel';
import StudentWelcome from '../../../resuable/student-welcome/welcomeDivStudent';
import { useState, useEffect } from "react";
import { auth, db } from "../../../config/config";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const fetchCourses = async (studentId) => {
    if (!studentId) return [];

    const studentRef = doc(db, "users", studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) throw new Error("Student not found");

    const studentData = studentSnap.data();
    const courseIds = studentData.courses || [];

    if (courseIds.length === 0) return [];

    const coursePromises = courseIds.map(async (courseId) => {
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        return courseSnap.exists() ? { id: courseId, ...courseSnap.data() } : null;
    });

    return (await Promise.all(coursePromises)).filter(Boolean);
};

const StudentCourse = () => {
    const [studentId, setStudentId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setStudentId(user.uid);
            } else {
                setStudentId(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const { data: courses = [], isLoading, isError } = useQuery({
        queryKey: ["studentCourses", studentId],
        queryFn: () => fetchCourses(studentId),
        enabled: !!studentId,
        staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    });

    return (
        <div className='student-courses-div'>
            <StudentNavbar currentPage={"courses"} />
            <div className="dashboard-area">
                <StudentWelcome />

                <div className="direction-c-s">
                    <p>Courses</p>
                </div>

                <div className="courses-area-for-students">
                    {isLoading ? (
                        <div className="courses-grid">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="skeleton-card-azm"></div>
                            ))}
                        </div>
                    ) : isError ? (
                        <p className="error-message">Failed to load courses. Please try again.</p>
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
