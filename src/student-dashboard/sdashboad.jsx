import StudentNavbar from "../../resuable/studentNavbar/StudentsNavbar";
import StudentPanel from "../../resuable/studentPanel/StudentPanel";
import { db, auth } from "../../config/config";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { getDistance } from "geolib";
import StudentWelcome from "../../resuable/student-welcome/welcomeDivStudent";
import "./student.css";
import { useEffect, useState } from "react";
import purpleImg from "./purpleImage.svg";
import man from "./man.svg";
import computer from "./computer.svg";
import hamburger from "../../resuable/navbar/hamburger.svg";

const Student = () => {
  const [studentId, setStudentId] = useState(localStorage.getItem("studentId") || null);
  const [attendanceCode, setAttendanceCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]); // Student's enrolled courses
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0, absent: 0 });
   const [isNavbarOpen, setIsNavbarOpen] = useState(false); // Navbar toggle state
  

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setStudentId(user.uid);
        localStorage.setItem("studentId", user.uid);
        fetchStudentData(user.uid);
      } else {
        setStudentId(null);
        localStorage.removeItem("studentId");
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchStudentData = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      setCourses(userData.courses || []);
      calculateAttendance(userData.courses || []);
    } else {
      console.log("User not found in Firestore");
    }
  };

  const calculateAttendance = async (studentCourses) => {
    if (!studentCourses.length) {
      setAttendanceStats({ total: 0, present: 0, absent: 0 });
      return;
    }

    let total = 0;
    let present = 0;

    for (const courseId of studentCourses) {
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);

      if (courseSnap.exists()) {
        const courseData = courseSnap.data();
        if (courseData.sessions) {
          total += courseData.sessions.length;

          for (const session of courseData.sessions) {
            if (session.students && session.students.includes(studentId)) {
              present++;
            }
          }
        }
      }
    }

    setAttendanceStats({
      total,
      present,
      absent: total - present,
    });
  };

  
  const toggleNavbar = () => {
    setIsNavbarOpen((prev) => !prev);
  };

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser.");
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => reject(`Location error: ${error.message}`),
          { timeout: 10000, maximumAge: 0 }
        );
      }
    });
  };

  const handleSignAttendance = async () => {
    if (!attendanceCode.trim()) {
      toast.error("Enter a valid attendance code.");
      return;
    }

    if (!studentId) {
      toast.error("User not authenticated.");
      return;
    }

    setLoading(true);

    try {
      const studentLocation = await getUserLocation();
      if (!studentLocation) {
        toast.error("Location access denied. Enable location to sign attendance.");
        return;
      }

      const coursesSnapshot = await getDocs(collection(db, "courses"));
      let sessionFound = false;
      let signedCourseId = null;

      for (const courseDoc of coursesSnapshot.docs) {
        const courseData = courseDoc.data();
        if (!courseData.sessions || !Array.isArray(courseData.sessions)) continue;

        for (const session of courseData.sessions) {
          if (!session.active || session.code !== attendanceCode) continue;

          const lecturerLocation = session.location;
          if (!lecturerLocation || typeof lecturerLocation !== "object") {
            toast.error("Session location not properly set.");
            return;
          }

          const { latitude: lecLat, longitude: lecLon } = lecturerLocation;
          const { latitude: stuLat, longitude: stuLon } = studentLocation;

          if (
            typeof lecLat !== "number" ||
            typeof lecLon !== "number" ||
            typeof stuLat !== "number" ||
            typeof stuLon !== "number"
          ) {
            toast.error("Invalid location data.");
            return;
          }

          const distance = getDistance(
            { latitude: stuLat, longitude: stuLon },
            { latitude: lecLat, longitude: lecLon }
          );

          if (distance > 100) {
            toast.error(`You are too far from the lecture hall. (${distance}m away)`);
            return;
          }

          const updatedStudents = session.students || [];
          if (updatedStudents.includes(studentId)) {
            toast.success("Attendance already signed.");
            return;
          }

          updatedStudents.push(studentId);

          await updateDoc(doc(db, "courses", courseDoc.id), {
            sessions: courseData.sessions.map((s) =>
              s.id === session.id ? { ...s, students: updatedStudents } : s
            ),
          });

          signedCourseId = courseDoc.id;
          sessionFound = true;
          break;
        }

        if (sessionFound) break;
      }

      if (!sessionFound) {
        toast.error("Invalid attendance code or no active session found.");
        return;
      }

      const userRef = doc(db, "users", studentId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const existingCourses = userData.courses || [];

        if (!existingCourses.includes(signedCourseId)) {
          await updateDoc(userRef, {
            courses: [...existingCourses, signedCourseId],
          });
        }
      } else {
        await updateDoc(userRef, { courses: [signedCourseId] });
      }

      toast.success(`Attendance signed for course ${signedCourseId}`);
      fetchStudentData(studentId);
    } catch (error) {
      console.error("Error signing attendance:", error);
      toast.error("Error signing attendance. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-dashboard">
      <StudentNavbar currentPage={"dashboard"}  isOpen={isNavbarOpen}/>
      
      {isNavbarOpen && <div className="overlay" onClick={closeNavbar}></div>}
       <img className="theHamburger" src={hamburger} alt="Menu" onClick={toggleNavbar} />
      

      <div className="dashboard-area">
        <StudentWelcome />

        <div className="course-attendance-data">
  <div className="main-ai-div">
    <div className="icon-div green">
      <i className="fa-regular fa-user"></i>
    </div>
    <div className="atten-data-div">
      <h3>{attendanceStats.present}</h3>
      <p>Attendance Points</p>
    </div>
  </div>

  <div className="main-ai-div">
    <div className="icon-div purple">
      <i className="fa-solid fa-chart-simple"></i>
    </div>
    <div className="atten-data-div">
      <h3>{attendanceStats.total}</h3>
      <p>Total classes</p>
    </div>
  </div>

  <div className="main-ai-div">
    <div className="icon-div red">
      <i className="fa-regular fa-circle-xmark"></i>
    </div>
    <div className="atten-data-div">
      <h3>{attendanceStats.absent}</h3>
      <p>Total Absent</p>
    </div>
  </div>
</div>
        <div className="attendance-sign-area">
          <div className="attendance-area">
            <img src={computer} alt="" />
            <p>Enter the provided code in the designated field to access the class.</p>
            <input type="text" value={attendanceCode} onChange={(e) => setAttendanceCode(e.target.value)} placeholder="Class code" />
            <button onClick={handleSignAttendance} disabled={loading}>
              {loading ? "Signing..." : "Mark Attendance"}
            </button>
          </div>
          <div className="direction-signs-area">
  <div className="top-one" style={{
    backgroundImage: `url(${purpleImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    width: '350px',
    height: '250px'
  }}>
    <p>Track your progress effortlessly! Access and review your attendance records anytime.</p>
  </div>
  <div className="under-one" style={{
    backgroundImage: `url(${man})`, // Fixed syntax
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    width: '350px',
    height: '250px'
  }}>
    <p>Never miss a session! Join tutor-led classes and mark your attendance with ease.</p>
  </div>
</div>
        </div>
      </div>

      <StudentPanel />

      
    </div>
  );
};

export default Student;
