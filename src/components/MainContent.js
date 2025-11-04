import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import PlayPauseButton from "./PlayPauseButton";
import Footer from "./Footer";
import LikedSongs from "./LikedSongs";
import Playlist from "./Playlist";

function MainContent() {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [view, setView] = useState("home"); // 'home' | 'liked' | 'playlist'
  const [playlistId, setPlaylistId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:9000/songs").then((res) => setSongs(res.data));
    axios.get("http://localhost:9000/artists").then((res) => setArtists(res.data));
    
  }, []);

  
  // Lắng nghe event từ LeftSidebar
  useEffect(() => {
    const handleOpenLiked = () => {
      setView("liked");
    };

    const handleOpenPlaylist = (e) => {
      setPlaylistId(e.detail.id);
      setView("playlist");
    };

    window.addEventListener("openLiked", handleOpenLiked);
    window.addEventListener("openPlaylist", handleOpenPlaylist);

    return () => {
      window.removeEventListener("openLiked", handleOpenLiked);
      window.removeEventListener("openPlaylist", handleOpenPlaylist);
    };
  }, []);

  const getArtistName = (id) =>
    artists.find((a) => String(a.id) === String(id))?.name || "Unknown Artist";

  const getSongImage = (song) => `https://picsum.photos/seed/${song.id}/300`;

  const formatDuration = (seconds) => Math.round(seconds / 60) + " phút";

  
  // ✅ Khi LeftSidebar gọi openLiked / openPlaylist → hiển thị component tương ứng
  if (view === "liked") {
    return (
      <div
        className="text-light"
        style={{
          backgroundColor: "#121212",
          height: "calc(100vh - 90px)",
          overflowY: "auto",
          paddingBottom: "120px",
        }}
      >
        <LikedSongs />
      </div>
    );
  }

  if (view === "playlist" && playlistId) {
    return (
      <div
        className="text-light"
        style={{
          backgroundColor: "#121212",
          height: "calc(100vh - 90px)",
          overflowY: "auto",
          paddingBottom: "120px",
        }}
      >
        <Playlist playlistId={playlistId} />
      </div>
    );
  }
  return (
    <div
      className="text-light"
      style={{
        backgroundColor: "#121212",
        height: "calc(100vh - 90px)",
        overflowY: "auto",
        paddingBottom: "120px",
      }}
    >
      {/* 🎵 SONG LIST */}
      <div className="container-fluid py-3">
        <h4 className="fw-bold mb-3">All Songs</h4>

        <div className="row row-cols-5 g-3">
          {songs.map((song) => (
            <div
              key={song.id}
              className="col"
              style={{ minWidth: "160px", cursor: "pointer" }}
            >
              <div
                className="card border-0 h-100"
                style={{
                  backgroundColor: "#121212",
                  color: "#fff",
                }}
              >
                {/* Ảnh bài hát */}
                <div
                  className="position-relative"
                  onClick={() => navigate(`/song/${song.id}`)} // mở chi tiết bài hát
                >
                  <img
                    src={getSongImage(song)}
                    className="card-img-top rounded"
                    style={{
                      height: "135px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                    alt={song.title}
                  />

                  {/* Nút play */}
                  <div
                    className="position-absolute"
                    onClick={(e) => e.stopPropagation()} // ngăn chặn click lan lên ảnh
                    style={{
                      bottom: "8px",
                      right: "8px",
                      backgroundColor: "#1db954",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                    }}
                  >
                    <PlayPauseButton song={song} />
                  </div>
                </div>

                {/* Thông tin bài hát */}
                <div
                  className="card-body px-2 py-2"
                  onClick={() => navigate(`/song/${song.id}`)}
                >
                  <h6 className="text-truncate mb-1">{song.title}</h6>

                  {/* 🔗 Bấm vào tên ca sĩ để mở trang nghệ sĩ */}
                  <p
                    className="small mb-1 text-truncate text-light"
                    style={{ color: "#ddd", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const artistId = song.artistId;
                      if (artistId) navigate(`/artist/${artistId}`);
                    }}
                  >
                    {getArtistName(song.artistId)}
                  </p>

                  <p className="text-secondary small mb-0">
                    {formatDuration(song.duration)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 👤 ARTISTS LIST */}
      <div className="container-fluid pt-4">
        <h4 className="fw-bold mb-3">Artists</h4>

        <div className="row row-cols-5 g-3">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="col text-center"
              style={{ minWidth: "160px", cursor: "pointer" }}
              onClick={() => navigate(`/artist/${artist.id}`)} // ✅ mở trang AlbumArtists
            >
              <div
                className="card border-0 bg-dark h-100 p-3"
                style={{ backgroundColor: "#121212" }}
              >
                <img
                  src={artist.coverImg}
                  className="rounded-circle mx-auto"
                  style={{
                    width: "110px",
                    height: "110px",
                    objectFit: "cover",
                  }}
                  alt={artist.name}
                />
                <p className="mt-2 text-truncate text-white">{artist.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ margin: "40px 0 0" }}>
        {Footer && <Footer />}
      </div>
    </div>
  );
}

export default MainContent;
