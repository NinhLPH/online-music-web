import React, { useEffect, useState } from "react";
import axios from "axios";
import { useQueue } from "../context/QueueContext";
import PlayPauseButton from "./PlayPauseButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Image, ListGroup } from "react-bootstrap";
import { FaPlay, FaRegClock, FaHeart } from "react-icons/fa";
import Footer from "./Footer";

const formatTime = (seconds) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const formatTotalDuration = (songs) => {
  if (!songs || songs.length === 0) return "0 phút";
  const totalSeconds = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = Math.floor(totalSeconds % 60);
  
  if (totalMinutes === 0) return `${remainingSeconds} giây`;
  if (remainingSeconds === 0) return `${totalMinutes} phút`;
  return `${totalMinutes} phút ${remainingSeconds} giây`;
};

export default function LikedSongs() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);

  const getArtistName = (id) => artists.find(a => a.id == id)?.name || "Unknown Artist";
  const getAlbumTitle = (id) => albums.find(a => a.id == id)?.title || "Unknown Album";

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const userRes = await axios.get(`http://localhost:9000/users/${currentUser.id}`);
        const favoriteIds = userRes.data.favorites || [];

        if (favoriteIds.length === 0) {
            setSongs([]);
            setLoading(false);
            return;
        }

        const songPromises = favoriteIds.map(id => 
          axios.get(`http://localhost:9000/songs/${id}`).then(res => res.data)
        );
        const favoriteSongs = await Promise.all(songPromises);
        setSongs(favoriteSongs);

        const [artistsRes, albumsRes] = await Promise.all([
          axios.get(`http://localhost:9000/artists`),
          axios.get(`http://localhost:9000/albums`)
        ]);
        setArtists(artistsRes.data);
        setAlbums(albumsRes.data);

      } catch (err) {
        console.error("Lỗi tải danh sách bài hát đã thích:", err);
      }
      setLoading(false);
    };

    fetchData();
    
    const handleFavoritesUpdated = (e) => {
        const updatedIds = e.detail;
        setSongs(currentSongs => currentSongs.filter(s => updatedIds.includes(s.id)));
    };
    window.addEventListener("favoritesUpdated", handleFavoritesUpdated);

    return () => {
        window.removeEventListener("favoritesUpdated", handleFavoritesUpdated);
    };

  }, [currentUser]);

  if (loading) {
    return (
      <div className="text-white text-center" style={{ marginTop: "100px" }}>
        Đang tải...
      </div>
    );
  }

  if (!currentUser) {
    return (
        <div className="text-white text-center" style={{ marginTop: "100px" }}>
            Vui lòng <strong onClick={() => navigate('/login')} style={{cursor: 'pointer', textDecoration: 'underline'}}>đăng nhập</strong> để xem bài hát đã thích.
        </div>
    );
  }

  return (
    <>
      <div
        className="text-light"
        style={{
          overflowY: "auto",
          minHeight: "calc(100vh - 160px)",
          background: "linear-gradient(to bottom, #4a0263, #121212 40%)",
          animation: "fadeIn 0.3s ease",
        }}
      >
        <Container fluid className="py-5 px-lg-5">
          <Row className="align-items-end">
            <Col xs={12} md={4} lg={3} className="text-center text-md-start">
              <div
                className="shadow-lg d-flex align-items-center justify-content-center"
                style={{
                  width: "100%",
                  maxWidth: 260,
                  aspectRatio: "1 / 1",
                  margin: "0 auto",
                  background: "linear-gradient(135deg, #4f32c9, #79f7ab)",
                  borderRadius: 6,
                }}
              >
                <FaHeart size={100} color="white" />
              </div>
            </Col>
            <Col xs={12} md={8} lg={9} className="mt-4 mt-md-0 text-center text-md-start">
              <p className="text-uppercase small fw-bold text-white-50">
                Playlist
              </p>
              <h1
                className="display-3 fw-bolder mb-3"
                style={{ lineHeight: 1.1 }}
              >
                Bài hát đã thích
              </h1>
              <div className="d-flex align-items-center justify-content-center justify-content-md-start small text-white-50">
                <span className="fw-bold text-white">{currentUser.username}</span>
                <span className="mx-2">•</span>
                <span>{songs.length} bài hát,</span>
                <span className="ms-1 text-white-50">{formatTotalDuration(songs)}</span>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Controls*/}
        <Container fluid className="px-lg-5 pb-3">
          {songs.length > 0 ? (
             <div
                style={{
                  background: "#1db954",
                  borderRadius: "50%",
                  width: 60,
                  height: 60,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                }}
                title="Phát bài hát đã thích"
              >
                {/* TODO: Nâng cấp logic này để phát cả danh sách */}
                <PlayPauseButton song={songs[0]} />
              </div>
          ) : (
            <p className="px-lg-5">Không có bài hát nào trong danh sách yêu thích của bạn.</p>
          )}
        </Container>

        {/* Tracklist */}
        {songs.length > 0 && (
          <Container fluid className="px-lg-5 pb-5">
            <Row className="border-bottom border-secondary-subtle py-2 text-white-50 d-none d-md-flex">
              <Col md={1} className="text-center">#</Col>
              <Col md={4}>Tiêu đề</Col>
              <Col md={3}>Nghệ sĩ</Col>
              <Col md={3}>Album</Col>
              <Col md={1} className="text-end"><FaRegClock /></Col>
            </Row>

            <ListGroup variant="flush">
              {songs.map((song, index) => (
                <ListGroup.Item
                  key={song.id}
                  action
                  className="bg-transparent text-white-50 border-0 p-2 album-track-row"
                  onClick={() => navigate(`/song/${song.id}`)}
                >
                  <Row className="align-items-center">
                    <Col xs={1} md={1} className="text-center">{index + 1}</Col>
                    
                    <Col xs={8} md={4} className="d-flex align-items-center">
                      <Image 
                        src={`https://picsum.photos/seed/${song.id}/50`} 
                        alt={song.title}
                        rounded
                        style={{width: 40, height: 40, objectFit: 'cover'}}
                      />
                      <div className="ms-3">
                        <span className="text-white fw-medium d-block text-truncate">{song.title}</span>
                      </div>
                    </Col>
                    <Col md={3} className="d-none d-md-block text-truncate">
                        <span 
                          className="artist-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/artist/${song.artistId}`)
                          }}
                        >
                          {getArtistName(song.artistId)}
                        </span>
                    </Col>
                    
                    <Col md={3} className="d-none d-md-block text-truncate">
                        <span 
                          className="artist-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/album/${song.albumId}`)
                          }}
                        >
                          {getAlbumTitle(song.albumId)}
                        </span>
                    </Col>
                    
                    {/* Thời lượng */}
                    <Col xs={3} md={1} className="text-end small">
                      {formatTime(song.duration)}
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Container>
        )}
      </div>
      
      <Footer />

      <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
    </>
  );
}
