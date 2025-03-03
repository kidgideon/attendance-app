import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { auth, db } from '../../../config/config.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import CircularProgress from '@mui/material/CircularProgress';
import Navbar from '../../../resuable/navbar/navbar.jsx';
import Panel from '../../../resuable/sidepanel/panel.jsx';
import background from './patterned.svg';
import './rg.css';
import hamburger from "../../../resuable/navbar/hamburger.svg";

const CourseRegister = () => {
    const [courseCode, setCourseCode] = useState('');
    const [courseName, setCourseName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [isNavbarOpen, setIsNavbarOpen] = useState(false); // Navbar toggle state


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    
  const toggleNavbar = () => {
    setIsNavbarOpen((prev) => !prev);
  };

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };

    const handleEnroll = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('User not authenticated');
            return;
        }

        if (!courseCode || !courseName || !description) {
            toast.error('All fields are required');
            return;
        }

        setIsLoading(true);
        try {
            const courseRef = doc(db, 'courses', crypto.randomUUID()); // Generate unique course ID
            const courseId = courseRef.id;

            // Create a new course document
            await setDoc(courseRef, {
                courseId,
                courseCode,
                courseName,
                description,
                admin: user.uid,
                active: true,
                moderators: [],
                registeredStudents: [],
                sessions: [],
                dateCreated: new Date().toISOString()
            });

            // Update the user's document with the new course ID
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                courses: arrayUnion(courseId),
            });

            toast.success('Course registered successfully');
            navigate(`/courses/${user.uid}`);
        } catch (error) {
            console.error('Error registering course:', error);
            toast.error('Failed to register course');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-courses">

             <img className="theHamburger" src={hamburger} alt="Menu" onClick={toggleNavbar} />

             
        {isNavbarOpen && <div className="overlay" onClick={closeNavbar}></div>}

            <Navbar isOpen={isNavbarOpen}  currentPage={"registerPage"}/>
            <div className="dashboard-area">
                <div 
                    className="patterned-div"
                    style={{
                        backgroundImage: `url(${background})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        width: '100%',
                        height: '350px'
                    }}
                >
                    <h1>Enroll Courses</h1>
                    <p>Enrolling courses in a web-based system automates tracking, reduces errors, saves time, and ensures transparency.</p>
                </div>
                <div className="register-course-form">
                    <form onSubmit={handleEnroll}>
                        <div>
                            <label>Course Code</label>
                            <input 
                                type="text" 
                                placeholder="E.g MTH 101" 
                                value={courseCode} 
                                onChange={(e) => setCourseCode(e.target.value)} 
                                required
                            />
                        </div>
                        <div>
                            <label>Course Title</label>
                            <input 
                                type="text" 
                                placeholder="E.g Introduction to Mathematics" 
                                value={courseName} 
                                onChange={(e) => setCourseName(e.target.value)} 
                                required
                            />
                        </div>
                        <div>
                            <label>Description</label>
                            <input 
                                type="text" 
                                placeholder="E.g Learning Mathematics" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                required
                            />
                        </div>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? <CircularProgress size={20} style={{ color: '#fff' }} /> : 'Enroll Course'}
                        </button>
                    </form>
                </div>
            </div>
            <Panel />

            {isLoading && (
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
        </div>
    );
};

export default CourseRegister;
