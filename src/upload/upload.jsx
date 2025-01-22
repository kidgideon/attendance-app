import './upload.css';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../config/config'; // Import your Firebase configuration
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'; // Firebase Firestore functions
import { v4 as uuidv4 } from 'uuid'; // For generating a unique courseId
import toast from 'react-hot-toast';
import { CircularProgress } from '@mui/material'; // Import CircularProgress from MUI

const Upload = () => {
  const { uid } = useParams(); // Get the lecturerId from the route parameters
  const lecturerId = uid;
  const [courseData, setCourseData] = useState({
    courseName: '',
    courseCode: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!courseData.courseName || !courseData.courseCode || !courseData.description) {
        toast.error('All fields are required!');
        setLoading(false);
        return;
      }

      const newCourse = {
        ...courseData,
        courseId: uuidv4(), // Generate a unique course ID
        dateCreated: new Date().toISOString(),
        moderators: [],
        admin: lecturerId,
        registeredStudents: [],
        sessions: [],
        active: true,
      };

      // Get the lecturer's document from Firestore
      const lecturerRef = doc(db, 'users', lecturerId);

      // Update the lecturer's courses array
      await updateDoc(lecturerRef, {
        courses: arrayUnion(newCourse),
      });

      toast.success('Course registered successfully!');
      setCourseData({ courseName: '', courseCode: '', description: '' });
    } catch (error) {
      console.log(error)
      console.log(error.message)
      setMessage(error.message || 'Failed to register course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploading-interface">
      {/* Spinner overlay */}
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

      <form onSubmit={handleSubmit}>
        <div>
          <p>Course Title</p>
          <input
            type="text"
            name="courseName"
            placeholder="e.g Mathematical method one"
            value={courseData.courseName}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <p>Course Code</p>
          <input
            type="text"
            name="courseCode"
            placeholder="e.g MTH 101"
            value={courseData.courseCode}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <p>Description</p>
          <input
            type="text"
            name="description"
            placeholder="e.g learning the fundamentals of maths"
            value={courseData.description}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register Course'}
        </button>
      </form>


      <div className="footer-l-d">
        <Link to={`/lecturer/${lecturerId}`}>
        <span>
          <i className="fa-solid fa-house"></i>
        </span>
        </Link>
        <Link >
          <span>
            <i className="fa-solid fa-plus"></i>
          </span>
        </Link>
        <span>
          <i className="fa-solid fa-gear"></i>
        </span>
      </div>
    </div>
  );
};

export default Upload;
