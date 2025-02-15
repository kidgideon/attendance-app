import { useEffect, useState } from 'react';
import { auth, db } from '../../config/config'; // Ensure correct import path
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './welcome.css';
import imageI from './img.svg';

const WelcomeDiv = () => {
    const [user, setUser] = useState({ firstName: '', lastName: '' });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setUser({ firstName: userData.firstName, lastName: userData.lastName });
                }
            }
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    return (
        <div className="welcome-div">
            <img src={imageI} alt="Classroom" className="welcome-image" />
            <div className="left-area">
                <h1>
                    <span className="highlight">Hello,</span> {user.firstName} {user.lastName}
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
