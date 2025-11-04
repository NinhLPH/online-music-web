import React from "react";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import PlayerBar from "./PlayerBar";
import { Outlet } from "react-router-dom";

const HEADER_HEIGHT = "70px";
const PLAYER_BAR_HEIGHT = "90px";

function MainLayout() {
  return (
    <div
      className="d-flex flex-column"
      style={{
        backgroundColor: "#121212",
        color: "#fff",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header style={{ height: HEADER_HEIGHT }}>
        <Header />
      </header>

      {/* Main Area */}
      <div
        className="row g-0 flex-grow-1"
        style={{
          position: "relative",
          height: `calc(100vh - ${HEADER_HEIGHT} - ${PLAYER_BAR_HEIGHT})`, // ✅ fix cao hẳn
          overflow: "hidden",
        }}
      >
        {/* Left Sidebar */}
        <aside className="col-12 col-md-2 bg-dark text-light border-end overflow-auto">
          <LeftSidebar />
        </aside>

        {/* Main Content */}
        <main
          className="col-12 col-md-8 overflow-auto p-3 text-light"
          style={{
            position: "relative",
            backgroundColor: "#121212",
            height: "100%",
          }}
        >
          <Outlet />
        </main>

        {/* Right Sidebar */}
        <aside className="d-none d-md-block col-md-2 p-0">
          <RightSidebar />
        </aside>

      </div>

      {/* Player Bar */}
      <footer style={{ height: PLAYER_BAR_HEIGHT, flexShrink: 0 }}>
        <PlayerBar />
      </footer>
    </div>
  );
}

export default MainLayout;
