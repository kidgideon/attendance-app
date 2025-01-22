import React, { useState } from 'react';
import image from '../assets/upated.svg';
import './register.css';
import { auth, db } from '../../config/config';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
} from 'firebase/auth';
import icon from '../assets/googleicon.svg';
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

  const handleRoleChange = (newRole) => {
    setRole((prevRole) => (prevRole === newRole ? '' : newRole));
  };

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

  return (
    <div className="register-interface">
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
          <CircularProgress style={{ color: '#D3A941' }} />
        </div>
      )}
      <div className="svg-area">
        <img src={image} alt="svg" />
        <h2>Create account</h2>
      </div>
      <div className="form-area">
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
          <div className="checkbox-container">
            <label>
              <input
                type="checkbox"
                checked={role === 'lecturer'}
                onChange={() => handleRoleChange('lecturer')}
              />
              Lecturer
            </label>
            <label>
              <input
                type="checkbox"
                checked={role === 'student'}
                onChange={() => handleRoleChange('student')}
              />
              Student
            </label>
          </div>
          <button className="btn-3" type="submit" disabled={loading}>
            Register
          </button>
        </form>
        <div className="continue-with">
          <img
            src={icon}
            alt="google"
            onClick={handleGoogleSignUp}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <div className="already-have-an-account">
          <p>
            Already have an account?
            <span>
              {' '}
              <a href="/login">Sign in</a>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
