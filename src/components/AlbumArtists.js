import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaPlus, FaCheck } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

function AlbumArtists() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Fetch artist & songs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const artistRes = await axios.get(`http://localhost:9000/artists/${id}`);
        setArtist(artistRes.data);

        const songsRes = await axios.get(`http://localhost:9000/songs?artistId=${id}`);
        setSongs(songsRes.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };
    fetchData();
  }, [id]);

  // Fetch favorite songs
  useEffect(() => {
    if (!currentUser) return;
    const fetchFavorites = async () => {
      try {
        const res = await axios.get(`http://localhost:9000/users/${currentUser.id}`);
        setFavorites(res.data.favorites || []);
      } catch (err) {
        console.error("Lỗi tải danh sách yêu thích:", err);
      }
    };
    fetchFavorites();
  }, [currentUser]);

  // Sync favorites in entire app
  useEffect(() => {
    const handleUpdate = (e) => setFavorites(e.detail);
    window.addEventListener("favoritesUpdated", handleUpdate);
    return () => window.removeEventListener("favoritesUpdated", handleUpdate);
  }, []);

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const toggleFavorite = async (song) => {
    if (!currentUser) return;

    try {
      const res = await axios.get(`http://localhost:9000/users/${currentUser.id}`);
      const user = res.data;

      const normalizedFavs = (user.favorites || []).map(Number);
      const songId = Number(song.id);
      const isFav = normalizedFavs.includes(songId);

      const updated = isFav
        ? normalizedFavs.filter((id) => id !== songId)
        : [...normalizedFavs, songId];

      await axios.patch(`http://localhost:9000/users/${currentUser.id}`, {
        favorites: updated,
      });

      setFavorites(updated.map(Number));
      window.dispatchEvent(
        new CustomEvent("favoritesUpdated", { detail: updated.map(Number) })
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật yêu thích:", err);
    }
  };

  if (!artist)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-light bg-dark">
        <div className="spinner-border text-success me-2" />
        <span>Đang tải...</span>
      </div>
    );

  return (
    <div
      className="bg-dark text-light"
      style={{
        height: "calc(100vh - 160px)",
        overflowY: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style>{`::-webkit-scrollbar { display: none; }`}</style>

      {/* Artist Banner */}
      <div
        className="position-relative"
        style={{
          height: "400px",
          backgroundImage: `url(${artist.coverImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="position-absolute bottom-0 start-0 w-100 p-4"
          style={{
            background: "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
          }}
        >
          <h1 className="display-3 fw-bold">{artist.name}</h1>
          <p className="text-secondary mt-2">{artist.description}</p>
        </div>
      </div>

      {/* Song List */}
      <div className="container mt-4 pb-5">
        <h4 className="fw-bold mb-3">Bài hát</h4>

        <div className="list-group list-group-flush">
          {songs.map((song, index) => {
            const isFavorite = favorites.map(Number).includes(Number(song.id));

            return (
              <div
                key={song.id}
                className="list-group-item bg-transparent text-light d-flex align-items-center py-2 border-0 border-bottom border-secondary"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/song/${song.id}`)}
              >
                {/* LEFT */}
                <div className="d-flex align-items-center flex-grow-1" style={{ gap: "12px" }}>
                  <span className="text-secondary small" style={{ width: "20px" }}>
                    {index + 1}
                  </span>

                  <img
                    src={`https://picsum.photos/seed/${song.id}/200`}
                    alt={song.title}
                    className="rounded"
                    style={{
                      width: "45px",
                      height: "45px",
                      objectFit: "cover",
                    }}
                  />

                  <div>
                    <div className="fw-semibold text-light">{song.title}</div>
                    <div className="text-secondary small">{song.genre}</div>
                  </div>
                </div>

                {/* RIGHT */}
                <div
                  className="d-flex align-items-center"
                  style={{
                    gap: "20px",
                    minWidth: "220px",
                    justifyContent: "flex-end",
                  }}
                >
                  {/* Premium */}
                  <span className="text-secondary small" style={{ width: "80px", textAlign: "center" }}>
                    {song.isPremium ? (
                      <span className="text-warning">Premium</span>
                    ) : (
                      <span className="text-success">Free</span>
                    )}
                  </span>

                  {/* Favorite */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(song);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: isFavorite ? "#1db954" : "#fff",
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                  >
                    {isFavorite ? <FaCheck /> : <FaPlus />}
                  </button>

                  {/* Duration */}
                  <span className="text-secondary small" style={{ width: "50px", textAlign: "right" }}>
                    {formatTime(song.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AlbumArtists;
