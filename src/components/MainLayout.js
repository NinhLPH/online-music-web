import React, { useState, useEffect } from "react";
import Header from "./Header";
import MainContent from "./MainContent";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import PlayerBar from "./PlayerBar";
import SongDetail from "./SongDetail";
import { useQueue } from "../context/QueueContext";

const HEADER_HEIGHT = "70px";
const PLAYER_BAR_HEIGHT = "90px";

function MainLayout() {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const { isQueueVisible } = useQueue(); // ⬅️ để biết khi nào RightSidebar đang bật

  const handleSelectPlaylist = (playlist) => setSelectedPlaylist(playlist);

  // 🧩 Nhận tín hiệu mở SongDetail từ PlayerBar hoặc RightSidebar
  useEffect(() => {
    const handler = (e) => {
      setSelectedSong(e.detail);
    };
    window.addEventListener("showSongDetail", handler);
    return () => window.removeEventListener("showSongDetail", handler);
  }, []);

  // 🧩 Khi mở danh sách chờ (RightSidebar), tự đóng SongDetail để tránh chồng chéo
  useEffect(() => {
    if (isQueueVisible) setSelectedSong(null);
  }, [isQueueVisible]);

  return (
    <div
      className="d-flex flex-column vh-100"
      style={{ backgroundColor: "#121212" }}
    >
      {/* Header */}
      <header style={{ height: HEADER_HEIGHT }}>
        <Header />
      </header>

      {/* Main Area */}
      <div
        className="flex-grow-1 overflow-hidden row g-0"
        style={{ position: "relative" }}
      >
        {/* Left Sidebar */}
        <aside className="col-12 col-md-2 bg-dark text-light border-end overflow-auto">
          <LeftSidebar onSelectPlaylist={handleSelectPlaylist} />
        </aside>

        {/* Main Content */}
        <main
          className="col-12 col-md-8 overflow-auto p-3 text-light"
          style={{ position: "relative" }}
        >
          {selectedPlaylist ? (
            <div>
              <h3>{selectedPlaylist.name}</h3>
              <p>{selectedPlaylist.description}</p>
              <div className="row row-cols-1 row-cols-md-3 g-3 mt-3">
                {selectedPlaylist.songs?.map((song, index) => (
                  <div key={index} className="col">
                    <div className="card bg-secondary text-white p-2 hover-card">
                      <h6>{song.title}</h6>
                      <p className="small">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <MainContent />
          )}

          {/* 🔹 SongDetail hiển thị đè lên MainContent (bao luôn cả rightsidebar) */}
          {selectedSong && (
            <SongDetail song={selectedSong} onClose={() => setSelectedSong(null)} />
          )}
        </main>

        {/* Right Sidebar (chỉ hiển thị khi bật danh sách chờ) */}
        <aside className="col-12 col-md-2 bg-dark text-light border-start overflow-auto">
          <RightSidebar />
        </aside>
      </div>

      {/* Player Bar */}
      <footer style={{ height: PLAYER_BAR_HEIGHT }}>
        <PlayerBar
          onShowSongDetail={(song) =>
            window.dispatchEvent(
              new CustomEvent("showSongDetail", { detail: song })
            )
          }
        />
      </footer>
    </div>
  );
}

export default MainLayout;
