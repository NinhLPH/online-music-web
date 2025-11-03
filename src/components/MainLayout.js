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
      className="d-flex flex-column vh-100"
      style={{ backgroundColor: "#121212", color: "#fff" }}
    >
      {/* Header */}
      <header style={{ height: HEADER_HEIGHT }}>
        <Header />
      </header>

      {/* Main Area */}
      <div className="flex-grow-1 overflow-hidden row g-0" style={{ position: "relative" }}>
        {/* Left Sidebar */}
        <aside className="col-12 col-md-2 bg-dark text-light border-end overflow-auto">
          <LeftSidebar />
        </aside>

        {/* Main Content - nơi hiển thị các Route con */}
        <main
          className="col-12 col-md-8 overflow-auto p-3 text-light"
          style={{ position: "relative", backgroundColor: "#121212" }}
        >
          <Outlet />
        </main>

        {/* Right Sidebar */}
        <aside className="col-12 col-md-2 bg-dark text-light border-start overflow-auto">
          <RightSidebar />
        </aside>
      </div>

      {/* Player Bar */}
      <footer style={{ height: PLAYER_BAR_HEIGHT }}>
        <PlayerBar />
      </footer>
    </div>
  );
}

export default MainLayout;
