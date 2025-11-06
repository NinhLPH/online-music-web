import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaListUl } from "react-icons/fa";
import SongDetail from "./SongDetail";
import { useAuth } from "../context/AuthContext"; // ✅ Lấy user hiện tại

export default function LeftSidebar() {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [active, setActive] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);

  // ====== 🔁 Lấy danh sách bài hát yêu thích của user hiện tại ======
  const fetchFavorites = async () => {
    try {
      if (!currentUser?.id) {
        console.warn("⚠️ Không có user đăng nhập, bỏ qua fetchFavorites()");
        setFavorites([]);
        return;
      }

      const userRes = await axios.get(`http://localhost:9000/users/${currentUser.id}`);
      const favoriteIds = userRes.data.favorites || [];

      if (!favoriteIds.length) {
        setFavorites([]);
        return;
      }

      const songsRes = await axios.get(`http://localhost:9000/songs`);
      const favSongs = songsRes.data.filter(
        (s) => favoriteIds.includes(s.id) || favoriteIds.includes(String(s.id))
      );
      setFavorites(favSongs);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách yêu thích:", err);
      setFavorites([]);
    }
  };

  // ====== 🔁 Lấy danh sách playlist của user hiện tại ======
  const fetchPlaylists = async () => {
    try {
      const res = await axios.get(`http://localhost:9000/playlists`);
      const userPlaylists = res.data.filter(
        (p) => String(p.userId) === String(currentUser?.id)
      );
      setPlaylists(userPlaylists);
    } catch (err) {
      console.error("❌ Lỗi khi tải playlists:", err);
      setPlaylists([]);
    }
  };

  // ====== ⚙️ Khi user thay đổi hoặc component mount ======
  useEffect(() => {
    if (currentUser) {
      fetchFavorites();
      fetchPlaylists();
    }
  }, [currentUser]);

  // ====== 📡 Sự kiện mở trang yêu thích ======
  const openLikedPage = () => {
    setActive("liked");
    window.dispatchEvent(new CustomEvent("openLiked"));
  };

  // ====== 📡 Sự kiện mở playlist ======
  const openPlaylistPage = (playlistId) => {
    setActive(playlistId);
    window.dispatchEvent(
      new CustomEvent("openPlaylist", { detail: { id: playlistId } })
    );
  };

  return (
    <div style={{ padding: "1rem", height: "100%", overflowY: "auto" }}>
      {/* --- Liked Songs section --- */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          className={`d-flex align-items-center p-2 rounded ${active === "liked" ? "bg-secondary text-white" : ""
            }`}
          style={{ cursor: "pointer", transition: "background 0.2s" }}
          onClick={openLikedPage}
        >
          <FaHeart style={{ marginRight: 8, color: "#e25555" }} />
          <div>
            <div style={{ fontWeight: 600 }}>Liked Songs</div>
            <small style={{ color: "#aaa" }}>{favorites.length} songs</small>
          </div>
        </div>
      </div>

      {/* --- Playlists section --- */}
      <div>
        <div
          style={{
            fontSize: 12,
            color: "#999",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          PLAYLISTS..
        </div>

        {playlists.map((pl) => {
          // ✅ Đếm chính xác số bài hát trong playlist
          const songCount = Array.isArray(pl.songIds)
            ? pl.songIds.filter(id => id && id !== "" && id !== null).length
            : 0;


          return (
            <div
              key={pl.id}
              className={`d-flex align-items-center p-2 rounded ${active === pl.id ? "bg-secondary text-white" : ""
                }`}
              style={{ cursor: "pointer", transition: "background 0.2s" }}
              onClick={() => openPlaylistPage(pl.id)}
            >
              <FaListUl style={{ marginRight: 8, color: "#4db8ff" }} />
              <div>
                <div style={{ fontWeight: 500 }}>{pl.name}</div>
                <small style={{ color: "#aaa" }}>{songCount} songs</small>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Song preview area --- */}
      <div style={{ marginTop: 16 }}>
        {selectedSong ? (
          <div
            style={{
              background: "#1e1e1e",
              padding: 12,
              borderRadius: 6,
              boxShadow: "0 0 4px rgba(0,0,0,0.3)",
            }}
          >
            <SongDetail
              song={selectedSong}
              onClose={() => setSelectedSong(null)}
            />
          </div>
        ) : (
          <div style={{ color: "#777", fontSize: 13 }}>
            🎧 Chọn một bài hát để xem chi tiết
          </div>
        )}
      </div>
    </div>
  );
}
