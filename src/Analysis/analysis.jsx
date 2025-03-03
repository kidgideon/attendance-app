import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { db } from "../../config/config"; 
import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../../resuable/navbar/navbar";
import Panel from "../../resuable/sidepanel/panel";
import { Line } from "react-chartjs-2";
import "./analysis.css";
import hamburger from "../../resuable/navbar/hamburger.svg";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  CategoryScale,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, Filler, CategoryScale);

// Fetch course data and attendance records
const fetchCourseData = async ({ queryKey }) => {
  const [, courseId, studentId] = queryKey;
  const courseRef = doc(db, "courses", courseId);
  const courseSnap = await getDoc(courseRef);
 
  if (!courseSnap.exists()) throw new Error("Course not found");

  const courseData = courseSnap.data();
  const sessions = courseData.sessions || [];

  let totalClasses = sessions.length;
  let totalAttended = sessions.filter(session => session.students.includes(studentId)).length;
  let totalAbsent = totalClasses - totalAttended;
  let percentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;

  return { totalClasses, totalAttended, totalAbsent, percentage: percentage.toFixed(1), sessions };
};

// Fetch student data
const fetchStudentData = async ({ queryKey }) => {
  const [, studentId] = queryKey;
  const userRef = doc(db, "users", studentId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

const Analysis = () => {
  const { courseId, studentId } = useParams();
   const [isNavbarOpen, setIsNavbarOpen] = useState(false); // Navbar toggle state
  

  // Fetch course and attendance data
  const { data: attendanceData, isLoading: isAttendanceLoading } = useQuery({
    queryKey: ["courseData", courseId, studentId],
    queryFn: fetchCourseData,
  });

  // Fetch student details
  const { data: studentData, isLoading: isStudentLoading } = useQuery({
    queryKey: ["studentData", studentId],
    queryFn: fetchStudentData,
  });

  const attendanceValues = attendanceData?.sessions?.map(session =>
    session.students.includes(studentId) ? 1 : 0
  ) || [];

  const graphData = {
    labels: attendanceValues.map((_, index) => index + 1),
    datasets: [
      {
        label: "Attendance",
        data: attendanceValues,
        borderColor: "#00CBCC",
        backgroundColor: "rgba(0, 203, 204, 0.3)",
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1.2,
        ticks: {
          stepSize: 1,
          callback: value => (value === 1 ? "Present" : "Absent"),
        },
      },
      x: { display: false },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: context => (context.raw === 1 ? "Present" : "Absent"),
        },
      },
    },
  };

   
  const toggleNavbar = () => {
    setIsNavbarOpen((prev) => !prev);
  };

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };


  return (
    <div>
      
       <img className="theHamburger" src={hamburger} alt="Menu" onClick={toggleNavbar} />
      <Navbar  isOpen={isNavbarOpen} />
      {isNavbarOpen && <div className="overlay"  onClick={closeNavbar}></div>}
      <div className="dashboard-area">

        <div className="student-details-panel">
          <div className="hyh">
            <h2>Student details</h2>
          </div>

          <div className="student-data-div">
            <div className="student-img-div">
              {isStudentLoading ? (
                <div className="skeleton skeleton-img"></div>
              ) : (
                <img
                  src={studentData?.profilePicture || "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media"}
                  alt="Student"
                />
              )}
            </div>

            <div className="actually-data">
              <h1>{isStudentLoading ? <div className="skeleton skeleton-text"></div> : `${studentData?.firstName} ${studentData?.lastName}`}</h1>
              <div className="data-divs">
                <div>
                  <p>Matric Number</p>
                  {isStudentLoading ? <div className="skeleton skeleton-text"></div> : <p className="val">{studentData?.matriculationNumber}</p>}
                </div>
                <div>
                  <p>Email</p>
                  {isStudentLoading ? <div className="skeleton skeleton-text"></div> : <p className="val">{studentData?.email}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="course-attendance-data" style={{ marginTop: "20px", justifyContent: "space-between" }}>
          <div className="main-ai-div" style={{ background: "rgb(238, 238, 238)" }}>
            <div className="icon-div green">
              <i className="fa-regular fa-user"></i>
            </div>
            <div className="atten-data-div">
              <h3>{attendanceData?.totalAttended}</h3>
              <p>Total Attended</p>
            </div>
          </div>

          <div className="main-ai-div" style={{ background: "rgb(238, 238, 238)" }}>
            <div className="icon-div purple">
              <i className="fa-solid fa-chart-simple"></i>
            </div>
            <div className="atten-data-div">
              <h3>{attendanceData?.totalClasses}</h3>
              <p>Total classes</p>
            </div>
          </div>

          <div className="main-ai-div" style={{ background: "rgb(238, 238, 238)" }}>
            <div className="icon-div red">
              <i className="fa-regular fa-circle-xmark"></i>
            </div>
            <div className="atten-data-div">
              <h3>{attendanceData?.totalAbsent}</h3>
              <p>Total Absent</p>
            </div>
          </div>
        </div>


        <div className="graphical-representation-area">
          <div className="graph-container">
            <div className="graph">
              {isAttendanceLoading ? <div className="skeleton skeleton-graph"></div> : <Line data={graphData} options={chartOptions} />}
            </div>

            <div className="percentage-circle">
              {isAttendanceLoading ? (
                <div className="skeleton skeleton-circle"></div>
              ) : (
                <div className="bold-percentage">
                  <div className="percent-area">
                    <svg width="150" height="150" viewBox="0 0 100 100" className="progress-circle">
                      <circle cx="50" cy="50" r="45" stroke="#e0e0e0" strokeWidth="10" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="#00CBCC"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray="283"
                        strokeDashoffset={`${283 - (attendanceData?.percentage / 100) * 283}`}
                        strokeLinecap="round"
                        className="progress-bar"
                      />
                    </svg>
                    <div className="progress-text">
                      <p className="actuall-text">{attendanceData?.percentage}%</p>
                      <p className="unreal-txt">Attendance</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Panel />
    </div>
  );
};

export default Analysis;
