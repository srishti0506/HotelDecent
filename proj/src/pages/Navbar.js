import React from 'react'
import { NavLink } from 'react-router-dom';
import './css/Navbar.css';


const Navbar = ()=>{
  return(
    <>
   
    <div className='headingX'>
    <div>
      <nav className="navbar navbar-expand-lg bg-light navbar-custom">
        <div className="container-fluid">
          <NavLink exact to="/home">
            <a className="navbar-brand siri1">Hotel Decent</a>
          </NavLink>
          <button className="navbar-toggler " type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav siri">
              <NavLink exact to="/home">
                <a className="nav-link siri1">Home</a>
              </NavLink>
              <NavLink exact to="/newroom">
                <a className="nav-link siri1">Bookings</a>
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      </div>
    </div>
    </>
  )
}



export default Navbar;
