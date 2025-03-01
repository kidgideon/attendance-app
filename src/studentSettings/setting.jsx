import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import "./setting.css"; // Importing correct CSS file
import StudentPanel from "../../resuable/studentPanel/StudentPanel";
import StudentNavbar from "../../resuable/studentNavbar/StudentsNavbar";
import { auth, db } from "../../config/config";
import { onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const DEFAULT_PROFILE_PICTURE =
  "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media";

// Fetch student data
const fetchStudentData = async (studentId) => {
  if (!studentId) return null;
  const studentRef = doc(db, "users", studentId);
  const studentSnapshot = await getDoc(studentRef);
  if (!studentSnapshot.exists()) throw new Error("Student not found");
  return studentSnapshot.data();
};

const Settings = () => {
  const { studentId } = useParams();
  const [activeSection, setActiveSection] = useState("profile");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get authenticated user
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => setCurrentUser(user));
  }, []);

  const finalStudentId = useMemo(() => studentId || currentUser?.uid, [studentId, currentUser]);

  // Fetch student data using React Query
  const { data: studentData, isLoading } = useQuery({
    queryKey: ["studentData", finalStudentId],
    queryFn: () => fetchStudentData(finalStudentId),
    enabled: !!finalStudentId,
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        profilePicture: data.profilePicture || DEFAULT_PROFILE_PICTURE,
        matriculationNumber: data.matriculationNumber || "",
        email: data.email || "",
      }));
    },
    onError: () => toast.error("Error fetching student data"),
  });

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePicture: DEFAULT_PROFILE_PICTURE,
    matriculationNumber: "",
  });

  useEffect(() => {
    if (studentData) {
      setFormData((prev) => ({
        ...prev,
        firstName: studentData.firstName || "",
        lastName: studentData.lastName || "",
        email: studentData.email || prev.email,
        profilePicture: studentData.profilePicture || DEFAULT_PROFILE_PICTURE,
        matriculationNumber: studentData.matriculationNumber || "",
      }));
    }
  }, [studentData]);

  const handleUpdateProfile = async () => {
    if (!finalStudentId) return;
    if (!formData.firstName || !formData.lastName || !formData.matriculationNumber) {
      toast.error("All fields must be filled.");
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
      await updateDoc(doc(db, "users", finalStudentId), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        matriculationNumber: formData.matriculationNumber,
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

  return (
    <div className="settings-dashboard-interface">
      <StudentNavbar />
      <StudentPanel />

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

        <h3>Account Settings</h3>

        <div className="profile-area-main-section">
          <div className="page-section-navigator">
            <div className="navigator">
              <div
                className={activeSection === "profile" ? "active-tab" : ""}
                onClick={() => setActiveSection("profile")}
              >
                <i className="fa-solid fa-user"></i> Profile
              </div>
              <div
                className={activeSection === "password" ? "active-tab" : ""}
                onClick={() => setActiveSection("password")}
              >
                <i className="fa-solid fa-lock"></i> Password
              </div>
            </div>
          </div>

          {activeSection === "profile" && (
            <div className="navigated-actual-form-area">
              <h3>Profile</h3>
              <div className="picture-area">
                <img src={formData.profilePicture} alt="Profile" className="actual-area" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                  style={{ display: "none" }}
                  id="imageUpload"
                />
                <button onClick={() => document.getElementById("imageUpload").click()}>
                  Upload new
                </button>
              </div>

              <div className="form-area-navigated">
                <div>
                  <p>First Name</p>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <p>Last Name</p>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                </div>
                <div>
                  <p>Matric Number</p>
                  <input
                    type="text"
                    value={formData.matriculationNumber}
                    onChange={(e) => setFormData({ ...formData, matriculationNumber: e.target.value })}
                    placeholder="Matric Number"
                  />
                </div>
                <div className="button-space">
                  <button onClick={handleUpdateProfile} disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save"}
                  </button>
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
    </div>
  );
};

export default Settings;
