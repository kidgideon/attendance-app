import React, { useState } from 'react';
import forget from '../assets/forget.svg';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-hot-toast'; // Import react-toastify
import { auth, db } from '../../config/config'; // Import your Firebase config
import { sendPasswordResetEmail } from 'firebase/auth'; // Firebase method for password reset
import { collection, query, where, getDocs } from 'firebase/firestore'; // Correct Firestore imports
import './password.css';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      // Check if email exists in Firestore
      const emailExists = await checkIfEmailExists(email);
      if (!emailExists) {
        toast.error('No account found with this email address.');
        return;
      }

      // Send password reset email using Firebase Authentication
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent successfully!');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check if the email exists in Firestore
  const checkIfEmailExists = async (email) => {
    try {
      const usersCollectionRef = collection(db, 'users');
      const q = query(usersCollectionRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      // If the query returns any documents, the email exists
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email:', error);
      toast.error('An error occurred while checking the email.');
      return false;
    }
  };

  return (
    <div className="forget-password-interface">
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
      <h1>Forgot Password</h1>
      <div className='f-m'>
        <img src={forget} alt="Forget Password" />
      </div>
      <h3>Kindly enter your email address</h3>
      <div className='f-i'>
        <input
          type="text"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handlePasswordReset}>Submit</button>
      </div>
    </div>
  );
};

export default ForgetPassword;
