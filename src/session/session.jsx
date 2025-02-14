import './session.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../config/config';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import Navbar from '../../resuable/navbar/navbar';
import Panel from '../../resuable/sidepanel/panel';
import { format } from 'date-fns';  // Import date-fns for date formatting

const Session = () => {
  const { courseId, sessionId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);

  // Fetch course and session data
  useEffect(() => {
    const fetchCourseAndSession = async () => {
      try {
        const courseDocRef = doc(db, 'courses', courseId);
        const unsubscribeCourse = onSnapshot(courseDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const courseData = snapshot.data();
            setCourse(courseData);
        
            const currentSession = courseData.sessions.find(
              (s) => s.sessionId === sessionId
            );
            setSession(currentSession);
          } else {
            toast.error('Course not found!');
            navigate(-1);
          }
        });

        return () => unsubscribeCourse();
      } catch (error) {
        console.error('Error fetching course/session data:', error);
      }
    };

    fetchCourseAndSession();
  }, [courseId, sessionId, navigate]);

  // Fetch participants based on the students array
  useEffect(() => {
    const fetchParticipants = async () => {
      if (session?.students?.length > 0) {
        try {
          const studentPromises = session.students.map(async (studentId) => {
            const userDocRef = doc(db, 'users', studentId);
            const userSnapshot = await getDoc(userDocRef);
            return userSnapshot.exists() ? userSnapshot.data() : null;
          });

          const fetchedParticipants = await Promise.all(studentPromises);
          setParticipants(fetchedParticipants.filter((user) => user !== null));
        } catch (error) {
          console.error('Error fetching participants:', error);
        }
      } else {
        setParticipants([]);
      }
    };

    fetchParticipants();
  }, [session?.students]);

  const formattedDate = session?.date ? format(new Date(session.date), 'MMMM dd, yyyy HH:mm') : 'N/A';

  // Handle session status toggle (End Session)
  const handleEndSession = async () => {
    if (!course || !session) return;

    const confirmEnd = window.confirm(
      'Are you sure you want to end this session? This action cannot be undone, and no further attendance can be taken.'
    );
    if (!confirmEnd) return;

    const courseDocRef = doc(db, 'courses', courseId);

    try {
      // Update session to mark it as inactive (ended)
      const updatedSessions = course.sessions.map((s) =>
        s.sessionId === sessionId ? { ...s, active: false } : s
      );

      // Update the course document to reflect the new session status
      await updateDoc(courseDocRef, { sessions: updatedSessions });

      // Show success message
      toast.success('Session ended successfully! No further attendance can be taken.');

    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session.');
    }
  };

  // Handle printing of session details
  const handlePrint = () => {
    const printContent = `
      <html>
      <head>
        <title>Session Attendance</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h3, h2, h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
       <h1> ${course?.courseCode || 'N/A'}</h1>
         <h2> ${course?.courseName || 'N/A'}</h2>

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
                      (participant, index) => ` 
                      <tr>
                        <td>${index + 1}</td>
                        <td>${participant.firstName} ${participant.lastName}</td>
                        <td>${participant.matriculationNumber || 'N/A'}</td>
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

  // Handle copy session code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(session?.code || '').then(() => {
      toast.success('Session code copied to clipboard!');
    }).catch((err) => {
      toast.error('Failed to copy session code.');
    });
  };

  return (
    <div className="session-interface">
      <Navbar />
      <div className="session-proper-area">
        <div className="date-area">
          <p> {course?.courseName || 'N/A'}</p>
          <p>Date: {formattedDate}</p>
        </div>

        <div className="class-attendance-functions">
          <p className="active-inactive-direction">
            <span className={session?.active ? 'green-dot' : 'red-dot'}></span> 
            <p>{session?.active ? 'Active' : 'Inactive'}</p>
          </p>

          <div className="code-div">
            <h1>{session?.code || 'N/A'}</h1>
            <p>Share with your students</p>
          </div>

          {session?.active && (
            <div className="stop-div">
              <button onClick={handleEndSession}>Stop Attendance</button>
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
                  <img src={participant.profilePicture || 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media'} alt="Student Profile" />
                </div>

                <div className="student-details">
                  <h3>{participant.firstName} {participant.lastName}</h3>
                  <p>{participant.matriculationNumber || 'N/A'}</p>
                </div>

                <div className="student-statistic-link">
                  <a href={`/student/statistics/${participant.uid}`}>view statistics &gt;</a>
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
