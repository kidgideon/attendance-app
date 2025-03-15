import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { auth, db } from "../../config/config";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./welcome.css";
import imageI from "./img.svg";

// Fetch user data from Firestore
const fetchUserData = async (userId) => {
  if (!userId) return null; // Prevent unnecessary fetch
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

const WelcomeDiv = () => {
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
      setAuthLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Fetch user data (only runs if `userId` is valid)
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["userData", userId],
    queryFn: () => fetchUserData(userId),
    enabled: !!userId, // Prevents execution if userId is null
    staleTime: 20 * 60 * 1000, // 20 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  return (
    <div className="welcome-div">
      <div className="image-div-area">
      <img src={imageI} alt="Classroom" className="welcome-image" />
      </div>
      <div className="left-area">
        <h1>
          <span className="highlight">Hello,</span>{" "}
          {authLoading || userLoading ? "Loading..." : `${user?.firstName || "User"} ${user?.lastName || ""}`}
        </h1>
        <p>
          We're excited to have you on board! Here, you can efficiently manage your courses, 
          track student progress, and stay organized with your teaching schedule.
        </p>
      </div>
    </div>
  );
};

export default WelcomeDiv;
