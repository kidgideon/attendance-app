import React, { useState } from "react";
import "./panel.css";
import design from "./design.svg";
import dp from "./defaultdp.svg";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { 
  format, startOfMonth, endOfMonth, startOfWeek, addDays, 
  isSameMonth, isSameDay, isToday, addMonths, subMonths 
} from "date-fns";
import { IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const auth = getAuth();
const db = getFirestore();

const fetchUserData = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      unsubscribe();
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          resolve(userSnap.exists() ? userSnap.data() : null);
        } catch (error) {
          console.error("Error fetching user data:", error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

const Panel = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: user, isLoading } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    staleTime: 1200000, // 20 minutes
    cacheTime: 1200000, // 20 minutes
  });

  const renderHeader = () => (
    <div className="calendar-header">
      <IconButton size="small" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
        <ArrowBackIos fontSize="small" />
      </IconButton>
      <span className="calendar-month">{format(currentDate, "MMMM yyyy")}</span>
      <IconButton size="small" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
        <ArrowForwardIos fontSize="small" />
      </IconButton>
    </div>
  );

  const renderDays = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return (
      <div className="calendar-days">
        {days.map((day, index) => (
          <div key={index} className="calendar-day">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });

    let day = startDate;
    const rows = [];

    while (day <= monthEnd) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        days.push(
          <div
            key={day}
            className={`calendar-cell ${
              !isSameMonth(day, monthStart) ? "disabled" : ""
            } ${isSameDay(day, selectedDate) ? "selected" : ""} ${isToday(day) ? "today" : ""}`}
            onClick={() => setSelectedDate(cloneDay)}
          >
            {format(day, "d")}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="calendar-row">
          {days}
        </div>
      );
    }
    return <div className="calendar-grid">{rows}</div>;
  };

  if (isLoading) {
    return <div className="panel">Loading...</div>;
  }

  return (
    <div className="panel">
      <div className="top-section-panel">
        <div className="user-image">
          <img src={user?.profilePicture || dp} alt="Profile" />
        </div>
        <p className="lecturer-name">{user?.lastName || "Unknown"} {user?.firstName || "User"}</p>
        <p className="lecturer-role">{user?.role || "Lecturer"}</p>
      </div>

      <div className="middle-section-panel">
        <div className="calendar-container">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>
      </div>

      <div className="bottom-section-panel">
        <img src={design} alt="Design" />
      </div>
    </div>
  );
};

export default Panel;
