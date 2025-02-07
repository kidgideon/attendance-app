import { motion } from "framer-motion";
import "./splash.css";
import logo from "../assets/logo.svg";

const Splash = () => {
  return (
    <div className="splashscreen-interface">
      <motion.img
        src={logo}
        alt="Eclassify Logo"
        className="splash-logo"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      />

      {/* Loading Bar */}
      <div className="loading-bar">
        <motion.div
          className="loading-bar-fill"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        />
      </div>

      <p style={{ color: "#00CBCC" }}>Eclassify</p>
    </div>
  );
};

export default Splash;
