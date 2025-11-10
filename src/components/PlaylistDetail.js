import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Image, ListGroup, Form } from "react-bootstrap";
import { FaPlay, FaRegClock, FaListUl, FaTimes } from "react-icons/fa";
import PlayPauseButton from "./PlayPauseButton";
import Footer from "./Footer";

// Định dạng thời lượng bài hát thành phút:giây.
const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

//Tính tổng thời lượng toàn bộ bài hát trong playlist (trả về “x phút y giây”).
const formatTotalDuration = (songs) => {
    if (!songs || songs.length === 0) return "0 phút";
    const totalSeconds = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.floor(totalSeconds % 60);

    if (totalMinutes === 0) return `${remainingSeconds} giây`;
    if (remainingSeconds === 0) return `${totalMinutes} phút`;
    return `${totalMinutes} phút ${remainingSeconds} giây`;
};

export default function PlaylistDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [playlist, setPlaylist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);

    const [artists, setArtists] = useState([]);
    const [albums, setAlbums] = useState([]);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState("");
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [tempDesc, setTempDesc] = useState("");
    const [isOwner, setIsOwner] = useState(false);

    // Lấy tên nghệ sĩ tương ứng từ danh sách artists.
    const getArtistName = (id) => artists.find(a => a.id == id)?.name || "Unknown Artist";
    // Lấy tên album tương ứng từ danh sách albums.
    const getAlbumTitle = (id) => albums.find(a => a.id == id)?.title || "Unknown Album";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const playlistRes = await axios.get(`http://localhost:9000/playlists/${id}`);
                const currentPlaylist = playlistRes.data;
                setPlaylist(playlistRes.data);

                setTempTitle(currentPlaylist.name);
                setTempDesc(currentPlaylist.description);

                const ownerRes = await axios.get(
                    `http://localhost:9000/users/${playlistRes.data.userId}`
                );
                setOwner(ownerRes.data);

                if (currentUser && currentUser.id == currentPlaylist.userId) {
                    setIsOwner(true);
                } else {
                    setIsOwner(false);
                }

                const songIds = playlistRes.data.songIds || [];
                if (songIds.length > 0) {
                    const songPromises = songIds.map(songId =>
                        axios.get(`http://localhost:9000/songs/${songId}`).then(res => res.data)
                    );
                    const playlistSongs = await Promise.all(songPromises);
                    setSongs(playlistSongs);
                } else {
                    setSongs([]);
                }

                const [artistsRes, albumsRes] = await Promise.all([
                    axios.get(`http://localhost:9000/artists`),
                    axios.get(`http://localhost:9000/albums`)
                ]);
                setArtists(artistsRes.data);
                setAlbums(albumsRes.data);

            } catch (err) {
                console.error("Lỗi tải dữ liệu playlist:", err);
                navigate("/");
            }
            setLoading(false);
        };

        fetchData();
    }, [id, navigate, currentUser]);

    //Cho phép chủ playlist chỉnh sửa tên hoặc mô tả playlist.
//Gửi yêu cầu PATCH đến /playlists/:id để cập nhật dữ liệu.
//Cập nhật lại state và giao diện sau khi lưu thành công.
    const handleSaveDetails = async (field, value) => {
        if (!isOwner) return;

        try {
            const res = await axios.patch(`http://localhost:9000/playlists/${id}`, {
                [field]: value
            });

            setPlaylist(res.data);

            if (field === 'name') {
                window.dispatchEvent(new CustomEvent("playlistUpdated"));
            }

        } catch (err) {
            console.error("Lỗi khi cập nhật playlist:", err);
            setTempTitle(playlist.name);
            setTempDesc(playlist.description);
        }

        if (field === 'name') setIsEditingTitle(false);
        if (field === 'description') setIsEditingDesc(false);
    };

    //Xóa bài hát khỏi playlist bằng cách lọc songIds và gửi yêu cầu PATCH.
//Cập nhật lại danh sách hiển thị sau khi xóa.
    const handleRemoveSong = async (songId, event) => {
        event.stopPropagation();
        if (!isOwner) return;

        const newSongIds = playlist.songIds.filter(sid => sid !== songId);

        try {
            await axios.patch(`http://localhost:9000/playlists/${id}`, {
                songIds: newSongIds
            });

            setSongs(currentSongs => currentSongs.filter(s => s.id !== songId));
            setPlaylist(currentPlaylist => ({ ...currentPlaylist, songIds: newSongIds }));

        } catch (err) {
            console.error("Lỗi khi xóa bài hát khỏi playlist:", err);
            alert("Không thể xóa bài hát. Vui lòng thử lại.");
        }
    };

    if (loading || !playlist || !owner) {
        return (
            <div className="text-white text-center" style={{ marginTop: "100px" }}>
                Đang tải...
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
                    background: "linear-gradient(to bottom, #114a3b, #121212 40%)",
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
                                    background: `url(${playlist.coverImg}) center center / cover no-repeat #333`,
                                    borderRadius: 6,
                                }}
                            >
                                {!playlist.coverImg && <FaListUl size={100} color="white" />}
                            </div>
                        </Col>
                        <Col xs={12} md={8} lg={9} className="mt-4 mt-md-0 text-center text-md-start">
                            <p className="text-uppercase small fw-bold text-white-50">
                                Playlist
                            </p>
                            {isEditingTitle ? (
                                <Form.Control
                                    type="text"
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    onBlur={() => handleSaveDetails('name', tempTitle)} // Lưu khi mất focus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveDetails('name', tempTitle)} // Lưu khi nhấn Enter
                                    autoFocus // Tự động focus
                                    className="bg-dark text-white border-0 display-3 fw-bolder mb-2"
                                    style={{ lineHeight: 1.1, padding: '0.5rem 0.75rem', fontSize: '3rem' }} // Tùy chỉnh style
                                />
                            ) : (
                                <h1
                                    className="display-3 fw-bolder mb-2 editable-field"
                                    style={{ lineHeight: 1.1, cursor: isOwner ? 'pointer' : 'default' }}
                                    onClick={() => isOwner && setIsEditingTitle(true)} // Chỉ cho phép edit nếu là chủ
                                    title={isOwner ? "Nhấp để chỉnh sửa tên" : ""}
                                >
                                    {playlist.name}
                                </h1>
                            )}

                            {isEditingDesc ? (
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={tempDesc}
                                    onChange={(e) => setTempDesc(e.target.value)}
                                    onBlur={() => handleSaveDetails('description', tempDesc)}
                                    autoFocus
                                    className="bg-dark text-white border-0 text-white-50 mb-3"
                                    style={{ resize: 'none' }} // Chặn thay đổi kích thước
                                />
                            ) : (
                                <p
                                    className="text-white-50 mb-3 editable-field"
                                    style={{ cursor: isOwner ? 'pointer' : 'default', minHeight: '24px' }} // Đảm bảo có chiều cao tối thiểu
                                    onClick={() => isOwner && setIsEditingDesc(true)}
                                    title={isOwner ? "Nhấp để chỉnh sửa mô tả" : ""}
                                >
                                    {playlist.description || (isOwner ? "Nhấp để thêm mô tả..." : "")}
                                </p>
                            )}

                            <div className="d-flex align-items-center justify-content-center justify-content-md-start small text-white-50">
                                <span className="fw-bold text-white">{owner.username}</span>
                                <span className="mx-2">•</span>
                                <span>{songs.length} bài hát,</span>
                                <span className="ms-1 text-white-50">{formatTotalDuration(songs)}</span>
                            </div>
                        </Col>
                    </Row>
                </Container>

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
                            title={`Phát playlist ${playlist.name}`}
                        >
                            {/* TODO: Nâng cấp logic này để phát cả danh sách */}
                            <PlayPauseButton song={songs[0]} />
                        </div>
                    ) : (
                        <p className="px-lg-5">Playlist này chưa có bài hát nào.</p>
                    )}
                </Container>

                {songs.length > 0 && (
                    <Container fluid className="px-lg-5 pb-5">
                        <Row className="border-bottom border-secondary-subtle py-2 text-white-50 d-none d-md-flex">
                            <Col md={1} className="text-center">#</Col>
                            <Col md={4}>Tiêu đề</Col>
                            <Col md={3}>Nghệ sĩ</Col>
                            <Col md={2}>Album</Col> 
                            <Col md={1} className="text-end"> <FaRegClock /> </Col>
                            <Col md={1}></Col>
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

                                        <Col xs={7} md={4} className="d-flex align-items-center">
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
                                        <Col md={3} className="d-none d-md-block text-truncate">
                                            <span
                                                className="artist-link"
                                                onClick={(e) => { e.stopPropagation(); navigate(`/artist/${song.artistId}`) }}
                                            >
                                                {getArtistName(song.artistId)}
                                            </span>
                                        </Col>

                                        <Col md={2} className="d-none d-md-block text-truncate"> 
                                            <span
                                                className="artist-link"
                                                onClick={(e) => { e.stopPropagation(); navigate(`/album/${song.albumId}`) }}
                                            >
                                                {getAlbumTitle(song.albumId)}
                                            </span>
                                        </Col>

                                        <Col xs={2} md={1} className="text-end small">
                                            {formatTime(song.duration)}
                                        </Col>

                                        <Col xs={2} md={1} className="text-center">
                                            {isOwner && (
                                                <FaTimes
                                                    className="remove-song-btn"
                                                    title={`Xóa ${song.title} khỏi playlist`}
                                                    onClick={(e) => handleRemoveSong(song.id, e)}
                                                />
                                            )}
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
                .editable-field:hover {
                        ${isOwner ? 'background-color: rgba(255,255,255,0.1);' : ''}
                        border-radius: 4px;
                    }
                .remove-song-btn {
                    cursor: pointer;
                    visibility: hidden; /* Ẩn mặc định */
                }
                .album-track-row:hover .remove-song-btn {
                    visibility: visible; /* Hiện khi hover cả hàng */
                }
                .remove-song-btn:hover {
                    color: #fff; /* Sáng lên khi hover */
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </>
    );
}