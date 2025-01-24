import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/config.js"; // Adjust the path as needed
import Splash from "../splash/splash.jsx";

function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [checkedUser, setCheckedUser] = useState(false); // To ensure we process the auth user only once
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      console.log("Auth state changed:", currentUser);

      if (currentUser) {
        const uid = currentUser.uid;
        try {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === "lecturer") {
              navigate(`/lecturer/${uid}`);
              return;
            } else if (userData.role === "student") {
              navigate(`/student/${uid}`);
              return;
            }
          } else {
            console.error("User document not found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }

      // If no user or redirection occurred, stop loading
      setCheckedUser(true);
      setIsLoading(false);
    });

    return () => unsubscribe(); // Clean up the auth listener on component unmount
  }, [navigate]);

  if (isLoading) {
    // Show a splash screen while authentication and role checks are ongoing
    return <Splash />;
  }

  if (!checkedUser) {
    // While waiting for the user check to complete, show nothing
    return <Splash />;
  }

  // Render the protected component if no redirection occurred
  return children;
}

export default ProtectedRoute;
