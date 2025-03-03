import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "./hp.css";
import Navbar from "../../../resuable/navbar/navbar";
import Panel from "../../../resuable/sidepanel/panel";
import WelcomeDiv from "../../../resuable/WelcomeDiv/welcome";
import hamburger from "../../../resuable/navbar/hamburger.svg";

const fetchHistory = async (userId, db) => {
  if (!userId) return [];

  try {
    const lecturerDoc = await getDoc(doc(db, "users", userId));
    if (!lecturerDoc.exists()) return [];

    const lecturerData = lecturerDoc.data();
    const courseIds = lecturerData.courses || [];

    if (courseIds.length === 0) return [];

    let allSessions = [];

    for (const courseId of courseIds) {
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);

      if (courseSnap.exists()) {
        const courseData = courseSnap.data();
        const courseSessions = courseData.sessions || [];

        courseSessions.forEach((session) => {
          allSessions.push({
            ...session,
            courseId,
            courseName: courseData.courseName,
            courseCode: courseData.courseCode,
            members: session.students.length,
          });
        });
      }
    }

    return allSessions.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
  } catch (error) {
    console.error("Error fetching lecturer history:", error);
    return [];
  }
};

const LecturerHistory = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const [userId, setUserId] = useState(auth.currentUser?.uid);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false); // Navbar toggle state

  useEffect(() => {
    if (!userId) {
      setUserId(auth.currentUser?.uid);
    }
  }, []);

     
  const toggleNavbar = () => {
    setIsNavbarOpen((prev) => !prev);
  };

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };


  const { data: sessions, isLoading } = useQuery({
    queryKey: ["lecturerHistory", userId],
    queryFn: () => fetchHistory(userId, db),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    cacheTime: 60 * 60 * 1000, // Keep cached for 1 hour
  });

  return (
    <div className="history-of-everything">
      <Navbar isOpen={isNavbarOpen} currentPage={"historyPage"} />
       <img className="theHamburger" src={hamburger} alt="Menu" onClick={toggleNavbar} />

       {isNavbarOpen && <div className="overlay" onClick={closeNavbar}></div>}
      <div className="dashboard-area">
        <WelcomeDiv />
        <div className="history-div-if-any">
          <div className="history-area-top">
            <p>History</p>
          </div>

          <div className="history-table-container">
            {isLoading ? (
              <div className="skeleton-history-wrapper">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="skeleton-history-row skeleton-glow"></div>
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
