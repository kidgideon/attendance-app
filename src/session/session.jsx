import './session.css';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../config/config';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

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
  }, [session]);

  // Handle session status toggle (End Session)
  const handleEndSession = async () => {
    if (!course || !session) return;

    const confirmEnd = window.confirm(
      'Are you sure you want to end this session? This action cannot be undone.'
    );
    if (!confirmEnd) return;

    const courseDocRef = doc(db, 'courses', courseId);
    try {
      const updatedSessions = course.sessions.map((s) =>
        s.sessionId === sessionId ? { ...s, active: false } : s
      );
      await updateDoc(courseDocRef, { sessions: updatedSessions });
      toast.success('Session ended successfully!');
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
          h1, h3 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>Course Name: ${course?.name || 'N/A'}</h1>
        <h3>Session Name: ${session?.name || 'N/A'}</h3>
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
                        <td>${participant.matricNumber || 'N/A'}</td>
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

  return (
    <div className="session-interface">
      <div className="session-top-interface">
        <p>{session?.name || 'Session Name'}</p>
        {session?.active && (
          <button onClick={handleEndSession}>End Session</button>
        )}
      </div>

      <div className="inactive-ative-area">
        <div
          className={`dot ${session?.active ? 'green-dot' : 'red-dot'}`}
        ></div>
        <p>{session?.active ? 'Active' : 'Inactive'}</p>
      </div>

      <div className="session-code-area">
        <h1>{session?.code || 'N/A'}</h1>
        <p>Share with your students</p>
      </div>

      <div className="direction-partcipants">
        <h3>
          Session Participants ({participants.length || 0})
        </h3>
        <i className="fa-solid fa-print" onClick={handlePrint}></i>
      </div>

      <div className="participants">
        {participants.length > 0 ? (
          participants.map((participant, index) => (
            <div className="participant" key={index}>
              <div className="participant-image">
                <img
                  src={
                    participant.profilePicture ||
                    'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media'
                  }
                  alt={`${participant.firstName || 'User'}'s profile`}
                />
              </div>
              <div className="participant-details">
                <p className="participant-name">
                  {participant.firstName} {participant.lastName}
                </p>
                <p className="participant-mat-no">
                  {participant.matricNumber || 'N/A'}
                </p>
              </div>
              <div className="participant-link">
                <a href={`/user/${participant.id}/stats`}>View Stats</a>
              </div>
            </div>
          ))
        ) : (
          <p>No participants have joined yet.</p>
        )}
      </div>

      <div className="footer-l-d">
        <span>
          <i className="fa-solid fa-house"></i>
          Home
        </span>
        <Link to={`/upload`}>
          <div className="c-s-c-t">
            <i className="fa-solid fa-plus"></i>
          </div>
        </Link>
        <span>
          <i className="fa-solid fa-gear"></i>
          Settings
        </span>
      </div>
    </div>
  );
};

export default Session;
