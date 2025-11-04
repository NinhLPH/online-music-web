import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaPlay, FaEllipsisH } from "react-icons/fa";

function AlbumArtists() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const artistRes = await axios.get(`http://localhost:9000/artists/${id}`);
        setArtist(artistRes.data);

        const songsRes = await axios.get(`http://localhost:9000/songs?artistId=${id}`);
        setSongs(songsRes.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };
    fetchData();
  }, [id]);

  if (!artist)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-light bg-dark">
        <div className="spinner-border text-success me-2" />
        <span>Đang tải...</span>
      </div>
    );

  return (
    <div
      className="bg-dark text-light"
      style={{
        height: "calc(100vh - 90px)", // trừ thanh PlayerBar
        overflowY: "scroll",
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge
      }}
      onWheel={(e) => e.stopPropagation()} // tránh xung đột scroll
    >
      {/* Ẩn thanh cuộn trên Chrome */}
      <style>
        {`
          ::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      {/* Banner nghệ sĩ */}
      <div
        className="position-relative"
        style={{
          height: "400px",
          backgroundImage: `url(${artist.coverImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="position-absolute bottom-0 start-0 w-100 p-4"
          style={{
            background: "linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)",
          }}
        >
          <h6 className="text-success fw-semibold mb-1">
            <i className="bi bi-patch-check-fill me-1"></i> Nghệ sĩ được xác minh
          </h6>
          <h1 className="display-3 fw-bold">{artist.name}</h1>
          <p className="text-secondary">
            {Math.floor(Math.random() * 1000000).toLocaleString("vi-VN")} người nghe hằng tháng
          </p>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="d-flex align-items-center gap-3 px-4 pt-3">
        <button
          className="btn btn-success rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: 60, height: 60, fontSize: "1.5rem" }}
        >
          <FaPlay />
        </button>
        <button className="btn btn-outline-light px-3">Đang theo dõi</button>
        <button className="btn btn-dark border-0 text-light">
          <FaEllipsisH />
        </button>
      </div>

      {/* Danh sách bài hát phổ biến */}
      <div className="container mt-4 pb-5">
        <h4 className="fw-bold mb-3">Phổ biến</h4>
        <div className="list-group list-group-flush">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className="list-group-item bg-transparent text-light d-flex justify-content-between align-items-center py-2 border-0 border-bottom border-secondary"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/song/${song.id}`)}
            >
              <div className="d-flex align-items-center">
                <div className="me-3 text-secondary" style={{ width: "25px" }}>
                  {index + 1}
                </div>
                <div>
                  <div className="fw-semibold text-light">{song.title}</div>
                  <div className="text-secondary small">{artist.name}</div>
                </div>
              </div>

              <div className="text-secondary small d-flex align-items-center gap-4">
                <span>
                  {(Math.random() * 20_000_000 + 1_000_000)
                    .toFixed(0)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                </span>
                <span>
                  {Math.floor(song.duration / 60)}:
                  {(song.duration % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AlbumArtists;
