import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/config.js"; // Adjust the path as needed
import Splash from "../splash/splash.jsx";

function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      const uid = currentUser.uid;
      try {
        const userDoc = await getDoc(doc(db, "users", uid));

        if (!userDoc.exists()) {
          console.error("User document not found in Firestore.");
          setIsLoading(false);
          return;
        }

        const userData = userDoc.data();
        const { role, firstName, lastName, matriculationNumber } = userData;

        if (role === "lecturer") {
          if (!firstName || !lastName) {
            navigate(`/lecturer/complete-profile/${uid}`);
          } else {
            navigate(`/lecturer/${uid}`);
          }
          return;
        } 
        
        if (role === "student") {
          if (!firstName || !lastName || !matriculationNumber) {
            navigate(`/student/complete-profile/${uid}`);
          } else {
            navigate(`/student/${uid}`);
          }
          return;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return <Splash />;
  }

  return children;
}

export default ProtectedRoute;
