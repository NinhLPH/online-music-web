import React from "react";
import { FaBell, FaCog, FaUser } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-dark navbar-dark px-3">
      <div className="container-fluid d-flex align-items-center justify-content-between">

        {/* Logo */}
        <div className="d-flex align-items-center">
          <img
            src="https://a-v2.sndcdn.com/assets/images/sc-icons/ios-a62dfc8bdb.png"
            alt="Logo"
            style={{ height: "40px" }}
          />
        </div>

        {/* Menu */}
        <ul className="navbar-nav d-flex flex-row mx-3">
          <li className="nav-item mx-2">
            <a href="#" className="nav-link text-white">Home</a>
          </li>
          <li className="nav-item mx-2">
            <a href="#" className="nav-link text-white">Library</a>
          </li>
          <li className="nav-item mx-2">
            <a href="#" className="nav-link text-white">Favourite</a>
          </li>
        </ul>

        {/* Search */}
        <div className="flex-grow-1 mx-3" style={{ maxWidth: "800px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search"
          />
        </div>

        {/* Icons */}
        <div className="d-flex align-items-center text-white">
          <FaBell className="mx-2 fs-5" />
          <FaCog className="mx-2 fs-5" />
          <FaUser className="mx-2 fs-5" />
        </div>
      </div>
    </nav>
  );
}
