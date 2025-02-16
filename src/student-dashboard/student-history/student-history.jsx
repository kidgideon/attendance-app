import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "./student-history.css";
import StudentNavbar from "../../../resuable/studentNavbar/StudentsNavbar";
import StudentPanel from "../../../resuable/studentPanel/StudentPanel";
import StudentWelcome from "../../../resuable/student-welcome/welcomeDivStudent";

const StudentHistory = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentName, setStudentName] = useState("");

    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const user = auth.currentUser;
                if (!user) return;

                // Get student details
                const studentDoc = await getDoc(doc(db, "users", user.uid));
                if (!studentDoc.exists()) {
                    console.error("Student data not found.");
                    setLoading(false);
                    return;
                }

                const studentData = studentDoc.data();
                setStudentName(studentData.fullName); // Get student's name
                const courseIds = studentData.courses || [];

                if (courseIds.length === 0) {
                    console.log("Student is not enrolled in any courses.");
                    setLoading(false);
                    return;
                }

                let allSessions = [];

                // Fetch courses and extract sessions
                for (const courseId of courseIds) {
                    const courseRef = doc(db, "courses", courseId);
                    const courseSnap = await getDoc(courseRef);

                    if (courseSnap.exists()) {
                        const courseData = courseSnap.data();
                        const courseSessions = courseData.sessions || [];

                        courseSessions.forEach((session) => {
                            const isPresent = session.students.includes(studentData.fullName);
                            allSessions.push({
                                ...session,
                                courseId: courseId,
                                courseName: courseData.courseName,
                                courseCode: courseData.courseCode,
                                attendanceStatus: isPresent ? "Present" : "Absent",
                            });
                        });
                    }
                }

                // Sort sessions by dateCreated (newest first)
                allSessions.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

                setSessions(allSessions);
            } catch (error) {
                console.error("Error fetching student history:", error);
            }

            setLoading(false);
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) fetchHistory();
        });

        return () => unsubscribe();
    }, [auth, db]);

    return (
        <div className="student-history-page">
            <StudentNavbar currentPage={"history"} />
            <div className="dashboard-area">
                <StudentWelcome />
                <div className="student-history-area">
                    <div className="history-header">
                        <p>History</p>
                    </div>

                    <div className="history-table-container">
                        {loading ? (
                            <div className="skeleton-loader">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="skeleton-row"></div>
                                ))}
                            </div>
                        ) : sessions.length === 0 ? (
                            <p className="no-history">No session history found.</p>
                        ) : (
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Teacher Name</th>
                                        <th>Attendance</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map((session) => (
                                        <tr key={session.sessionId}>
                                            <td>{session.courseName} ({session.courseCode})</td>
                                            <td>{session.moderator}</td>
                                            <td className={session.attendanceStatus.toLowerCase()}>
                                                {session.attendanceStatus}
                                            </td>
                                            <td>{new Date(session.dateCreated).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            <StudentPanel />
        </div>
    );
};

export default StudentHistory;
