import React, { useState } from 'react';
import image from '../assets/mobile.svg';
import icon from '../assets/googleicon.svg';
import './login.css';
import {signInWithEmailAndPassword,GoogleAuthProvider,signInWithPopup,getAdditionalUserInfo,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CircularProgress } from '@mui/material';
import { getDoc, doc } from 'firebase/firestore';
import { db , auth} from '../../config/config'; // Make sure to import your firestore db

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        toast.error('Email not verified. Please verify your email to log in.');
        setIsLoading(false);
        return;
      }

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid)); // Assuming you store user data under "users" collection
      const userData = userDoc.data();
      
      if (userData?.role === 'lecturer') {
        navigate(`/lecturer/${userCredential.user.uid}`);
      } else if (userData?.role === 'student') {
        navigate(`/student/${userCredential.user.uid}`);
      } else {
        toast.error('Role not found!');
        navigate('/home');
      }

      toast.success('Login Successful!');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Error in sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const isNewUser = getAdditionalUserInfo(result).isNewUser;

      if (isNewUser) {
        toast.error('No account found with this Google email. Please sign up first.');
        navigate('/register'); // Redirect to signup page
        return;
      }

      const userDoc = await getDoc(doc(db, "users", result.user.uid)); // Assuming you store user data under "users" collection
      const userData = userDoc.data();

      if (userData?.role === 'lecturer') {
        navigate(`/lecturer/${result.user.uid}`);
      } else if (userData?.role === 'student') {
        navigate(`/student/${result.user.uid}`);
      } else {
        toast.error('Role not found!');
        navigate('/home');
      }

      toast.success('Login Successful!');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Google Sign-In Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-interface">
      {isLoading && (
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

      <div className="login-image">
        <img src={image} alt="Login Illustration" />
      </div>
      <h2>Welcome Back</h2>
      <p>Please log in to an existing account</p>
      <div className="login-form">
        <form onSubmit={handleEmailPasswordLogin}>
          <div className="input-container-login">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="input-container-login">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <p className="f-p">
            <a href="/forgot-password">Forgot password?</a>
          </p>
          <button className="btn-3-3" type="submit" disabled={isLoading}>
            Login
          </button>
        </form>
      </div>

      <div className="no-acc">
        <img
          src={icon}
          alt="Google icon"
          onClick={handleGoogleLogin}
          style={{ cursor: 'pointer', width: '40px', height: '40px' }} // Resize the icon here
        />
        <p className="p-3">
          Don't have an account? <span><a href="/register">Sign up</a></span>
        </p>
      </div>
    </div>
  );
};

export default Login;
