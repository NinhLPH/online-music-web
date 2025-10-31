import React, { useState } from "react";
import { FaBell, FaCog, FaUser, FaSearch } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

/**

Header có ô tìm kiếm bài hát theo từ khóa.

Kết quả được gửi đến MainContent qua CustomEvent("searchSongs").
*/
export default function Header() {
const { currentUser, logout } = useAuth();
const navigate = useNavigate();
const [keyword, setKeyword] = useState("");
const [isLoading, setIsLoading] = useState(false);

const handleLogout = () => {
logout();
navigate("/home");
};

// 🔍 Hàm tìm kiếm
const handleSearch = async (e) => {
e.preventDefault();
const query = keyword.trim();
if (!query) return;

setIsLoading(true);
try {
  const res = await axios.get("http://localhost:9000/songs");
  const allSongs = res.data || [];
  const results = allSongs.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.description?.toLowerCase().includes(query.toLowerCase())
  );

  // Gửi kết quả sang MainContent
  window.dispatchEvent(new CustomEvent("searchSongs", { detail: results }));
} catch (err) {
  console.error("Lỗi khi tìm kiếm bài hát:", err);
} finally {
  setIsLoading(false);
}


};

return (
<nav className="navbar navbar-expand-lg bg-dark navbar-dark px-3">
<div className="container-fluid d-flex align-items-center justify-content-between">
{/* Logo */}
<div className="d-flex align-items-center">
<img
src="https://a-v2.sndcdn.com/assets/images/sc-icons/ios-a62dfc8bdb.png
"
alt="Logo"
style={{ height: "40px", cursor: "pointer" }}
onClick={() => window.location.reload()}
/>
</div>

    {/* Menu */}
    <ul className="navbar-nav d-flex flex-row mx-3">
      <li className="nav-item mx-2">
        <a href="#" className="nav-link text-white">
          Home
        </a>
      </li>
      <li className="nav-item mx-2">
        <a href="#" className="nav-link text-white">
          Library
        </a>
      </li>
      <li className="nav-item mx-2">
        <a href="#" className="nav-link text-white">
          Favourite
        </a>
      </li>
    </ul>

    {/* Search */}
    <form
      onSubmit={handleSearch}
      className="d-flex align-items-center flex-grow-1 mx-3"
      style={{ maxWidth: "600px" }}
    >
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm bài hát..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          className="btn btn-success"
          type="submit"
          disabled={isLoading}
        >
          <FaSearch />
        </button>
      </div>
    </form>

    {/* Icons */}
    <div className="d-flex align-items-center text-white">
      <FaBell className="mx-2 fs-5" />
      <FaCog className="mx-2 fs-5" />
      <FaUser className="mx-2 fs-5" />
    </div>

    {/* User info */}
    <div>
      {currentUser ? (
        <div className="d-flex align-items-center">
          <img
            src={currentUser.avatar}
            alt={currentUser.username}
            className="rounded-circle me-2"
            style={{ width: "40px", height: "40px" }}
          />
          <span className="me-3">Chào, {currentUser.username}</span>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      ) : (
        <div>
          <Link to="/login" className="btn btn-light">
            Đăng nhập
          </Link>
        </div>
      )}
    </div>
  </div>
</nav>


);
}