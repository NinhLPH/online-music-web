// import React from "react";

// export default function LeftSidebar() {
//     return (
//         <div className="p-3">
//             <h5>Playlist,.....</h5>
//             <p>playlist1</p>
//             <p>playlist2</p>
//             <p>playlist3</p>
//             {/* songcard */}
//         </div>
//     )
// }
import React, { useState } from "react";
import { FaHeart, FaMusic, FaPlus } from "react-icons/fa";

export default function LeftSidebar({ onSelectPlaylist }) {
  const [active, setActive] = useState(null);

  const playlists = [
    {
      id: 1,
      name: "Liked Songs",
      description: "Playlist • 5 songs",
      icon: <FaHeart className="me-3 text-danger fs-5" />,
    },
    {
      id: 2,
      name: "My Playlist ",
      description: "Playlist • Phúc Quang",
      icon: <FaMusic className="me-3 text-primary fs-5" />,
    },
  ];

  const handleClick = (playlist) => {
    setActive(playlist.id);
    if (onSelectPlaylist) {
      onSelectPlaylist(playlist);
    }
  };

  return (
    <div className="bg-dark text-white h-100 p-3 d-flex flex-column">
      <h5 className="fw-bold mb-4">Your Library</h5>

      <div className="flex-grow-1">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className={`d-flex align-items-center mb-3 sidebar-item ${active === playlist.id ? "bg-secondary" : ""
              }`}
            style={{ borderRadius: "8px", cursor: "pointer", padding: "6px" }}
            onClick={() => handleClick(playlist)}
          >
            {playlist.icon}
            <div>
              <strong>{playlist.name}</strong>
              <p className="mb-0 text-secondary small">{playlist.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <button className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center">
          <FaPlus className="me-2" /> Create Playlist
        </button>
      </div>
    </div>
  );
}


