import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import "./student-history.css";
import StudentNavbar from "../../../resuable/studentNavbar/StudentsNavbar";
import StudentPanel from "../../../resuable/studentPanel/StudentPanel";
import StudentWelcome from "../../../resuable/student-welcome/welcomeDivStudent";

const fetchStudentHistory = async (studentId) => {
    if (!studentId) return [];

    const db = getFirestore();
    const studentDoc = await getDoc(doc(db, "users", studentId));

    if (!studentDoc.exists()) throw new Error("Student data not found.");

    const studentData = studentDoc.data();
    const courseIds = studentData.courses || [];

    if (courseIds.length === 0) return [];

    let allSessions = [];

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

    return allSessions.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
};

const StudentHistory = () => {
    const [studentId, setStudentId] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setStudentId(user ? user.uid : null);
        });

        return () => unsubscribe();
    }, [auth]);

    const { data: sessions = [], isLoading, isError } = useQuery({
        queryKey: ["studentHistory", studentId],
        queryFn: () => fetchStudentHistory(studentId),
        enabled: !!studentId,
        staleTime: 10 * 60 * 1000, // Cache data for 10 minutes
    });

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
                        {isLoading ? (
                            <div className="skeleton-loader">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="skeleton-row"></div>
                                ))}
                            </div>
                        ) : isError ? (
                            <p className="error-message">Failed to load history. Please try again.</p>
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
