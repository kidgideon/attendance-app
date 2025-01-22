import './unboarding.css'
import image from '../assets/unboarding.jpg';

const Unboarding = () => {
    return(
    <div className="unboarding-interface">
        <div className="top-area">
<img src={image} alt="" />
        </div>
        <div className="bottom-area">
            <div className='bottom-area-top'>
            <h1>
                Welcome to <br /> your web <br /> tracker
            </h1>
            </div>
            <div className="bottom-area-bottom">
            <button className='btn-1'>Create an account</button>   
            <button className='btn-2'> Already have an account</button>        
            </div>  
        </div>
    </div>)
}

export default Unboarding;