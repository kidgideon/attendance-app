import './session.css'
import { Link } from 'react-router-dom';

const Session = () => {
    return(<div className='session-interface'>
        <div className="session-top-interface">
<p>session name</p>
<button>end Session</button>
        </div>
<div className="inactive-ative-area">
    <div className="green-dot">
    </div>
    <p>Active</p>
</div>
<div className="session-code-area">
    <h1>code</h1>
    <p>share with your students</p>
</div>
<div className="direction-partcipants">
    <h3>session-participanst(4)</h3>
    <i class="fa-solid fa-print"></i>
</div>
<div className="participants">
</div>

<div className="footer-l-d">
             <span>
               <i className="fa-solid fa-house"></i>
               home
             </span>
             <Link to={`/upload`}>
               <div className='c-s-c-t'>
                 <i className="fa-solid fa-plus"></i>
               </div>
             </Link>
             <span>
               <i className="fa-solid fa-gear"></i>
               settings
             </span>
           </div>

        </div>)
}

export default Session;