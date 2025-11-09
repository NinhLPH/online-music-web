import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaHistory } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState(
    JSON.parse(localStorage.getItem("searchHistory")) || []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  //  Lưu & phát event sang MainContent
  const triggerSearch = async (query, customResult = null) => {
    if (!query) return;

    const newHistory = [
      query,
      ...searchHistory.filter((item) => item !== query),
    ].slice(0, 5);

    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));

    if (!customResult) {
      setIsLoading(true);

      try {
        const [songsRes, artistsRes] = await Promise.all([
          axios.get("http://localhost:9000/songs"),
          axios.get("http://localhost:9000/artists"),
        ]);

        const q = query.toLowerCase();
        const matchedSongs = songsRes.data.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q)
        );
        const matchedArtists = artistsRes.data.filter((a) =>
          a.name.toLowerCase().includes(q)
        );

        customResult = {
          songs: matchedSongs,
          artists: matchedArtists,
        };
      } catch (err) {
        console.error(err);
      }

      setIsLoading(false);
    }

    window.dispatchEvent(
      new CustomEvent("searchSongs", {
        detail: {
          keyword: query,
          songs: customResult?.songs || [],
          artists: customResult?.artists || [],
        },
      })
    );
    setShowSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    triggerSearch(keyword);
  };

  //  Gợi ý khi nhập
  const handleInputChange = async (e) => {
    const text = e.target.value;
    setKeyword(text);

    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    const q = text.toLowerCase();

    const [songsRes, artistsRes, albumsRes] = await Promise.all([
      axios.get("http://localhost:9000/songs"),
      axios.get("http://localhost:9000/artists"),
      axios.get("http://localhost:9000/albums"),
    ]);

    const matchedSongs = songsRes.data
      .filter((s) => s.title.toLowerCase().includes(q))
      .map((s) => ({ type: "song", label: s.title, data: s }));

    const matchedArtists = artistsRes.data
      .filter((a) => a.name.toLowerCase().includes(q))
      .map((a) => ({ type: "artist", label: a.name, data: a }));

    const matchedAlbums = albumsRes.data
      .filter((al) => al.title.toLowerCase().includes(q))
      .map((al) => ({ type: "album", label: al.title, data: al }));

    setSuggestions([...matchedSongs, ...matchedArtists, ...matchedAlbums]);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (item) => {
    setKeyword(item.label);
    const result = {
      [`${item.type}s`]: [item.data],
    };
    triggerSearch(item.label, result);
  };

  //  Click ngoài dropdown → đóng
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg bg-dark navbar-dark px-3">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* Logo */}
        <div className="d-flex align-items-center">
          <img
            src="assets/logo/logo.png"
            alt="Logo"
            style={{
              height: "45px",
              width: "45px",
              cursor: "pointer",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #1db954",
            }}
            onClick={() => navigate("/home")}
          />
        </div>

        {/* Menu */}
        <ul className="navbar-nav d-flex flex-row mx-3">
          <li className="nav-item mx-2">
            <Link to="/home" className="nav-link text-white">
              Home
            </Link>
          </li>
          <li className="nav-item mx-2">
            <Link to="/liked" className="nav-link text-white">
              Favourite
            </Link>
          </li>
        </ul>

        {/* Search */}
        <div className="position-relative flex-grow-1 mx-3" ref={dropdownRef}>
          <form
            onSubmit={handleSearch}
            className="d-flex align-items-center"
            style={{ maxWidth: "600px" }}
          >
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
                value={keyword}
                onChange={handleInputChange}
                onFocus={() => keyword && setShowSuggestions(true)}
              />
              <button className="btn btn-success" type="submit" disabled={isLoading}>
                <FaSearch />
              </button>
            </div>
          </form>

          {/*  Suggestions UI */}
          {showSuggestions && (
            <div
              className="bg-dark text-white p-2 mt-1 rounded"
              style={{
                position: "absolute",
                width: "100%",
                maxHeight: "250px",
                overflowY: "auto",
                zIndex: 99,
                border: "1px solid #444",
              }}
            >
              {suggestions.length > 0 ? (
                suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-2 px-2 suggestion-item"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSuggestionClick(item)}
                  >
                    🔍 {item.label} <small>({item.type})</small>
                  </div>
                ))
              ) : (
                <p className="text-secondary px-2 m-0">Không có kết quả...</p>
              )}

              {/*  Search History */}
              {searchHistory.length > 0 && (
                <div className="mt-2 border-top pt-2">
                  <strong>
                    <FaHistory className="me-2" /> Lịch sử tìm kiếm:
                  </strong>
                  {searchHistory.map((h, i) => (
                    <div
                      key={i}
                      className="py-1 ps-2 text-secondary"
                      style={{ cursor: "pointer" }}
                      onClick={() => triggerSearch(h)}
                    >
                      🕒 {h}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/*  User info */}
        <div>
          {currentUser ? (
            <div className="d-flex align-items-center">
              
              {/*  GO PREMIUM BUTTON */}
             {!(
                currentUser?.subscription?.tier === "premium" &&
                currentUser?.subscription?.status === "active"
              ) && (

                <button
                  className="btn btn-warning btn-sm me-3"
                  onClick={() => {
                    if (!currentUser) return navigate("/login");
                    navigate("/upgrade");
                  }}
                >
                  Go Premium
                </button>
              )}

              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="rounded-circle me-2"
                style={{ width: "40px", height: "40px" }}
              />

              <div
                className="d-flex flex-column me-3"
                style={{ lineHeight: 1.1 }}
              >
                <span>
                  Chào, <strong>{currentUser.username}</strong>
                </span>

                {/* Premium badge */}
                {currentUser.subscription?.tier === "premium" &&
                  currentUser.subscription?.status === "active" && (
                    <span
                      style={{
                        background: "linear-gradient(45deg, gold, #ffb300)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        color: "#000",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        marginTop: "2px",
                        textAlign: "center",
                      }}
                    >
                      ⭐ PREMIUM
                    </span>
                  )}
              </div>

              <button
                className="btn btn-sm btn-outline-light"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-light">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
