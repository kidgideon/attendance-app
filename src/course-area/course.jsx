import './course.css';
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { v4 as uuidv4 } from 'uuid'; // For generating a unique id
import toast from 'react-hot-toast';

const Course = () => {
  const { id } = useParams();
  const courseId = id;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false); // State for spinner
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Ensure the user is authenticated
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }

        // Fetch user data
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          setUser({ uid: currentUser.uid, ...userSnapshot.data() });
        } else {
          console.error('User data not found in Firestore!');
          navigate(-1);
          return;
        }

        // Fetch course details directly from the `courses` collection
        const courseDocRef = doc(db, 'courses', courseId);
        const courseSnapshot = await getDoc(courseDocRef);

        if (courseSnapshot.exists()) {
          const courseData = courseSnapshot.data();
          setCourse(courseData);

          // Check if the user is an admin or a moderator
          const isAuthorized =
            courseData.admin === currentUser.uid ||
            courseData.moderators?.includes(currentUser.uid);

          if (!isAuthorized) {
            toast.error('You are not authorized to manage this course!');
            navigate(-1); // Redirect unauthorized users
          } else {
            const theactiveSession = courseData.sessions?.find((session) => session.active);
            setActiveSession(theactiveSession);
          }
        } else {
          console.error('Course not found in Firestore!');
          navigate(-1);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate(-1);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  const handleCreateSession = async () => {
    if (!user || !course || (course.admin !== user.uid && !course.moderators?.includes(user.uid))) {
      toast.error('You are not authorized to create a session for this course!');
      return;
    }

    const sessionId = uuidv4();
    const sessionCode = uuidv4().replace(/-/g, '').slice(0, 6);

    const newSession = {
      code: sessionCode,
      sessionId,
      students: [],
      courseCode: course.courseCode,
      courseName: course.courseName,
      fullName: `${user.lastName} ${user.firstName}`,
      dateCreated: new Date().toISOString(),
      active: true,
    };

    setLoading(true);
    try {
      // Update sessions array in the `courses` collection
      const courseDocRef = doc(db, 'courses', courseId);
      const courseSnapshot = await getDoc(courseDocRef);

      if (courseSnapshot.exists()) {
        const courseData = courseSnapshot.data();
        const updatedSessions = courseData.sessions ? [...courseData.sessions, newSession] : [newSession];

        await updateDoc(courseDocRef, { sessions: updatedSessions });
        toast.success('Session created successfully!');
        setDialogOpen(false);
        navigate(`/session/${courseId}/${sessionId}`);
      } else {
        console.error('Course not found for session creation!');
      }
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-interface">
      {loading && (
        <div
          className="spinner-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 9999,
          }}
        >
          <CircularProgress style={{ color: '#D3A941' }} />
        </div>
      )}

      <div className="higher-session">
        <div className="course-interface-top-layer">
          <p>{course ? course.courseName : 'Loading...'}</p>
        </div>
        <div className="course-body">
          <div className="course-color-area">g</div>
          <div className="course-i-details-interface">
            <p className="c-i-c">{course ? course.courseCode : 'Loading...'}</p>
            <p className="c-i-n">{course ? course.courseName : 'Loading...'}</p>
            <p className="c-i-d">{course ? course.description : 'Loading...'}</p>
            <div className="btn-c-5">
              {(course?.admin === user?.uid || course?.moderators?.includes(user?.uid)) ? (
                activeSession ? (
                  <button onClick={() => navigate(`/session/${activeSession.sessionId}`)}>See Active Session</button>
                ) : (
                  <button onClick={() => setDialogOpen(true)}>Create Session</button>
                )
              ) : (
                <p>checking permissions</p>
              )}
            </div>
          </div>
        </div>
        <h4>Session History ({course?.sessions?.length || 0})</h4>
      </div>

      <div className="session-history">
        {course?.sessions?.map((session, index) => (
          <div className="past-session" onClick={() => navigate(`/session/${courseId}/${session.sessionId}`)} key={index}>
            <div className="past-color-area">g</div>
            <div className="course-details">
              <p className="p-c-t-c">{session.courseCode}</p>
              <p className="p-c-t-n">{session.courseName}</p>
              <p className="p-c-d">{new Date(session.dateCreated).toLocaleDateString()}</p>
              <div className="creator-name">
                <p className="creator-name">{session.fullName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="footer-l-d">
        <span>
          <i className="fa-solid fa-house"></i> home
        </span>
        <Link to={`/upload`}>
          <div className="c-s-c-t">
            <i className="fa-solid fa-plus"></i>
          </div>
        </Link>
        <span>
          <i className="fa-solid fa-gear"></i> settings
        </span>
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Session Creation</DialogTitle>
        <DialogContent>Are you sure you want to create a new session for this course?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateSession} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Course;
