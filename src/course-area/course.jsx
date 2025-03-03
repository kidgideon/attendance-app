import './course.css';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import Navbar from '../../resuable/navbar/navbar';
import Panel from '../../resuable/sidepanel/panel';
import hamburger from "../../resuable/navbar/hamburger.svg";

const fetchCourse = async (courseId, userId) => {
  if (!courseId || !userId) return null;

  const courseDocRef = doc(db, 'courses', courseId);
  const courseSnapshot = await getDoc(courseDocRef);

  if (!courseSnapshot.exists()) throw new Error("Course not found.");

  const courseData = courseSnapshot.data();

  const isAuthorized =
    courseData.admin === userId || courseData.moderators?.includes(userId);

  if (!isAuthorized) throw new Error("Unauthorized access.");

  return {
    ...courseData,
    activeSession: courseData.sessions?.find(session => session.active) || null,
  };
};

const Course = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const user = auth.currentUser;
  const userId = user?.uid;

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["course", courseId, userId],
    queryFn: () => fetchCourse(courseId, userId),
    enabled: !!courseId && !!userId,
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
    retry: false,
    onError: () => {
      toast.error("Unauthorized or Course Not Found!");
      navigate(-1);
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false); // Navbar toggle state
  

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      if (!course || !userId || !location) throw new Error("Missing data!");

      const sessionId = uuidv4();
      const sessionCode = uuidv4().replace(/-/g, '').slice(0, 6);

      const newSession = {
        sessionId,
        code: sessionCode,
        students: [],
        courseCode: course.courseCode,
        courseName: course.courseName,
        fullName: `${user.lastName} ${user.firstName}`,
        dateCreated: new Date().toISOString(),
        active: true,
        moderator: `${user.firstName} ${user.lastName}`,
        moderatorId: userId,
        location,
      };

      const courseDocRef = doc(db, 'courses', courseId);
      const courseSnapshot = await getDoc(courseDocRef);

      if (!courseSnapshot.exists()) throw new Error("Course not found.");

      const updatedSessions = [...(course.sessions || []), newSession];
      await updateDoc(courseDocRef, { sessions: updatedSessions });

      toast.success("Session created successfully!");
      navigate(`/session/${courseId}/${sessionId}`);
    },
    onError: () => toast.error("Failed to create session."),
    onSuccess: () => {
      setDialogOpen(false);
      setLocationDialogOpen(false);
    },
  });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          toast.success("Location retrieved successfully!");
          setLocationDialogOpen(true);
        },
        error => {
          setLocationError(error.message);
          toast.error("Location access denied. Please enable location access.");
        },
        { timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  
  const toggleNavbar = () => {
    setIsNavbarOpen((prev) => !prev);
  };

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };

  return (
    <div className="course-interface">
      {createSessionMutation.isLoading && (
        <div className="spinner-overlay">
          <CircularProgress style={{ color: '#00CBCC' }} />
        </div>
      )}

{isNavbarOpen && <div className="overlay"  onClick={closeNavbar}></div>}

 <img className="theHamburger" src={hamburger} alt="Menu" onClick={toggleNavbar} />

      <Navbar  isOpen={isNavbarOpen} />
      <div className="dashboard-area">
        <div className="course-details-area">
          <div className="details-themselves">
            {isLoading ? (
              <h4>Loading course details...</h4>
            ) : (
              <>
                <h2>{course.courseCode || 'No Course Code'}</h2>
                <h3>{course.courseName || 'No Course Name'}</h3>
                <h4>{course.description || 'No Description Available'}</h4>

                <div className="session-creation-btn">
                  {course.activeSession ? (
                    <button onClick={() => navigate(`/session/${courseId}/${course.activeSession.sessionId}`)}>
                      See Active Session
                    </button>
                  ) : (
                    <button onClick={() => setDialogOpen(true)}>Create Session</button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="class-history-section">
          <h2 className="class-history-h1">Class History ({course?.sessions?.length || 0})</h2>
          <div className="course-class-history-compiled">
            {course?.sessions?.map(session => (
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

      <Dialog open={locationDialogOpen} onClose={() => setLocationDialogOpen(false)}>
        <DialogTitle>Confirm Location</DialogTitle>
        <DialogContent>
          <p>Do you want to proceed with this location?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => createSessionMutation.mutate()} color="primary" style={buttonStyle}>
            Create Session
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Create Session</DialogTitle>
        <DialogContent>
          <p>Confirm your location before creating the session.</p>
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
