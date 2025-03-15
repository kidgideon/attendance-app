import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import "./lsetting.css";
import Panel from "../../resuable/sidepanel/panel";
import Navbar from "../../resuable/navbar/navbar";
import { auth, db } from "../../config/config";
import { onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import hamburger from "../../resuable/navbar/hamburger.svg";

const DEFAULT_PROFILE_PICTURE =
  "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media";

const fetchLecturerData = async (userId) => {
  if (!userId) return null;
  const lecturerRef = doc(db, "users", userId);
  const lecturerSnapshot = await getDoc(lecturerRef);
  if (!lecturerSnapshot.exists()) throw new Error("Lecturer not found");
  return lecturerSnapshot.data();
};

const LecturerSetting = () => {
  const { lecturerId } = useParams();
  const [activeSection, setActiveSection] = useState("profile");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false); // Navbar toggle state
  

  // Get authenticated user
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => setCurrentUser(user));
  }, []);

  const finalLecturerId = useMemo(() => lecturerId || currentUser?.uid, [lecturerId, currentUser]);

  // Fetch lecturer data using react-query
  const { data: lecturerData, isLoading } = useQuery({
    queryKey: ["lecturerData", finalLecturerId],
    queryFn: () => fetchLecturerData(finalLecturerId),
    enabled: !!finalLecturerId,
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        profilePicture: data.profilePicture || DEFAULT_PROFILE_PICTURE,
        userName: data.userName || "",
      }));
    },
    onError: () => toast.error("Error fetching user data"),
  });

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePicture: DEFAULT_PROFILE_PICTURE,
    userName: "",
  });

  useEffect(() => {
    if (lecturerData) {
      setFormData((prev) => ({
        ...prev,
        firstName: lecturerData.firstName || "",
        lastName: lecturerData.lastName || "",
        email: lecturerData.email || prev.email,
        profilePicture: lecturerData.profilePicture || DEFAULT_PROFILE_PICTURE,
        userName: lecturerData.userName || "",
      }));
    }
  }, [lecturerData]);

  const handleUpdateProfile = async () => {
    if (!finalLecturerId) return;
    if (!formData.firstName || !formData.lastName) {
      toast.error("First name and last name cannot be empty.");
      return;
    }

    setIsUpdating(true);
    let imageUrl = formData.profilePicture;

    if (selectedImage) {
      try {
        const formDataImg = new FormData();
        formDataImg.append("file", selectedImage);
        formDataImg.append("upload_preset", "myUploads");
        formDataImg.append("folder", "profilePictures");

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/dmugrfi2u/image/upload`,
          formDataImg
        );
        imageUrl = response.data.secure_url;
      } catch (error) {
        toast.error("Failed to upload image.");
        setIsUpdating(false);
        return;
      }
    }

    try {
      await updateDoc(doc(db, "users", finalLecturerId), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        profilePicture: imageUrl,
      });
      setFormData((prev) => ({ ...prev, profilePicture: imageUrl }));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    const emailToUse = currentUser?.email || formData.email;
    if (!emailToUse) {
      toast.error("Email is required to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, emailToUse);
      toast.success("Password reset email sent!");
    } catch (error) {
      toast.error("Failed to send password reset email.");
    }
  };

  const todayDate = format(new Date(), "MMMM d, yyyy");

  
  const toggleNavbar = () => {
    setIsNavbarOpen((prev) => !prev);
  };

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };
  return (
    <div className="settings-for-lecturer">
      <Navbar isOpen={isNavbarOpen} currentPage="settings" lecturerId={finalLecturerId} />

              <img className="theHamburger" src={hamburger} alt="Menu" onClick={toggleNavbar} />

      {isNavbarOpen && <div className="overlay" onClick={closeNavbar}></div>}
      <div className="dashboard-area">
        <Toaster position="top-center" />
        {isLoading && (
          <div className="spinner-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <div className="page-direction-area">
          <p>Settings</p>
          <p>{todayDate}</p>
        </div>
        <h3 className="intro-h3">Account Settings</h3>

        <div className="profile-area-main-section">
          <div className="page-section-navigator">
            <div className="navigator">
              <div className={activeSection === "profile" ? "active-tab" : ""} onClick={() => setActiveSection("profile")}>
                <i className="fa-solid fa-user"></i> Profile
              </div>
              <div className={activeSection === "password" ? "active-tab" : ""} onClick={() => setActiveSection("password")}>
                <i className="fa-solid fa-lock"></i> Password
              </div>
            </div>
          </div>

          {activeSection === "profile" && (
            <div className="navigated-actual-form-area">
              <h3>Profile</h3>
              <div className="picture-area">
                <img src={formData.profilePicture} alt="Profile" className="actual-area" />
                <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} style={{ display: "none" }} id="imageUpload" />
                <button onClick={() => document.getElementById("imageUpload").click()}>Upload new</button>
              </div>

              <div className="form-area-navigated">
                <div>
                  <p>First Name</p>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="First name" />
                </div>
                <div>
                  <p>Last Name</p>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Last Name" />
                </div>
                <div>
                  <p>Email</p>
                  <input type="text" value={formData.email} disabled placeholder="Email" />
                </div>
                <div className="button-space">
                  <button onClick={handleUpdateProfile} disabled={isUpdating}>{isUpdating ? "Saving..." : "Save"}</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "password" && (
            <div className="navigated-actual-form-area">
              <h3>Password</h3>
              <button onClick={handlePasswordReset}>Send Password Reset Email</button>
            </div>
          )}
        </div>
      </div>
      <Panel />
    </div>
  );
};

export default LecturerSetting;
