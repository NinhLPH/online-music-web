import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import PlayerBar from "./PlayerBar";

const HEADER_HEIGHT = "70px";
const PLAYER_BAR_HEIGHT = "90px";

function MainLayout() {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const handleSelectPlaylist = (playlist) => {
    console.log("Selected playlist:", playlist);
    setSelectedPlaylist(playlist);
  };

  return (
    <div className="d-flex flex-column vh-100">
      <div style={{ height: HEADER_HEIGHT }}>
        <Header />
      </div>

      <div className="flex-grow-1 overflow-hidden row g-0">
        {/* Sidebar */}
        <div className="col-2 bg-light border-end overflow-auto">
          <LeftSidebar onSelectPlaylist={handleSelectPlaylist} />
        </div>

        {/* Main Content */}
        <main className="col-8 overflow-auto">
          <div className="p-3">
            {selectedPlaylist ? (
              <div>
                <h3>{selectedPlaylist.name}</h3>
                <p>{selectedPlaylist.description}</p>
                <p>(Hiển thị danh sách bài hát ở đây)</p>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <div className="col-2 bg-light border-start overflow-auto">
          <RightSidebar />
        </div>
      </div>

      <div style={{ height: PLAYER_BAR_HEIGHT }}>
        <PlayerBar />
      </div>
    </div>
  );
}

export default MainLayout;
