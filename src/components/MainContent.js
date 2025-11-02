import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import PlayPauseButton from "./PlayPauseButton";
import SongDetail from "./SongDetail";
import Footer from "./Footer"

function MainContent() {
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:9000/songs").then(res => setSongs(res.data));
    axios.get("http://localhost:9000/artists").then(res => setArtists(res.data));
  }, []);

  const showSongDetail = useCallback((song) => setSelectedSong(song), []);

  const getArtistName = (id) =>
    artists.find((a) => String(a.id) === String(id))?.name || "Unknown Artist";

  const getSongImage = (song) =>
    `https://picsum.photos/seed/${song.id}/300`;

  const formatDuration = (seconds) =>
    Math.round(seconds / 60) + " phút";

  return (
    <div
      className="text-light"
      style={{
        backgroundColor: "#121212",
        height: "calc(100vh - 90px)",
        overflowY: "auto",
        paddingBottom: "120px", // ✅ Chừa Footer & PlayerBar
      }}
    >
      {!selectedSong && (
        <>
          {/* 🎵 SONG LIST */}
          <div className="container-fluid py-3">
            <h4 className="fw-bold mb-3">All Songs</h4>

            <div className="row row-cols-5 g-3">
              {songs.map((song) => (
                <div key={song.id} className="col" style={{ minWidth: "160px" }}>
                  <div
                    className="card border-0 h-100"
                    style={{
                      backgroundColor: "#121212",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {/* Ảnh */}
                    <div className="position-relative">
                      <img
                        src={getSongImage(song)}
                        className="card-img-top rounded"
                        style={{
                          height: "135px",
                          width: "100%",
                          objectFit: "cover",
                        }}
                        alt={song.title}
                        onClick={() => showSongDetail(song)}
                      />

                      {/* ✅ Play button position */}
                      <div
                        className="position-absolute"
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

                    {/* Info text */}
                    <div className="card-body px-2 py-2">
                      <h6 className="text-truncate mb-1">{song.title}</h6>
                      <p className="small mb-1 text-truncate" style={{ color: "#ddd" }}>
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
                <div key={artist.id} className="col text-center" style={{ minWidth: "160px" }}>
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
                    <p className="mt-2 text-truncate text-white">
                      {artist.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedSong && <SongDetail song={selectedSong} />}
      
            <div  style={{ margin : "40px 0px 0px 0px" }}>{Footer && <Footer />}</div>
    </div>
  );
}

export default MainContent;
