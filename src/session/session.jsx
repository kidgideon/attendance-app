import './session.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { db } from '../../config/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import Navbar from '../../resuable/navbar/navbar';
import Panel from '../../resuable/sidepanel/panel';
import { format } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
import hamburger from "../../resuable/navbar/hamburger.svg";

// Function to fetch session data
const fetchCourseAndSession = async ({ queryKey }) => {
  const [, courseId, sessionId] = queryKey;
  const courseDocRef = doc(db, 'courses', courseId);
  const courseSnapshot = await getDoc(courseDocRef);

  if (!courseSnapshot.exists()) {
    throw new Error('Course not found');
  }

  const courseData = courseSnapshot.data();
  const sessionData = courseData.sessions.find(s => s.sessionId === sessionId);

  return { courseData, sessionData };
};

// Function to fetch participants
const fetchParticipants = async (studentIds) => {
  if (!studentIds || studentIds.length === 0) return [];
  
  const promises = studentIds.map(async (studentId) => {
    const userDocRef = doc(db, 'users', studentId);
    const userSnapshot = await getDoc(userDocRef);
    return userSnapshot.exists() ? userSnapshot.data() : null;
  });

  return (await Promise.all(promises)).filter(user => user !== null);
};

const Session = () => {
  const { courseId, sessionId } = useParams();
  const navigate = useNavigate();
  const [isNavbarOpen, setIsNavbarOpen] = useState(false); // Navbar toggle state

  // Fetch course & session data
  const { data, error, isLoading } = useQuery({
    queryKey: ['session', courseId, sessionId],
    queryFn: fetchCourseAndSession,
  });

  const course = data?.courseData;
  const session = data?.sessionData;

  // Fetch participants (only when session.students exist)
  const { data: participants = [] } = useQuery({
    queryKey: ['participants', session?.students],
    queryFn: () => fetchParticipants(session?.students),
    enabled: !!session?.students,  // Prevents unnecessary queries
  });

  // Mutation to end session
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!course || !session) return;
      const confirmEnd = window.confirm(
        'Are you sure you want to end this session? This action cannot be undone.'
      );
      if (!confirmEnd) return;

      const courseDocRef = doc(db, 'courses', courseId);
      const updatedSessions = course.sessions.map(s =>
        s.sessionId === sessionId ? { ...s, active: false } : s
      );

      await updateDoc(courseDocRef, { sessions: updatedSessions });
      toast.success('Session ended successfully!');
    },
  });

  const toggleNavbar = () => setIsNavbarOpen((prev) => !prev);
  const closeNavbar = () => setIsNavbarOpen(false);

  // Handle Print Function
  const handlePrint = () => {
    const printContent = `
      <html>
      <head>
        <title>Session Attendance</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2, h3 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>${course?.courseCode || 'N/A'}</h1>
        <h2>${course?.courseName || 'N/A'}</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Matric Number</th>
            </tr>
          </thead>
          <tbody>
            ${
              participants.length > 0
                ? participants
                    .map(
                      (p, index) => ` 
                      <tr>
                        <td>${index + 1}</td>
                        <td>${p.firstName} ${p.lastName}</td>
                        <td>${p.matriculationNumber || 'N/A'}</td>
                      </tr>
                    `
                    )
                    .join('')
                : '<tr><td colspan="3">No participants joined.</td></tr>'
            }
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Handle Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(session?.code || '')
      .then(() => toast.success('Session code copied to clipboard!'))
      .catch(() => toast.error('Failed to copy session code.'));
  };

  if (isLoading) return <p>Loading session...</p>;
  if (error) {
    toast.error(error.message);
    navigate(-1);
    return null;
  }

  const formattedDate = session?.date ? format(new Date(session.date), 'MMMM dd, yyyy HH:mm') : 'N/A';

  return (
    <div className="session-interface">
      <Navbar isOpen={isNavbarOpen} />
      
      {isNavbarOpen && <div className="overlay" onClick={closeNavbar}></div>}

      <img className="theHamburger" src={hamburger} alt="Menu" onClick={toggleNavbar} />
      
      <div className="dashboard-area">
        <div className="date-area">
          <p>{course?.courseName || 'N/A'}</p>
          <p>Date: {formattedDate}</p>
        </div>

        <div className="class-attendance-functions">
          <p className="active-inactive-direction">
            <span className={session?.active ? 'green-dot' : 'red-dot'}></span> 
            {session?.active ? 'Active' : 'Inactive'}
          </p>

          <div className="code-div">
            <h1>{session?.code || 'N/A'}</h1>
            <p>Share with your students</p>
          </div>

          {session?.active && (
            <div className="stop-div">
              <button onClick={() => endSessionMutation.mutate()}>Stop Attendance</button>
            </div>
          )}
        </div>

        <div className="student-numb">
          <h3>Class Attendance ({participants.length})</h3>
          <p onClick={handlePrint}>
            <i className="fa-solid fa-print"></i> Print
          </p>
        </div>

        <div className="students-list">
          {participants.length > 0 ? (
            participants.map((participant, index) => (
              <div key={participant.uid} className="students">
                <div className="student-profile-picture">
                  <img src={participant.profilePicture || 'default-profile.png'} alt="Student Profile" />
                </div>

                <div className="student-details">
                  <h3>{participant.firstName} {participant.lastName}</h3>
                  <p>{participant.matriculationNumber || 'N/A'}</p>
                </div>

                <div className="student-statistic-link">
                  <Link to={`/analysis/${course.courseId}/${participant.uid}`}>View Statistics &gt;</Link>
                </div>
              </div>
            ))
          ) : (
            <p>No students currently attending.</p>
          )}
        </div>
      </div>
      <Panel />
    </div>
  );
};

export default Session;
