import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../config/config"; // Adjust if necessary
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../../resuable/navbar/navbar";
import Panel from "../../resuable/sidepanel/panel";
import { Line } from "react-chartjs-2";
import './analysis.css'
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

const Analysis = () => {
  const { courseId, studentId } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null); // Initially null to track loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const courseData = courseSnap.data();
          const sessions = courseData.sessions || [];

          let totalClasses = sessions.length;
          let totalAttended = sessions.filter(session => session.students.includes(studentId)).length;
          let totalAbsent = totalClasses - totalAttended;
          let percentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;

          setAttendanceData({
            totalClasses,
            totalAttended,
            totalAbsent,
            percentage: percentage.toFixed(1),
            sessions,
          });
        }

        // Fetch student details from "users" collection
        const userRef = doc(db, "users", studentId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setStudentData(userSnap.data());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [courseId, studentId]);

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

  return (
    <div>
      <Navbar />
      <div className="dashboard-area">
        <div className="student-details-panel">
          <div className="hyh">
            <h2>Student details</h2>
          </div>

          <div className="student-data-div">
            <div className="student-img-div">
              {studentData ? (
                <img
                  src={studentData.profilePicture || "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media"}
                  alt="Student"
                />
              ) : (
                <div className="skeleton skeleton-img"></div>
              )}
            </div>

            <div className="actually-data">
              <h1>{studentData ? `${studentData.firstName} ${studentData.lastName}` : <div className="skeleton skeleton-text"></div>}</h1>
              <div className="data-divs">
                <div>
                  <p>Matric Number</p>
                  {studentData ? <p className="val">{studentData.matriculationNumber}</p> : <div className="skeleton skeleton-text"></div>}
                </div>
                <div>
                  <p>Email</p>
                  {studentData ? <p className="val">{studentData.email}</p> : <div className="skeleton skeleton-text"></div>}
                </div>
              </div>
            </div>
          </div>

          <div className="course-attendance-data">
  <div className="main-ai-div">
    <div className="icon-div green">
      <i className="fa-regular fa-user"></i>
    </div>
    <div className="atten-data-div">
      <h3>{attendanceData?.totalAttended ?? 0} classes</h3>
      <p>Total attendance</p>
    </div>
  </div>

  <div className="main-ai-div">
    <div className="icon-div purple">
      <i className="fa-solid fa-chart-simple"></i>
    </div>
    <div className="atten-data-div">
      <h3>{attendanceData?.totalClasses ?? 0} classes</h3>
      <p>Total classes</p>
    </div>
  </div>

  <div className="main-ai-div">
    <div className="icon-div red">
      <i className="fa-regular fa-circle-xmark"></i>
    </div>
    <div className="atten-data-div">
      <h3>{attendanceData?.totalAbsent ?? 0} classes</h3>
      <p>Total absent</p>
    </div>
  </div>
</div>


        </div>

        <div className="graphical-representation-area">
          <div className="graph-container">
            <div className="graph">
              {attendanceData ? (
                <Line data={graphData} options={chartOptions} />
              ) : (
                <div className="skeleton skeleton-graph"></div>
              )}
            </div>

            <div className="percentage-circle">
              {attendanceData ? (
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
                        strokeDashoffset={`${283 - (attendanceData.percentage / 100) * 283}`}
                        strokeLinecap="round"
                        className="progress-bar"
                      />
                    </svg>
                    <div className="progress-text">
                      <p className="actuall-text">{attendanceData.percentage}%</p>
                      <p className="unreal-txt">Attendance</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="skeleton skeleton-circle"></div>
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
