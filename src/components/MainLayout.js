import React, { useState } from "react";
import Header from "./Header";
import MainContent from "./MainContent";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import PlayerBar from "./PlayerBar";

const HEADER_HEIGHT = "70px";
const PLAYER_BAR_HEIGHT = "90px";

function MainLayout() {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const handleSelectPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
  };

  return (
    <div className="d-flex flex-column vh-100" style={{ backgroundColor: "#121212" }}>
      {/* Header */}
      <header style={{ height: HEADER_HEIGHT }}>
        <Header />
      </header>

      {/* Main Area */}
      <div className="flex-grow-1 overflow-hidden row g-0">
        {/* Left Sidebar */}
        <aside className="col-12 col-md-2 bg-dark text-light border-end overflow-auto">
          <LeftSidebar onSelectPlaylist={handleSelectPlaylist} />
        </aside>

        {/* Content */}
        <main className="col-12 col-md-8 overflow-auto p-3 text-light">
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
        </main>

        {/* Right Sidebar */}
        <aside className="col-12 col-md-2 bg-dark text-light border-start overflow-auto">
          <RightSidebar />
        </aside>
      </div>

      {/* Player Bar */}
      <footer style={{ height: PLAYER_BAR_HEIGHT }}>
        <PlayerBar playlist={selectedPlaylist} />
      </footer>
    </div>
  );
}

export default MainLayout;
