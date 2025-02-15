import './course.css';
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { v4 as uuidv4 } from 'uuid'; // For generating a unique id
import toast from 'react-hot-toast';
import Navbar from '../../resuable/navbar/navbar';
import Panel from '../../resuable/sidepanel/panel';

const Course = () => {
  const { id } = useParams();
  const courseId = id;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false); // For location confirmation
  const [loading, setLoading] = useState(false); // State for spinner
  const [activeSession, setActiveSession] = useState(null);
  const [location, setLocation] = useState(null); // State for location
  const [locationError, setLocationError] = useState(null); // To handle location errors

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

    if (!location) {
      toast.error('Please enable location access to create the session!');
      return;
    }

    // Create session only if location data is available
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
      moderator: `${user.firstName} ${user.lastName}`,
      moderatorId: user.uid,
      location: { latitude: location.latitude, longitude: location.longitude },
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
        setLocationDialogOpen(false); // Close location dialog
        setDialogOpen(false); // Close create session dialog
        navigate(`/session/${courseId}/${sessionId}`);
      } else {
        console.error('Course not found for session creation!');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('There was an error creating the session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
  
          toast.success("Location retrieved successfully!");
          setLocationDialogOpen(true); // Show session creation prompt
        },
        (error) => {
          setLocationError(error.message);
          toast.error("Location access denied. Please enable location access.");
        },
        {
          timeout: 10000, // 10s timeout
          maximumAge: 0, // Prevents using cached location
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      toast.error("Geolocation is not supported by this browser.");
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
          <CircularProgress style={{ color: '#00CBCC' }} />
        </div>
      )}
      <Navbar />
      <div className="course-area">
        <div className="course-details-area">
          <div className="details-themselves">
            {course ? (
              <>
                <h2>{course.courseCode || 'No Course Code'}</h2>
                <h3>{course.courseName || 'No Course Name'}</h3>
                <h4>{course.description || 'No Description Available'}</h4>
                
      {/* Session Creation Button */}
<div className="session-creation-btn">
  {activeSession ? (
    <button onClick={() => navigate(`/session/${courseId}/${activeSession.sessionId}`)}>
      See Active Session
    </button>
  ) : (
    <button onClick={() => setDialogOpen(true)}>
      Create Session
    </button>
  )}
</div>

              </>
            ) : (
              <h4>Loading course details...</h4>
            )}
          </div>
        </div>

        {/* Class History Section */}
        <div className="class-history-section">
          <h2 className="class-history-h1">Class History ({course?.sessions?.length || 0})</h2>
          <div className="course-class-history-compiled">
            {course?.sessions?.map((session) => (
              <div key={session.sessionId} className="class-itself">
                <h2>{session.students.length} students attended</h2>
                <h3>Held on {new Date(session.dateCreated).toLocaleDateString()}</h3>
                <h4>Moderated by {session.moderator}</h4>
                <div className="see-mpre-det" onClick={() => navigate(`/session/${courseId}/${session.sessionId}`)}>
                  <p>See details &gt;</p>
                </div>
              </div>
            ))}
          </div>
        </div>

       
      </div>
      <Panel />

      {/* Location Confirmation Dialog */}
      <Dialog open={locationDialogOpen} onClose={() => setLocationDialogOpen(false)}>
        <DialogTitle>Confirm Location</DialogTitle>
        <DialogContent>
          <p>
            You are about to create a session for this course. Do you want to proceed with the confirmed location?
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateSession} color="primary" style={buttonStyle}>
            Create Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Creation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Create Session</DialogTitle>
        <DialogContent>
          <p>You are about to create a session for your students. Please confirm your location first.</p>
          <Button onClick={getLocation} variant="contained" style={buttonStyle}>
            Confirm Location
          </Button>
          {locationError && <p style={{ color: 'red' }}>{locationError}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const buttonStyle = {
  backgroundColor: '#00CBCC',
  color: 'white',
  padding: '10px 15px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default Course;
