import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MainContent.css";
import PlayPauseButton from "./PlayPauseButton";
import SongDetail from "./SongDetail";

function MainContent() {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:9000/songs")
      .then(res => setSongs(res.data))
      .catch(err => console.error("Error fetching songs:", err));

    axios.get("http://localhost:9000/artists")
      .then(res => setArtists(res.data))
      .catch(err => console.error("Error fetching artists:", err));
  }, []);

  const getArtistName = (id) => artists.find(a => a.id === id)?.name || "Unknown Artist";
  const getSongImage = (song) => `https://picsum.photos/seed/${song.id}/300`;

  return (
    <div
      className="container-fluid py-3 text-light"
      style={{
        backgroundColor: "#121212",
        position: "relative",
        minHeight: "calc(100vh - 90px)",
        overflowY: "auto",
      }}
    >
      {!selectedSong && (
        <>
          <h4 className="fw-bold mb-4">All Songs</h4>
          <div className="row row-cols-2 row-cols-md-4 g-4">
            {songs.map(song => (
              <div key={song.id} className="col">
                <div className="card bg-dark text-white border-0 h-100 position-relative hover-card">
                  <div
                    className="position-relative"
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedSong(song)}
                  >
                    <img
                      src={getSongImage(song)}
                      alt={song.title}
                      className="card-img-top rounded"
                      style={{ objectFit: "cover", height: "180px" }}
                    />
                  </div>

                  {/* Nút Play/Pause độc lập */}
                  <div
                    className="position-absolute bottom-0 end-0 m-3"
                    style={{
                      zIndex: 3,
                      backgroundColor: "#1db954",
                      borderRadius: "50%",
                      width: "44px",
                      height: "44px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <PlayPauseButton song={song} />
                  </div>

                  <div className="card-body px-2">
                    <h6
                      className="card-title mb-1 text-truncate"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedSong(song)}
                    >
                      {song.title}
                    </h6>
                    <p className="card-text text-muted small mb-0 text-truncate">
                      {getArtistName(song.artistId)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedSong && (
        <SongDetail
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
        />
      )}
    </div>
  );
}

export default MainContent;