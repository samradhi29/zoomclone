import React from 'react';
import "../App.css";
import { Link } from 'react-router-dom';

export default function Landingpage() {
  return (
    <div className='landingpagecontainer'>
      <nav>
        <div className='maindiv'>
          <div className='elem1'>
            <h2>samradhi's video call app</h2>
          </div>
          <div className='elem2'>
            <Link to={"/auth"}>
              <div><button className="auth-button">Register</button></div>
            </Link>
            <Link to={"/auth"}>
              <div><button className="auth-button">Login</button></div>
            </Link>
          </div>
        </div>
      </nav>

      <div className="landingmaincontainer">
        <div className="landing-text">
          <h1><span className="highlight-connect">Connect</span> with loved ones</h1>
          <p>Cover the distance by a video call</p>
          <Link to={"/auth"}>
            <button className="get-started-button">Get Started</button>
          </Link>
        </div>
        <div>
          <img className='demoimg' src="/video.png" alt="demo" />
        </div>
      </div>
    </div>
  );
}
