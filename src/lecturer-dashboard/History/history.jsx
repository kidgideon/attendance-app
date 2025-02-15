import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./hp.css";
import Navbar from "../../../resuable/navbar/navbar";
import Panel from "../../../resuable/sidepanel/panel";
import WelcomeDiv from "../../../resuable/WelcomeDiv/welcome";

const LecturerHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);

      try {
        const user = auth.currentUser;
        if (!user) return;

        // Get the lecturer's data
        const lecturerDoc = await getDoc(doc(db, "users", user.uid));
        if (!lecturerDoc.exists()) {
          console.error("Lecturer data not found.");
          setLoading(false);
          return;
        }

        const lecturerData = lecturerDoc.data();
        const courseIds = lecturerData.courses || [];

        if (courseIds.length === 0) {
          console.log("Lecturer has no courses.");
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
              allSessions.push({
                ...session,
                courseId: courseId, // Store the courseId for navigation
                courseName: courseData.courseName,
                courseCode: courseData.courseCode,
                members: session.students.length, // Count students in session
              });
            });
          }
        }

        // Sort sessions by dateCreated (newest first)
        allSessions.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

        setSessions(allSessions);
      } catch (error) {
        console.error("Error fetching lecturer history:", error);
      }

      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchHistory();
    });

    return () => unsubscribe();
  }, [auth, db]);

  return (
    <div className="history-of-everything">
      <Navbar currentPage={"historyPage"} />
      <div className="dashboard-area">
        <WelcomeDiv />
        <div className="history-div-if-any">
          <div className="history-area-top">
            <p>History</p>
          </div>

          <div className="history-table-container">
            {loading ? (
              <p className="loading">Loading history...</p>
            ) : sessions.length === 0 ? (
              <p className="no-history">No session history found.</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Teacher Name</th>
                    <th>Members</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr
                      key={session.sessionId}
                      onClick={() => navigate(`/session/${session.courseId}/${session.sessionId}`)}
                    >
                      <td>{session.courseName} ({session.courseCode})</td>
                      <td>{session.moderator}</td>
                      <td>{session.members}</td>
                      <td>{new Date(session.dateCreated).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Panel />
    </div>
  );
};

export default LecturerHistory;
