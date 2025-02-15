import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

import design from "./design.svg";
import defaultDp from "./defaultdp.svg"; 

const StudentPanel = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [student, setStudent] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  // Fetch student data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setStudent(userSnap.data());
        } else {
          console.log("User not found in Firestore");
        }
      } else {
        setStudent(null);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

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
          <div key={index} className="calendar-day">{day}</div>
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
        <div key={day} className="calendar-row">{days}</div>
      );
    }
    return <div className="calendar-grid">{rows}</div>;
  };

  return (
    <div className="panel">
      <div className="top-section-panel">
        <div className="user-image">
          <img src={student?.profilePicture || defaultDp} alt="Profile" />
        </div>
        <p className="lecturer-name">{student?.firstName || "Loading..."} {student?.lastName || "Loading..."}</p>
        <p className="lecturer-role">{student?.role || "Student"}</p>
        <button>Profile</button>
      </div>

      <div className="middle-section-panel">
        <div className="calendar-container">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>
      </div>

      <div className="bottom-section-panel">
        <img src={design} alt="" />
      </div>
    </div>
  );
};

export default StudentPanel;
