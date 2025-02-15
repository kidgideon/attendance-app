import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/config"; // Import initialized auth & db
import "./welc.css";
import svgImage from "./wel.svg";

const StudentWelcome = () => {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setStudent(userSnap.data());
        } else {
          console.log("User not found in Firestore");
        }
      } else {
        setStudent(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="welcome-div">
      <img src={svgImage} alt="Classroom" className="welcome-image" />
      <div className="left-area">
        <h1>
          <span className="highlight">Hello,</span> {student?.firstName || "Loading..."} {student?.lastName || ""}
        </h1>
        <p>
        We're excited to have you on board! Here, you can easily manage your courses, track your learning progress, and stay organized with your schedule.
        </p>
      </div>
    </div>
  );
};

export default StudentWelcome;
