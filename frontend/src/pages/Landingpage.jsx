import React from 'react'
import "../App.css";
import { Link } from 'react-router-dom';
export default function Landingpage() {
  return (
    <>
    <div className='landingpagecontainer'>

   <nav>
    <div className='maindiv'>
        <div className='elem1'> <h2> samradhi's video call app</h2></div>
        <div className='elem2'>
            <div>join as guest</div>
            <div>Register</div>
            <div><button>login</button></div>
        </div>
    </div>
   </nav>
    

    <div className="landingmaincontainer">
<div><h1><span style={{color :"red"}}>connect </span>with loved ones </h1>
<p>cover a distance by a video call</p>
<div>
 <Link to={"/auth"}>get srart</Link>
</div>
</div>
<div>
<img  className= 'demoimg' src="/video.png" alt="" />

</div>

</div>
    </div>
    </>
  )
}
