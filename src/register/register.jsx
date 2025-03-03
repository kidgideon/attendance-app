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
import { useNavigate } from 'react-router-dom';
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


  const checkUsernameAndEmail = async () => {
    const emailRef = await getDoc(doc(db, 'users', email));

    if (emailRef.exists()) {
      toast.error('Email is already in use');
      return false;
    }

    return true;
  };

  const checkPasswordStrength = (password) => {
    const strengthRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    setPasswordStrength(strengthRegex.test(password) ? 'Strong password' : 'Weak password');
  };

  const handleEmailPasswordSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!await checkUsernameAndEmail()) return;

    setLoading(true); // Show spinner

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Default profile picture
      const defaultProfilePic = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

      // Save user details in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        role,
        uid: user.uid,
        profilePicture: defaultProfilePic,
        isEmailVerified: false,
      });

      // Send email verification
      await sendEmailVerification(user);

      toast.success('Account created successfully! Check your email for verification.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error('Registration failed: ' + error.message);
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
        color
      </div>
      <p className="top-area">Already have an account? <a href="/login">signin</a></p>
<div className="signup-area">
<h1 style={{margin: '0px'}}>Create Account</h1>
<p style={{margin: '0px'}}>Get started</p>

<form onSubmit={handleEmailPasswordSignUp}>
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
        checkPasswordStrength(e.target.value);
      }}
      placeholder="Password"
      required
    />
    <div>
      {passwordStrength && (
        <small>{passwordStrength === 'Strong password' ? <span  style={{color: "green"}}>strong</span> : <span  style={{color: "red"}}>weak password</span> }</small>
      )}
    </div>
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

  <button style={{margin: '10px'}} className="btn-3" type="submit" disabled={loading}>
    Register
  </button>
</form>

  <div className="or-aspect">
    <div className="line-in0r">y</div>
    continue with
    <div className="line-in0r">y</div>
  </div>
<div  style={{margin: '10px'}} className="continue-with">
  <div>
  <img src={facebook} alt="" />
<p>Facebook</p>
  </div>

<div>
<img src={google} alt="google" 
    style={{ cursor: 'pointer' }}
  />
  <p>Google</p>
</div>
 
</div>

<p className="bottom-section-area-nav">Already have an account? <a href="/login">signin</a></p>
</div>
<p className='terms-and-co'>Terms and Conditions</p>
    </div>
    </div>
    </div>
  );
};

export default Register;


