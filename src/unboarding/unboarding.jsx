import './unboarding.css'
import pattern from './pattern.svg'
import Logo from './Logo.svg'
import how from './how-it-works.svg'
const Unboarding = () => {
    return(
    <div className="unboarding-interface">
        <div style={{
              backgroundImage: `url(${pattern})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}  className="unboarding-top-interface">
            <div className="top-alignment-unboarding">
<img src={Logo} alt="" />
<div className="end-div">
    <button>Create account</button>
    <button>Log in</button>
</div>
            </div>

            <div className="site-direction">
    <div className="f-a">
        <h1>E-classify-Smart <br /> Attendance, Smarter <br /> Education</h1>
        <p>Track your Attendance effortlessly, stay <br /> updated and manage your classes with ease</p>
    </div>
    <div className='s-a'>
  <img src={how} alt="" />
    </div>
</div>
        </div>

    </div>)
}

export default Unboarding;