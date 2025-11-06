import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaMusic, FaPlay, FaListUl } from "react-icons/fa";
import SongDetail from "./SongDetail";

export default function LeftSidebar({ onSelectPlaylist }) {
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [active, setActive] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  // 🔁 Lấy danh sách bài hát yêu thích
  const fetchFavorites = async () => {
    try {
      const userRes = await axios.get(`http://localhost:9000/users/1`);
      const favoriteIds = userRes.data.favorites || [];
      const songPromises = favoriteIds.map((id) =>
        axios.get(`http://localhost:9000/songs/${id}`).then((res) => res.data)
      );
      const songsData = await Promise.all(songPromises);
      setFavorites(songsData);
    } catch (err) {
      console.error("Lỗi tải danh sách yêu thích:", err);
    }
  };

  // 🔁 Lấy danh sách playlist
  const fetchPlaylists = async () => {
    try {
      const res = await axios.get(`http://localhost:9000/playlists?userId=1`);
      setPlaylists(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách playlist:", err);
    }
  };

  useEffect(() => {
    fetchFavorites();
    fetchPlaylists();

    // ⏳ Tự refresh mỗi 3s
    const interval = setInterval(() => {
      fetchFavorites();
      fetchPlaylists();
    }, 3000);

    // 🧩 Lắng nghe sự kiện từ RightSidebar (playlistUpdated)
    const handlePlaylistUpdate = () => fetchPlaylists();
    window.addEventListener("playlistUpdated", handlePlaylistUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("playlistUpdated", handlePlaylistUpdate);
    };
  }, []);

  // 🔘 Khi nhấn vào playlist hoặc liked songs
  const handleSelect = async (type, playlist = null) => {
    setActive(type);

    if (type === "liked") {
      onSelectPlaylist({ name: "Liked Songs", songs: favorites });
    } else if (type === "playlist" && playlist) {
      try {
        const songPromises = (playlist.songIds || []).map((id) =>
          axios.get(`http://localhost:9000/songs/${id}`).then((res) => res.data)
        );
        const songs = await Promise.all(songPromises);
        onSelectPlaylist({ name: playlist.name, songs });
      } catch (err) {
        console.error("Lỗi khi tải bài hát trong playlist:", err);
      }
    } else {
      onSelectPlaylist(null);
    }

    setSelectedSong(null);
  };

  // ▶️ Phát tất cả bài hát yêu thích
  const handlePlayAll = () => {
    if (favorites.length > 0) {
      onSelectPlaylist({
        name: "Liked Songs",
        songs: favorites,
        autoPlay: true,
      });
      setSelectedSong(null);
    }
  };

  return (
    <>
      {/* Sidebar chính */}
      <div
        className="left-sidebar"
        style={{
          width: 260,
          backgroundColor: "#000",
          color: "#b3b3b3",
          padding: "20px",
          height: "100vh",
          overflowY: "auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        <h4 style={{ color: "#fff", fontWeight: "bold", marginBottom: "25px" }}>
          My Library
        </h4>

        {/* All Songs */}
        <div
          className={`sidebar-item ${active === "all" ? "active" : ""}`}
          onClick={() => handleSelect("all")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            marginBottom: 15,
            color: active === "all" ? "#fff" : "#b3b3b3",
          }}
        >
          <FaMusic color={active === "all" ? "#1db954" : "#b3b3b3"} />
          <span>All Songs</span>
        </div>

        <hr style={{ borderColor: "#333", margin: "15px 0" }} />

        {/* ✅ Favorites section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5 style={{ color: "#fff", marginBottom: 10 }}>Liked Songs</h5>
          {favorites.length > 0 && (
            <FaPlay
              onClick={handlePlayAll}
              title="Play all favorites"
              style={{
                color: "#1db954",
                cursor: "pointer",
                fontSize: 14,
              }}
            />
          )}
        </div>

        {favorites.length === 0 ? (
          <p style={{ fontSize: 14, color: "#666" }}>Chưa có bài hát yêu thích.</p>
        ) : (
          favorites.map((song) => (
            <div
              key={song.id}
              className="sidebar-song"
              onClick={() => window.dispatchEvent(new CustomEvent("showSongDetail", { detail: song }))}

              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
                cursor: "pointer",
              }}
            >
              <img
                src={`https://picsum.photos/seed/${song.id}/50`}
                alt={song.title}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  objectFit: "cover",
                }}
              />
              <div>
                <div style={{ color: "#fff", fontSize: 14 }}>{song.title}</div>
                <div style={{ color: "#aaa", fontSize: 12 }}>
                  {song.artist || "Unknown Artist"}
                </div>
              </div>
            </div>
          ))
        )}

        <hr style={{ borderColor: "#333", margin: "15px 0" }} />

        {/* ✅ Playlist section */}
        <h5 style={{ color: "#fff", marginBottom: 10 }}>Playlists</h5>

        {playlists.length === 0 ? (
          <p style={{ fontSize: 14, color: "#666" }}>Chưa có playlist nào.</p>
        ) : (
          playlists.map((pl) => (
            <div
              key={pl.id}
              className={`sidebar-item ${active === pl.id ? "active" : ""}`}
              onClick={() => handleSelect("playlist", pl)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                marginBottom: 12,
                color: active === pl.id ? "#fff" : "#b3b3b3",
              }}
            >
              <FaListUl color={active === pl.id ? "#1db954" : "#b3b3b3"} />
              <span>{pl.name}</span>
            </div>
          ))
        )}
      </div>

      {/* ✅ SongDetail hiển thị ở giữa vùng nội dung, không đè lên sidebar */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
          color: "#fff",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {selectedSong ? (
          <div
            style={{
              maxWidth: "800px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <SongDetail song={selectedSong} onClose={() => setSelectedSong(null)} />
          </div>
        ) : (
          <div style={{ color: "#777" }}>Chọn một bài hát để xem chi tiết 🎧</div>
        )}
      </div>
    </>
  );
}
