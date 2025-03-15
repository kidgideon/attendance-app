import React from "react";
import { auth, db } from "../../config/config"; // Import initialized auth & db
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import "./welc.css";
import svgImage from "./wel.svg";

// Fetch user data from Firestore
const fetchStudentData = async (userId) => {
  if (!userId) return null;
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

const StudentWelcome = () => {
  // Get the authenticated user ID
  const { data: userId } = useQuery({
    queryKey: ["authUser"],
    queryFn: () =>
      new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          resolve(user?.uid || null);
        });
        return () => unsubscribe();
      }),
    staleTime: Infinity, 
    cacheTime: Infinity,
  });

  // Fetch student data from Firestore (cached for 20 minutes)
  const { data: student, isLoading } = useQuery({
    queryKey: ["studentData", userId],
    queryFn: () => fetchStudentData(userId),
    enabled: !!userId,
    staleTime: 20 * 60 * 1000, 
    cacheTime: 30 * 60 * 1000,
  });

  return (
    <div className="welcome-div">

    <div className="image-div-area">
    <img src={svgImage} alt="Classroom" className="welcome-image" />
    </div>
      
      <div className="left-area">
        <h1>
          <span className="highlight">Hello,</span> {isLoading ? "Loading..." : `${student?.firstName || "User"} ${student?.lastName || ""}`}
        </h1>
        <p>
          We're excited to have you on board! Here, you can easily manage your courses, track your learning progress, and stay organized with your schedule.
        </p>
      </div>
    </div>
  );
};

export default StudentWelcome;
