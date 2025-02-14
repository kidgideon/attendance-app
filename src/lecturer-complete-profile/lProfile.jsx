import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import axios from "axios";
import { db } from "../../config/config.js";
import toast from "react-hot-toast";
import "./lprofile.css";

const LecturerCompleteProfile = () => {
  const { uid } = useParams(); // Get lecturer's UID from URL params
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState(
    "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media"
  );
  const [selectedImage, setSelectedImage] = useState(null); // Store the selected file
  const [loading, setLoading] = useState(false);

  // Function to handle image selection (Preview only)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file); // Store file to upload later
    setProfileImage(URL.createObjectURL(file)); // Show preview instantly
  };

  // Function to upload image and update profile
  const handleUpdateProfile = async () => {
    if (!firstName || !lastName) {
      toast.error("First name and Last name cannot be empty!");
      return;
    }

    setLoading(true);
    let imageUrl = profileImage; // Keep the existing image if no new one is selected

    // Upload to Cloudinary only if a new image is selected
    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("upload_preset", "myUploads"); // Your preset name
      formData.append("folder", "profilePictures"); // The folder name

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/dmugrfi2u/image/upload`,
          formData
        );
        imageUrl = response.data.secure_url;
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Image upload failed");
        setLoading(false);
        return;
      }
    }

    // Update Firestore with profile details
    try {
      await updateDoc(doc(db, "users", uid), {
        firstName,
        lastName,
        profilePicture: imageUrl, // Save new image URL or existing one
      });

      toast.success("Profile updated successfully!");
      navigate(`/lecturer/${uid}`); // Redirect to dashboard
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }

    setLoading(false);
  };

  return (
    <div className="profile-completion">
      <h1>Update your profile</h1>

      {/* Image Upload Section with Pen Icon */}
      <div className="user-img">
        <img src={profileImage} alt="Profile" />
        
        {/* Pen icon for image editing */}
        <div className="edit-icon">
          <label htmlFor="image-upload">
            <i className="fa-regular fa-pen-to-square"></i>
          </label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* Input Fields */}
      <div className="user-update-inputs">
        <div>
          <p>First Name</p>
          <input
            type="text"
            placeholder="e.g. John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div>
          <p>Last Name</p>
          <input
            type="text"
            placeholder="e.g. Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      {/* Update Button */}
      <div className="update-button">
        <button onClick={handleUpdateProfile} disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
};

export default LecturerCompleteProfile;
