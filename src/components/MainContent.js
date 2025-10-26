import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MainContent.css";

function MainContent() {
  const [playlists, setPlaylists] = useState([]);
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    // Gọi API backend trực tiếp, không dùng proxy
    axios.get("http://localhost:9000/playlists")
      .then(res => setPlaylists(res.data))
      .catch(err => console.error("Error fetching playlists:", err));

    axios.get("http://localhost:9000/artists")
      .then(res => setArtists(res.data))
      .catch(err => console.error("Error fetching artists:", err));
  }, []);

  return (
    <div className="container-fluid py-3 text-light" style={{ backgroundColor: "#121212" }}>
      {/* Made for user */}
      <h4 className="fw-bold mb-3">Made for Tranbaophuc</h4>
      <div className="row row-cols-2 row-cols-md-4 g-4 mb-5">
        {playlists.map(pl => (
          <div key={pl.id} className="col">
            <div className="card bg-dark text-white border-0 h-100 hover-card">
              <img
                src={pl.coverImg}
                alt={pl.name}
                className="card-img-top rounded"
                style={{ objectFit: "cover", height: "180px" }}
              />
              <div className="card-body">
                <h6 className="card-title mb-1">{pl.name}</h6>
                <p className="card-text text-muted small">{pl.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Stations */}
      <h4 className="fw-bold mb-3">Recommended Stations</h4>
      <div className="row row-cols-2 row-cols-md-6 g-4">
        {artists.map(artist => (
          <div key={artist.id} className="col">
            <div className="card bg-dark text-white border-0 h-100 hover-card text-center">
              {/* Ảnh vuông */}
              <img
                src={artist.coverImg}
                alt={artist.name}
                className="mx-auto mt-3"
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
              />
              <div className="card-body p-2">
                <p className="fw-semibold mb-0">{artist.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainContent;
