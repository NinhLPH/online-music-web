import React from "react";
import "./Navbar.css";
import { FaBell, FaCog, FaUser } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <img
          src="https://a-v2.sndcdn.com/assets/images/sc-icons/ios-a62dfc8bdb.png"
          alt="Logo"
        />
      </div>

      {/* Menu */}
      <ul className="navbar-menu">
        <li>Home</li>
        <li>Library</li>
        <li>Favourite</li>
      </ul>

      {/* Search */}
      <div className="navbar-search">
        <input type="text" placeholder="Search" />
      </div>

      {/* Icons */}
      <div className="navbar-icons">
        <FaBell className="icon" />
        <FaCog className="icon" />
        <FaUser className="icon" />
      </div>
    </nav>
  );
}
