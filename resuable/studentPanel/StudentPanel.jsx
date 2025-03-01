import React, { useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";

import design from "./design.svg";
import defaultDp from "./defaultdp.svg";

const auth = getAuth();
const db = getFirestore();

const fetchStudentData = async (userId) => {
  if (!userId) throw new Error("No user ID provided");

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    throw new Error("User not found");
  }
};

const StudentPanel = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [user, setUser] = useState(null);

  // Track authenticated user
  useState(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  // Fetch student data using React Query
  const { data: student, isLoading, isError } = useQuery({
    queryKey: ["studentData", user?.uid],
    queryFn: () => fetchStudentData(user?.uid),
    enabled: !!user?.uid, // Prevents fetching if no user is logged in
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
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
            key={cloneDay}
            className={`calendar-cell ${
              !isSameMonth(day, monthStart) ? "disabled" : ""
            } ${isSameDay(day, selectedDate) ? "selected" : ""} ${
              isToday(day) ? "today" : ""
            }`}
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

  return (
    <div className="panel">
      <div className="top-section-panel">
        {isLoading ? (
          <p className="loading-text">Loading...</p>
        ) : isError ? (
          <p className="error-text">Failed to load user data</p>
        ) : (
          <>
            <div className="user-image">
              <img src={student?.profilePicture || defaultDp} alt="Profile" />
            </div>
            <p className="lecturer-name">
              {student?.firstName || "Unknown"} {student?.lastName || ""}
            </p>
            <p className="lecturer-role">{student?.role || "Student"}</p>
          </>
        )}
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

export default StudentPanel;
