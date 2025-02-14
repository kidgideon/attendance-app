import StudentNavbar from "../../resuable/studentNavbar/StudentsNavbar";
import StudentPanel from "../../resuable/studentPanel/StudentPanel";
import { db, auth } from "../../config/config";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { getDistance } from 'geolib';  // Import Geolib's getDistance

import './student.css';
import { useEffect, useState } from "react";

const Student = () => {
  const [studentId, setStudentId] = useState(null);
  const [attendanceCode, setAttendanceCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get Student ID from Auth
    const user = auth.currentUser;
    if (user) setStudentId(user.uid);
  }, []);

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
          () => reject("Unable to retrieve location.")
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
       // Get Student Location
       const studentLocation = await getUserLocation();
       if (!studentLocation) {
         toast.error("Location access denied. Enable location to sign attendance.");
         return;
       }
   
       // Fetch all courses
       const coursesSnapshot = await getDocs(collection(db, "courses"));
       let sessionFound = false;
   
       for (const courseDoc of coursesSnapshot.docs) {
         const courseData = courseDoc.data();
         if (!courseData.sessions || !Array.isArray(courseData.sessions)) continue; // Skip if no sessions
   
         for (const session of courseData.sessions) {
           if (!session.active || session.code !== attendanceCode) continue; // Skip inactive sessions or wrong codes
   
           // Extract correct location values
           const lecturerLocation = session.location;
           if (!lecturerLocation || typeof lecturerLocation !== "object") {
             toast.error("Session location not properly set.");
             return;
           }
   
           const { latitude: lecLat, longitude: lecLon } = lecturerLocation;
           const { latitude: stuLat, longitude: stuLon } = studentLocation;
   
           console.log("Lecturer Location (Latitude, Longitude):", lecLat, lecLon);
           console.log("Student Location (Latitude, Longitude):", stuLat, stuLon);
   
           if (
             typeof lecLat !== "number" ||
             typeof lecLon !== "number" ||
             typeof stuLat !== "number" ||
             typeof stuLon !== "number"
           ) {
             toast.error("Invalid location data.");
             return;
           }
   
           // Round the coordinates to improve accuracy (optional step to reduce float inaccuracies)
           const roundedLecLat = lecLat.toFixed(5);
           const roundedLecLon = lecLon.toFixed(5);
           const roundedStuLat = stuLat.toFixed(5);
           const roundedStuLon = stuLon.toFixed(5);
   
           console.log("Rounded Lecturer Location:", roundedLecLat, roundedLecLon);
           console.log("Rounded Student Location:", roundedStuLat, roundedStuLon);
   
           // Use Geolib to calculate the distance in meters
           const distance = getDistance(
             { latitude: roundedStuLat, longitude: roundedStuLon },
             { latitude: roundedLecLat, longitude: roundedLecLon }
           );
   
           console.log(`Distance calculated: ${distance} meters`);
   
           if (distance > 50) { // 50 meters threshold for attendance
             toast.error(`You are too far from the lecture hall. (${distance}m away)`);
             return;
           }
   
           // Add student to session if not already present
           const updatedStudents = session.students || [];
           if (updatedStudents.includes(studentId)) {
             toast.success("Attendance already signed.");
             return;
           }
   
           updatedStudents.push(studentId);
   
           // Update the session inside Firestore
           await updateDoc(doc(db, "courses", courseDoc.id), {
             sessions: courseData.sessions.map((s) =>
               s.id === session.id ? { ...s, students: updatedStudents } : s
             ),
           });
   
           toast.success("Attendance signed successfully!");
           sessionFound = true;
           break;
         }
   
         if (sessionFound) break;
       }
   
       if (!sessionFound) {
         toast.error("Invalid attendance code or no active session found.");
       }
     } catch (error) {
       console.error("Error signing attendance:", error);
       toast.error("Error signing attendance. Try again.");
     } finally {
       setLoading(false);
     }
   };
   
  return (
    <div className="student-dashboard">
      <StudentNavbar />
      <div className="student-area-official">
        <div className="sign-attendance">
          <input
            placeholder="Enter attendance code"
            value={attendanceCode}
            onChange={(e) => setAttendanceCode(e.target.value)}
          />
          <button onClick={handleSignAttendance} disabled={loading}>
            {loading ? "Signing..." : "Sign Here"}
          </button>
        </div>
      </div>
      <StudentPanel />
    </div>
  );
};

export default Student;
