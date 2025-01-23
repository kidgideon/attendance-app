import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Router>
      {/* Add Toaster for notifications */}
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/unboarding" element={<Unboarding />} />
        <Route path="/student/:uid" element={<Student />} />
        <Route path="/lecturer/:uid" element={<Lecturer />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/upload/:uid" element={<Upload />} />
        <Route path="/course/:id" element={<Course />} />
        <Route path="/session/:id" element={<Session />} />
      </Routes>
    </Router>
  );
}

export default App;
