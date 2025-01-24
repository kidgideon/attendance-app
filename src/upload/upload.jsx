import './upload.css';
import { useState } from 'react';
import { useParams, Link , useNavigate} from 'react-router-dom';
import { db } from '../../config/config'; // Import your Firebase configuration
import { doc, updateDoc, arrayUnion, setDoc, collection } from 'firebase/firestore'; // Firebase Firestore functions
import toast from 'react-hot-toast';
import { CircularProgress } from '@mui/material'; // Import CircularProgress from MUI

const Upload = () => {
  const { uid } = useParams(); // Get the lecturerId from the route parameters
  const navigate = useNavigate();
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
  
      // Create a new document reference with an auto-generated ID
      const courseRef = doc(collection(db, 'courses'));
      const courseId = courseRef.id; // Get the auto-generated ID
  
      const newCourse = {
        ...courseData,
        courseId, // Save the auto-generated ID as part of the course data
        dateCreated: new Date().toISOString(),
        moderators: [],
        admin: lecturerId,
        registeredStudents: [],
        sessions: [],
        active: true,
      };
  
      // Save the course data to Firestore
      await setDoc(courseRef, newCourse);
  
      // Update the lecturer's courses array with the new course ID
      await updateDoc(doc(db, 'users', lecturerId), {
        courses: arrayUnion(courseId), // Use the generated ID
      });
  
      toast.success('Course registered successfully!');
      setCourseData({ courseName: '', courseCode: '', description: '' }); // Reset the form
      setTimeout(() => {
navigate(`/lecturer/${lecturerId}`)
      }, 1000)
    } catch (error) {
      console.error(error);
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
        <span>
          <i className="fa-solid fa-house"></i>
          home
        </span>
        <Link to={`/upload`}>
          <div className='c-s-c-t'>
            <i className="fa-solid fa-plus"></i>
          </div>
        </Link>
        <span>
          <i className="fa-solid fa-gear"></i>
          settings
        </span>
      </div>
    </div>
  );
};

export default Upload;
