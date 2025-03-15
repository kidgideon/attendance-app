import React, { useState } from 'react';
import facebook from './facebook.svg';
import featured from './feautured.svg';
import eclipse from './Vector.svg'
import google from './google.svg'
import './register.css';
import { auth, db } from '../../config/config';
import {createUserWithEmailAndPassword,signInWithPopup,GoogleAuthProvider,sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress'; // Assuming Material UI is used

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();


  const handleEmailPasswordSignUp = async (e) => {
    e.preventDefault();
  
    // Username validation: no spaces or special characters
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
      toast.error("Username can only contain letters and numbers (no spaces or special characters).");
      return;
    }
  
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
  
    setLoading(true); // Show spinner
  
    try {
      // Check if the email already exists in Firestore
      const userDocRef = doc(db, "users", email); // Using email as document ID
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const existingUser = userDocSnap.data();
  
        // Check if the email is unverified
        if (!existingUser.isEmailVerified) {
          // Resend email verification
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await sendEmailVerification(userCredential.user);
  
          toast.success("This email is already registered but not verified. A new verification link has been sent.");
          return;
        } else {
          toast.error("This email is already registered and verified. Please log in.");
          return;
        }
      }
  
      // Proceed with normal signup if the email is not registered
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Default profile picture
      const defaultProfilePic = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media";
  
      // Save user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        role,
        uid: user.uid,
        profilePicture: defaultProfilePic,
        isEmailVerified: false,
      });
  
      // Send email verification
      await sendEmailVerification(user);
  
      toast.success("Account created successfully! Check your email for verification.");
      setTimeout(() => navigate("/login"), 4000);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("This email is already registered.");
      } else if (error.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false); // Hide spinner
    }
  };
  

  const handleGoogleSignUp = async () => {
    setLoading(true); // Show spinner

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Default profile picture
      const defaultProfilePic = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

      // Save user details in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: user.displayName,
        email: user.email,
        role,
        uid: user.uid,
        profilePicture: defaultProfilePic,
        isEmailVerified: true,
      });

      toast.success('Account created successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error('Google sign-in failed: ' + error.message);
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  
  const moveBack = () => {
    navigate(-1);
  }


  return (
    <div  style={{
      minHeight: "100dvh",
    }} className="register-interface">
      {loading && (
        <div
          className="spinner-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 9999,
          }}
        >
          <CircularProgress style={{ color: '#00CBCC' }} />
        </div>
      )}
 <div onClick={moveBack} className='bacck-arrow'>
          <img src={eclipse} alt="" />
          </div>
        
    <div className="main-section">
    <div className="featured-image-area">
      <img src={featured} alt="" />
    </div>
    <div className="form-input-area">
    <div className="color-area">
        Create Account
      </div>
     
 <p className="top-area">Already have an account? <a href="/login">signin</a></p>
<div className="signup-area">
<h1 className='this-text' style={{margin: '0px'}}>Create Account</h1>
<p className='this-text'  style={{margin: '0px'}}>Get started</p>

<form className='the-form-itself-register' onSubmit={handleEmailPasswordSignUp}>
  <div className="input-container">
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      placeholder="Username"
      required
    />
  </div>
  <div className="input-container">
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Email"
      required
    />
  </div>
  <div className="input-container">
    <input
      type="password"
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
      }}
      
      placeholder="Password"
      required
    />
   
  </div>
  <div className="input-container">
    <input
      type="password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      placeholder="Confirm Password"
      required
    />
  </div>
  <div className="input-container">
  <select value={role} onChange={(e) => setRole(e.target.value)} required>
    <option value="" disabled>Select Role</option>
    <option value="lecturer">Lecturer</option>
    <option value="student">Student</option>
  </select>
</div>

  <button className="btn-3" type="submit" disabled={loading}>
    Register
  </button>
</form>

<div className="navigation-area-and-the-rest">
<div className="or-aspect">
    <div className="line-in0r">y</div>
    continue with
    <div className="line-in0r">y</div>
  </div>
<div className="continue-with">
  <div>
  <img src={facebook} alt="" />
<p>Facebook</p>
  </div>

<div>
<img src={google} alt="google" onClick={handleGoogleSignUp}
    style={{ cursor: 'pointer' }}
  />
  <p>Google</p>
</div>
 
</div>

<p className="bottom-section-area-nav">Already have an account? <Link to={"/login"}>Sign in</Link></p>
</div>
</div>
<p className='terms-and-co'>Terms and Conditions</p>
    </div>
    </div>
    </div>
  );
};

export default Register;

