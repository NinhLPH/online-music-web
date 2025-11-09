import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Image, ListGroup } from "react-bootstrap";
import { useQueue } from "../context/QueueContext";
import { FaPause, FaPlay, FaRegClock } from "react-icons/fa";
import PlayPauseButton from "./PlayPauseButton";
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


export default function AlbumDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [album, setAlbum] = useState(null);
    const [artist, setArtist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    const {
        playAlbumOrPlaylist,
        currentSong,
        isPlaying,
        allSongs,
        play,
        pause,
    } = useQueue();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const albumRes = await axios.get(`http://localhost:9000/albums/${id}`);
                setAlbum(albumRes.data);
                const artistRes = await axios.get(
                    `http://localhost:9000/artists/${albumRes.data.artistId}`
                );
                setArtist(artistRes.data);
                const songsRes = await axios.get(
                    `http://localhost:9000/songs?albumId=${id}`
                );
                setSongs(songsRes.data);
            } catch (err) {
                console.error("Lỗi tải dữ liệu album:", err);
                navigate("/");
            }
            setLoading(false);
        };
        fetchData();
    }, [id, navigate]);

    const isThisListLoaded =
        songs.length > 0 &&
        allSongs.length === songs.length &&
        allSongs[0]?.id === songs[0]?.id;

    const isCurrentlyPlaying = isThisListLoaded && isPlaying;

    const handleAlbumPlay = () => {
        if (isCurrentlyPlaying) {
            pause();
        } else if (isThisListLoaded && !isPlaying) {
            play();
        } else {
            playAlbumOrPlaylist(songs);
        }
    };

    if (loading || !album || !artist) {
        return (
            <div className="text-white text-center" style={{ marginTop: "100px" }}>
                Đang tải chi tiết album...
            </div>
        );
    }

    const bgImage = album.coverImg;

    return (
        <>
            <div
                style={{
                    background: `url(${bgImage}) center center / cover no-repeat`,
                    backgroundAttachment: "fixed",
                    paddingBottom: "50px",
                    position: "relative",
                    color: "#fff"
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.7), #121212 95%)",
                        backdropFilter: "blur(30px)",
                        zIndex: 0,
                    }}
                />

                <Container fluid className="py-5 px-lg-5" style={{ position: "relative", zIndex: 1 }}>
                    <Row className="align-items-end">
                        <Col xs={12} md={4} lg={3} className="text-center text-md-start">
                            <Image
                                src={album.coverImg}
                                alt={album.title}
                                fluid
                                rounded
                                className="shadow-lg"
                                style={{
                                    width: "100%",
                                    maxWidth: 260,
                                    height: "auto",
                                    aspectRatio: "1 / 1",
                                    objectFit: "cover",
                                    margin: "0 auto",
                                }}
                            />
                        </Col>
                        <Col xs={12} md={8} lg={9} className="mt-4 mt-md-0 text-center text-md-start">
                            <p className="text-uppercase small fw-bold text-white-50">
                                Album
                            </p>
                            <h1
                                className="display-3 fw-bolder mb-3"
                                style={{ lineHeight: 1.1 }}
                            >
                                {album.title}
                            </h1>
                            <div className="d-flex align-items-center justify-content-center justify-content-md-start small text-white-50">
                                <span className="fw-bold text-white" onClick={() => navigate(`/artist/${artist.id}`)}>{artist.name}</span>
                                <span className_="mx-2">•</span>
                                <span>{album.releaseYear}</span>
                                <span className="mx-2">•</span>
                                <span>{songs.length} bài hát,</span>
                                <span className="ms-1 text-white-50">{formatTotalDuration(songs)}</span>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <div style={{ background: "#121212", color: "#fff", minHeight: "100vh" }}>
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
                            title={`Phát album ${album.title}`}
                            onClick={handleAlbumPlay}
                        >
                            {isCurrentlyPlaying ? (
                                <FaPause size={24} color="black" />
                            ) : (
                                <FaPlay size={24} color="black" style={{ marginLeft: 3 }} />
                            )}
                        </div>
                    ) : (
                        <p>Album này chưa có bài hát nào.</p>
                    )}
                </Container>

                <Container fluid className="px-lg-5 pb-5">
                    <Row className="border-bottom border-secondary-subtle py-2 text-white-50 d-none d-md-flex">
                        <Col md={1} className="text-center">#</Col>
                        <Col md={5}>Tiêu đề</Col>
                        <Col md={4}>Nghệ sĩ</Col>
                        <Col md={2} className="text-end"><FaRegClock /></Col>
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

                                    <Col xs={8} md={5} className="d-flex align-items-center">
                                        <Image
                                            src={`https://picsum.photos/seed/${song.id}/50`}
                                            alt={song.title}
                                            rounded
                                            style={{ width: 40, height: 40, objectFit: 'cover' }}
                                        />
                                        <div className="ms-3">
                                            <span className="text-white fw-medium d-block text-truncate">{song.title}</span>
                                        </div>
                                    </Col>
                                    <Col md={4} className="d-none d-md-block">
                                        <span
                                            className="artist-link"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/artist/${song.artistId}`)
                                            }}
                                        >
                                            {artist.name}
                                        </span>
                                    </Col>

                                    <Col xs={3} md={2} className="text-end small">
                                        {formatTime(song.duration)}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Container>
            </div>

            <Footer />

            <style>
                {`
          .album-track-row:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
          }
          .album-track-row .artist-link:hover {
            color: #fff !important;
            text-decoration: underline;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
            </style>
        </>
    );
}