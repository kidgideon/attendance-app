 import './navbar.css'
 import logo from '../navbar/logo.svg'
 import settings from '../navbar/settings.svg'
 import logouticon from './logout.svg'
 import history from './history.svg'
 import dashboard from './dashboard.svg'
 import courses from './courses.svg'
 import registerCourse from './register-courses.svg'
 const Navbar = () => {
    return(<div className="navbar">
  <div className="top-section-nav">
    <img src={logo} alt="" />
    <h2>Eclassify</h2>
  </div>
  <div className="middle-section-nav">
   <div className='container-div'>
    <div className='img-div'>
    <img src={dashboard} alt="" />
    </div>
    
    <p>Dashboard</p>
   </div>

   <div className='container-div'>
    <div className="img-div">
    <img src={courses} alt="" />
    </div>
    <p>Courses</p>
   </div>

   <div className='container-div'>
    <div className="img-div">
    <img src={registerCourse} alt="" />
    </div>
    <p>Register</p>
   </div>

   <div className='container-div'>
    <div className="img-div">
    <img src={history} alt="" />
    </div>
   
    <p>History</p>
   </div>

  </div >
  <div className="bottom-section-nav">
    <div className='container-div'>
        <div className="img-div">
        <img src={settings} alt="" />
        </div>
       
        <p>Settings</p>
    </div>

    <div className='container-div'>
        <div className="img-div">
        <img src={logouticon} alt="" />
        </div>
        <p>Logout</p>
    </div>
  </div>
    </div>)
}

export default Navbar;