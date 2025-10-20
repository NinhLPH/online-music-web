import React from 'react';
import { Outlet } from 'react-router-dom';

import Header from './Header';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import PlayerBar from './PlayerBar';

const HEADER_HEIGHT = '70px';
const PLAYER_BAR_HEIGHT = '90px';

function MainLayout() {
  return (
    <div className="d-flex flex-column vh-100">
      <div style={{ height: HEADER_HEIGHT }}>
        <Header />
      </div>

      <div className="flex-grow-1 overflow-hidden row g-0">
        
        {/*Library, playlist,..*/}
        <div className="col-2 bg-light border-end overflow-auto">
          <LeftSidebar />
        </div>

        {/*Main content*/}
        <main className="col-8 overflow-auto">
          <div className="p-3">
            {/*home, search, song,...
            */}
            <Outlet /> 
          </div>
        </main>

        {/*songcard*/}
        <div className="col-2 bg-light border-start overflow-auto">
          <RightSidebar />
        </div>
      </div>

      {/*Player bar*/}
      <div style={{ height: PLAYER_BAR_HEIGHT }}>
        <PlayerBar />
      </div>
    </div>
  );
}

export default MainLayout;