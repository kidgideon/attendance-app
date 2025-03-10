import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./login/login";
import Register from "./register/register";
import Splash from "./splash/splash";
import Unboarding from "./unboarding/unboarding";
import Student from "./student-dashboard/sdashboad";
import Lecturer from "./lecturer-dashboard/ldashboad";
import ForgetPassword from "./forgetPassword/password";
import Upload from "./upload/upload";
import Course from "./course-area/course";
import Session from "./session/session";
import ProtectedRoute from "./protected-route/route";
import LecturerCompleteProfile from "./lecturer-complete-profile/lProfile";
import CompleteProfileStudent from "./student-complete-profile/cProfile";
import CoursesPage from "./lecturer-dashboard/CoursesPage/CoursesPage";
import LecturerHistory from "./lecturer-dashboard/History/history";
import CourseRegister from "./lecturer-dashboard/register-courses/enroll";
import Analysis from "./Analysis/analysis";
import StudentCourse from "./student-dashboard/courses/scourse";
import Studenthistory from "./student-dashboard/student-history/student-history";
import StudentAnalysis from "./student-dashboard/student-analysis/studentanalysis";
import LecturerSetting from "./lecturer-settings.jsx/lsettings";
import Settings from "./studentSettings/setting";

// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* Add Toaster for notifications */}
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/" element={<ProtectedRoute> <Unboarding /></ProtectedRoute>} />
          <Route path="/student/:uid" element={<Student />} />
          <Route path="/lecturer/:uid" element={<Lecturer />} />
          <Route path="/register-course/:uid" element={<CourseRegister />} />
          <Route path="/course-history/:uid" element={<LecturerHistory />} />
          <Route path="/courses/:uid" element={<CoursesPage />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/upload/:uid" element={<Upload />} />
          <Route path="/course/:id" element={<Course />} />
          <Route path="/Unboarding" element={<Unboarding />} />
          <Route path="/session/:courseId/:sessionId" element={<Session />} />
          <Route path="/student/complete-profile/:uid" element={<CompleteProfileStudent />} />
          <Route path="/lecturer/complete-profile/:uid" element={<LecturerCompleteProfile />} />
          <Route path="/analysis/:courseId/:studentId" element={<Analysis />} />
          <Route path="/student/courses/:studentId" element={<StudentCourse />} />
          <Route path="/student/history/:studentId" element={<Studenthistory />} />
          <Route path="/student/analysis/:courseId/:studentId" element={<StudentAnalysis />} />
          <Route path="/settings/lecturer/:lecturerId" element={<LecturerSetting />} />
          <Route path="/settings/student/:studentId" element={<Settings />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
