import React, { useState } from 'react';
import facebook from './facebook.svg';
import featured from './feautured.svg';
import google from './google.svg'
import eclipse from './Vector.svg'
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
  const [isLoading, setIsLoading] = useState(false); // 
  // Loading state
  
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
  
      // Fetch user role and profile details from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.data();
  
      if (!userData) {
        toast.error("User data not found.");
        navigate("/home");
        return;
      }
  
      // Lecturer Profile Check
      if (userData.role === "lecturer") {
        if (!userData.firstName || !userData.lastName) {
          navigate(`/lecturer/complete-profile/${userCredential.user.uid}`);
        } else {
          navigate(`/lecturer/${userCredential.user.uid}`);
        }
      }
      // Student Profile Check
      else if (userData.role === "student") {
        if (!userData.firstName || !userData.lastName || !userData.matriculationNumber) {
          navigate(`/student/complete-profile/${userCredential.user.uid}`);
        } else {
          navigate(`/student/${userCredential.user.uid}`);
        }
      } else {
        toast.error("Role not found!");
        navigate("/home");
      }
  
      toast.success("Login Successful!");
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Error in sign-in");
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
        toast.error("No account found with this Google email. Please sign up first.");
        navigate("/register"); // Redirect to signup page
        return;
      }
  
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      const userData = userDoc.data();
  
      if (!userData) {
        toast.error("User data not found.");
        navigate("/home");
        return;
      }
  
      // Lecturer Profile Check
      if (userData.role === "lecturer") {
        if (!userData.firstName || !userData.lastName) {
          navigate(`/lecturer/complete-profile/${result.user.uid}`);
        } else {
          navigate(`/lecturer/${result.user.uid}`);
        }
      }
      // Student Profile Check
      else if (userData.role === "student") {
        if (!userData.firstName || !userData.lastName || !userData.matriculationNumber) {
          navigate(`/student/complete-profile/${result.user.uid}`);
        } else {
          navigate(`/student/${result.user.uid}`);
        }
      } else {
        toast.error("Role not found!");
        navigate("/home");
      }
  
      toast.success("Login Successful!");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Google Sign-In Failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  const moveBack = () => {
    navigate(-1);
  }

   return (
     <div  style={{
          minHeight: "100dvh",
        }} className="register-interface">
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
          <p className="top-area">Don't have an account? <a href="/register">signup</a></p>
    <div className="signup-area">
    <h1>Hi There!</h1>
    <p>Welcome to eClassify</p>
    
    <form onSubmit={handleEmailPasswordLogin}>
      
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
      </div>
      <button className="btn-3" type="submit" disabled={isLoading}>
        Sign in
      </button>
    </form>

    <div className="or-aspect">
    <div className="line-in0r">y</div>
    continue withhttps://www.figma.com/design/DPiUsr023ju4JDrPHIxNYu/eclassify?node-id=0-1&m=dev&t=UPdirNpqj2ZEbj3o-1
    <div className="line-in0r">y</div>
  </div>
    <div className="continue-with">
      <div>
      <img src={facebook} alt="" />
    <p>Facebook</p>
      </div>
    
    <div>
    <img src={google} alt="google" onClick={handleGoogleLogin}
        style={{ cursor: 'pointer' }}
      />
      <p>Google</p>
    </div>
     
    </div>

    <p className="bottom-section-area-nav">Don't have an account? <a href="/register">signup</a></p>
    </div>
    <p className='terms-and-co'>Terms and Conditions</p>
        </div>
        </div>
        </div>
   );
};

export default Login;
