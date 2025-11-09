import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaHeart, FaMusic, FaPlay, FaListUl, FaPlus, FaTimes } from "react-icons/fa";
import SongDetail from "./SongDetail";

export default function LeftSidebar({ onSelectPlaylist }) {
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [active, setActive] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const fetchFavorites = async () => {
        try {
          const userRes = await axios.get(
            `http://localhost:9000/users/${currentUser.id}`
          );
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

      const fetchPlaylists = async () => {
        try {
          const res = await axios.get(
            `http://localhost:9000/playlists?userId=${currentUser.id}`
          );
          setPlaylists(res.data || []);
        } catch (err) {
          console.error("Lỗi tải danh sách playlist:", err);
        }
      };

      fetchFavorites();
      fetchPlaylists();

      const handlePlaylistUpdate = () => fetchPlaylists();
      const handleFavoritesUpdate = () => fetchFavorites();

      window.addEventListener("playlistUpdated", handlePlaylistUpdate);
      window.addEventListener("favoritesUpdated", handleFavoritesUpdate);

      return () => {
        window.removeEventListener("playlistUpdated", handlePlaylistUpdate);
        window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
      };
    } else {
      setFavorites([]);
      setPlaylists([]);
    }
  }, [currentUser]);

  const handleNavigate = (path, type) => {
    setActive(type);
    navigate(path);
  };

  const handleCreatePlaylist = async () => {
    if (!currentUser) return;

    const newName = `Playlist của tôi #${playlists.length + 1}`;

    const newPlaylistData = {
      name: newName,
      userId: currentUser.id,
      description: "Mô tả playlist...",
      coverImg: `https://picsum.photos/seed/playlist${Date.now()}/300`,
      songIds: [],
    };

    try {
      const res = await axios.post(
        `http://localhost:9000/playlists`,
        newPlaylistData
      );
      const newPlaylist = res.data;

      window.dispatchEvent(new CustomEvent("playlistUpdated"));

      navigate(`/playlist/${newPlaylist.id}`);
      setActive(newPlaylist.id);

    } catch (err) {
      console.error("Lỗi khi tạo playlist:", err);
      alert("Không thể tạo playlist mới. Vui lòng thử lại.");
    }
  };

  const handleDeletePlaylist = async (playlistId, playlistName, event) => {
    event.stopPropagation(); 
    
    if (window.confirm(`Bạn có chắc muốn xóa playlist "${playlistName}" không?`)) {
      try {
        await axios.delete(`http://localhost:9000/playlists/${playlistId}`);
        
        window.dispatchEvent(new CustomEvent("playlistUpdated"));
        
        if (active === playlistId) {
            navigate('/');
            setActive('all');
        }
      } catch (err) {
        console.error("Lỗi khi xóa playlist:", err);
        alert("Không thể xóa playlist. Vui lòng thử lại.");
      }
    }
  };

  return (
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
        Thư viện
      </h4>

      {/* All Songs */}
      <div
        className={`sidebar-item ${active === "all" ? "active" : ""}`}
        onClick={() => handleNavigate("/", "all")}
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
        <span>Tất cả bài hát</span>
      </div>

      <hr style={{ borderColor: "#333", margin: "15px 0" }} />

      {currentUser && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: 'pointer'
            }}
            onClick={() => handleNavigate("/liked", "liked")}
          >
            <h5 style={{ color: active === 'liked' ? '#fff' : '#b3b3b3', marginBottom: 10 }}>
              <FaHeart color={active === 'liked' ? '#1db954' : '#b3b3b3'} style={{ marginRight: 10 }} />
              Bài hát đã thích
            </h5>
          </div>

          {favorites.length === 0 ? (
            <p style={{ fontSize: 14, color: "#666" }}>Chưa có bài hát yêu thích.</p>
          ) : (
            favorites.slice(0, 5).map((song) => (
              <div
                key={song.id}
                className="sidebar-song"
                onClick={() => navigate(`/song/${song.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                  cursor: "pointer",
                  paddingLeft: 10
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
                  <div style={{ color: "#fff", fontSize: 14, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{song.title}</div>
                  <div style={{ color: "#aaa", fontSize: 12 }}>
                  </div>
                </div>
              </div>
            ))
          )}

          <hr style={{ borderColor: "#333", margin: "15px 0" }} />

          {/* ✅ Playlist section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h5 style={{ color: "#fff", margin: 0 }}>Playlists</h5>
            <FaPlus
              title="Tạo playlist mới"
              style={{ color: '#b3b3b3', cursor: 'pointer', fontSize: 16 }}
              onClick={handleCreatePlaylist}
              className="create-playlist-btn"
            />
          </div>

          {playlists.length === 0 ? (
            <p style={{ fontSize: 14, color: "#666" }}>Chưa có playlist nào.</p>
          ) : (
            playlists.map((pl) => (
              <div
                key={pl.id}
                className={`sidebar-item playlist-item-hover ${active === pl.id ? "active" : ""}`}
                onClick={() => handleNavigate(`/playlist/${pl.id}`, pl.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: 'space-between',
                  cursor: "pointer",
                  marginBottom: 12,
                  color: active === pl.id ? "#fff" : "#b3b3b3",
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                    <FaListUl color={active === pl.id ? "#1db954" : "#b3b3b3"} />
                    <span style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{pl.name}</span>
                </div>
                
                <FaTimes 
                  className="delete-playlist-btn"
                  title={`Xóa playlist ${pl.name}`}
                  onClick={(e) => handleDeletePlaylist(pl.id, pl.name, e)}
                  style={{
                    color: '#b3b3b3',
                    fontSize: 14,
                    visibility: 'hidden',
                  }}
                />
              </div>
            ))
          )}
        </>
      )}

      <style>
        {`
          .create-playlist-btn:hover {
            color: #fff !important;
          }
            .playlist-item-hover:hover .delete-playlist-btn {
            visibility: visible !important;
          }
          
          .delete-playlist-btn:hover {
            color: #fff !important;
          }
        `}
      </style>

    </div>
  );
}
