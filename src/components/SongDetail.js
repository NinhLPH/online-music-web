import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaHeart, FaPlus, FaTimes, FaCheck, FaEllipsisH } from "react-icons/fa";
import PlayPauseButton from "./PlayPauseButton";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext"; // ✅ dùng context
import { useQueue } from "../context/QueueContext";

function SongDetail() {
    const { id } = useParams();
    const { currentUser } = useAuth(); // ✅ lấy user hiện tại
    const { addToQueue } = useQueue();
    const navigate = useNavigate();

    const [song, setSong] = useState(null);
    const [artist, setArtist] = useState(null);
    const [album, setAlbum] = useState(null);
    const [isFav, setIsFav] = useState(false);
    const [toast, setToast] = useState(null);
    const [lyrics, setLyrics] = useState("");
    const [showLyrics, setShowLyrics] = useState(false);
    const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [actionsMenuPosition, setActionsMenuPosition] = useState({ x: 0, y: 0 });
    const [playlists, setPlaylists] = useState([]);
    const [inAnyPlaylist, setInAnyPlaylist] = useState(false);


    // ✅ Tải dữ liệu bài hát + liên quan
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [songRes, artistRes, albumRes] = await Promise.all([
                    axios.get(`http://localhost:9000/songs/${id}`),
                    axios.get(`http://localhost:9000/artists?songId=${id}`),
                    axios.get(`http://localhost:9000/albums?songId=${id}`),
                ]);

                const currentSong = songRes.data;
                setSong(currentSong);
                setArtist(artistRes.data[0] || artistRes.data || null);
                setAlbum(albumRes.data[0] || albumRes.data || null);
                setLyrics(currentSong.lyrics || "Chưa có lời bài hát cho bài này.");

                // Nếu có user đăng nhập thì tải thêm thông tin
                if (currentUser) {
                    const [userRes, playlistsRes] = await Promise.all([
                        axios.get(`http://localhost:9000/users/${currentUser.id}`),
                        axios.get(
                            `http://localhost:9000/playlists?userId=${currentUser.id}`
                        ),
                    ]);

                    setIsFav(userRes.data.favorites?.includes(Number(id)));
                    setPlaylists(playlistsRes.data);

                    const isInPlaylist = playlistsRes.data.some((pl) =>
                        pl.songIds.includes(Number(id))
                    );
                    setInAnyPlaylist(isInPlaylist);
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu bài hát:", err);
            }
        };

        fetchData();
    }, [id, currentUser]);

    // ✅ Lắng nghe thay đổi favorites toàn cục
    useEffect(() => {
        const handleFavoritesUpdated = (e) => {
            const updated = e.detail;
            setIsFav(updated.includes(Number(id)));
        };
        window.addEventListener("favoritesUpdated", handleFavoritesUpdated);
        return () =>
            window.removeEventListener("favoritesUpdated", handleFavoritesUpdated);
    }, [id]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    };

    // ✅ Thêm / xóa yêu thích theo currentUser
    const toggleFavorite = async () => {
        if (!currentUser) {
            showToast("Vui lòng đăng nhập để dùng tính năng này");
            return;
        }

        try {
            const res = await axios.get(
                `http://localhost:9000/users/${currentUser.id}`
            );
            const user = res.data;
            const favorites = user.favorites || [];
            let updatedFavorites;

            if (favorites.includes(Number(id))) {
                updatedFavorites = favorites.filter((fid) => fid !== Number(id));
                setIsFav(false);
                showToast(`Đã xóa "${song?.title}" khỏi yêu thích`);
            } else {
                updatedFavorites = [...favorites, Number(id)];
                setIsFav(true);
                showToast(`Đã thêm "${song?.title}" vào yêu thích`);
            }

            await axios.patch(`http://localhost:9000/users/${currentUser.id}`, {
                favorites: updatedFavorites,
            });

            window.dispatchEvent(
                new CustomEvent("favoritesUpdated", { detail: updatedFavorites })
            );
        } catch (err) {
            console.error("Không thể cập nhật yêu thích:", err);
            showToast("Lỗi khi cập nhật danh sách yêu thích");
        }
    };

    // ✅ Hiện popup playlist
    const openPlaylistPopup = async () => {
        if (!currentUser) {
            showToast("Vui lòng đăng nhập để dùng tính năng này");
            return;
        }

        try {
            const res = await axios.get(
                `http://localhost:9000/playlists?userId=${currentUser.id}`
            );
            setPlaylists(res.data);
            setShowPlaylistPopup(true);
        } catch (err) {
            console.error("Không thể tải playlist:", err);
        }
    };

    // ✅ Thêm / xóa bài hát khỏi playlist
    const toggleInPlaylist = async (playlistId) => {
        try {
            const res = await axios.get(
                `http://localhost:9000/playlists/${playlistId}`
            );
            const playlist = res.data;

            let updatedSongs;
            let message = "";

            if (playlist.songIds.includes(Number(id))) {
                updatedSongs = playlist.songIds.filter((sid) => sid !== Number(id));
                message = `Đã xóa "${song?.title}" khỏi playlist "${playlist.name}"`;
            } else {
                updatedSongs = [...playlist.songIds, Number(id)];
                message = `Đã thêm "${song?.title}" vào playlist "${playlist.name}"`;
            }

            await axios.patch(`http://localhost:9000/playlists/${playlistId}`, {
                songIds: updatedSongs,
            });

            const playlistsRes = await axios.get(
                `http://localhost:9000/playlists?userId=${currentUser.id}`
            );
            setPlaylists(playlistsRes.data);

            const isInPlaylist = playlistsRes.data.some((pl) =>
                pl.songIds.includes(Number(id))
            );
            setInAnyPlaylist(isInPlaylist);
            setShowPlaylistPopup(false);
            showToast(message);
        } catch (err) {
            console.error("Lỗi khi thêm/hủy khỏi playlist:", err);
            showToast("Không thể cập nhật playlist");
        }
    };

    const handleAddToQueue = () => {
        addToQueue(song);
        showToast(`Đã thêm "${song?.title}" vào danh sách chờ`);
        setShowActionsMenu(false);
    };

    const handleGoToArtist = () => {
        if (!artist) return;
        navigate(`/artist/${artist.id}`);
        setShowActionsMenu(false);
    };

    const handleGoToAlbum = () => {
        if (!album) return;
        navigate(`/album/${album.id}`);
        setShowActionsMenu(false);
    };

    if (!song)
        return (
            <div style={{ color: "#fff", textAlign: "center", marginTop: "100px" }}>
                Đang tải bài hát...
            </div>
        );

    const bgImage = `https://picsum.photos/seed/${song.id}/1000`;

    return (

        <div
            style={{
                color: "#fff",
                overflowY: "auto",
                minHeight: "calc(100vh - 160px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: `url(${bgImage}) center center / cover no-repeat`,
                animation: "fadeIn 0.3s ease",
                paddingBottom: "100px",
                backdropFilter: "blur(40px)",
            }}
        >
            {/* Overlay mờ */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.6), #121212 80%)",
                    zIndex: -1,
                }}
            />

            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "60px 80px 40px",
                    gap: 40,
                }}
            >
                <img
                    src={`https://picsum.photos/seed/${song.id}/320`}
                    alt={song.title}
                    style={{
                        width: 260,
                        height: 260,
                        borderRadius: 6,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                        objectFit: "cover",
                    }}
                />
                <div>
                    <p style={{ textTransform: "uppercase", fontSize: 14, color: "#ddd" }}>
                        Đĩa đơn
                    </p>
                    <h1
                        style={{
                            fontSize: 72,
                            fontWeight: "900",
                            margin: "10px 0",
                            lineHeight: 1.1,
                        }}
                    >
                        {song.title}
                    </h1>
                    {song.isPremium && (
                        <p style={{ color: "#ff4d4f", fontWeight: "600", marginTop: 8 }}>
                            🔒 Chỉ dành cho tài khoản Premium
                        </p>
                    )}


                    <div style={{ color: "#b3b3b3", fontSize: 16 }}>
                        {artist ? artist.name : "Đang tải..."} •{" "}
                        {album ? album.releaseYear : "----"} •{" "}
                        {album ? album.title : "Không rõ album"}
                    </div>
                </div>
            </div>

            {/* Điều khiển */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 25,
                    padding: "20px 80px",
                }}
            >
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
                >
                    <PlayPauseButton song={song} />
                </div>

                {/* Chỉ hiển thị khi user đã login */}
                {currentUser && (
                    <>
                        <button
                            onClick={toggleFavorite}
                            style={{
                                background: "none",
                                border: "none",
                                color: isFav ? "#1db954" : "#fff",
                                fontSize: 26,
                                cursor: "pointer",
                            }}
                            title={isFav ? "Đã yêu thích" : "Thêm vào yêu thích"}
                        >
                            <FaHeart />
                        </button>

                        <button
                            onClick={openPlaylistPopup}
                            style={{
                                background: "none",
                                border: "none",
                                color: inAnyPlaylist ? "#1db954" : "#fff",
                                fontSize: 22,
                                cursor: "pointer",
                                transition: "color 0.3s ease",
                            }}
                            title={
                                inAnyPlaylist
                                    ? "Bài hát đã nằm trong playlist"
                                    : "Thêm vào playlist"
                            }
                        >
                            {inAnyPlaylist ? <FaCheck /> : <FaPlus />}
                        </button>

                        <div style={{ position: "relative", display: "inline-block" }}>
                            <button
                                onClick={() => setShowActionsMenu(!showActionsMenu)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#fff",
                                    fontSize: 22,
                                    cursor: "pointer",
                                }}
                                title="Tác vụ khác"
                            >
                                <FaEllipsisH />
                            </button>

                            {showActionsMenu && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "100%",
                                        right: 0,
                                        marginTop: 6,
                                        background: "#121212",
                                        borderRadius: 8,
                                        padding: "10px 0",
                                        width: 180,
                                        boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                                        zIndex: 999,
                                    }}
                                >
                                    <div className="popup-action-item" onClick={handleAddToQueue}>
                                        Thêm vào danh sách chờ
                                    </div>
                                    <div
                                        className={`popup-action-item ${!album ? 'disabled' : ''}`}
                                        onClick={album ? handleGoToAlbum : null}
                                    >
                                        Đi đến album
                                    </div>
                                    <div
                                        className={`popup-action-item ${!artist ? 'disabled' : ''}`}
                                        onClick={artist ? handleGoToArtist : null}
                                    >
                                        Đi đến nghệ sĩ
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Nút hiện lời */}
            <div style={{ padding: "0 80px", marginTop: 40 }}>
                <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    style={{
                        background: showLyrics ? "#1db954" : "none",
                        color: showLyrics ? "#000" : "#1db954",
                        border: "2px solid #1db954",
                        padding: "10px 25px",
                        borderRadius: 30,
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                    }}
                >
                    {showLyrics ? "Ẩn lời bài hát ▲" : "Hiện lời bài hát ▼"}
                </button>
            </div>

            {showLyrics && (
                <div
                    style={{
                        background: "#000",
                        color: "#fff",
                        padding: "50px 100px",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                        fontSize: 16,
                        minHeight: "60vh",
                        textAlign: "center",
                        animation: "fadeIn 0.4s ease",
                    }}
                >
                    <div style={{ maxWidth: 800, margin: "0 auto" }}>{lyrics}</div>
                </div>
            )}

            {/* Popup playlist */}
            {showPlaylistPopup && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 2000,
                        animation: "fadeIn 0.3s ease",
                    }}
                >
                    <div
                        style={{
                            background: "#121212",
                            borderRadius: 10,
                            padding: 30,
                            width: 400,
                            boxShadow: "0 0 15px rgba(0,0,0,0.5)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 15,
                            }}
                        >
                            <h3>Chọn playlist</h3>
                            <button
                                onClick={() => setShowPlaylistPopup(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#fff",
                                    fontSize: 18,
                                    cursor: "pointer",
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {playlists.length > 0 ? (
                            playlists.map((pl) => (
                                <div
                                    key={pl.id}
                                    onClick={() => toggleInPlaylist(pl.id)}
                                    style={{
                                        padding: "12px 15px",
                                        marginBottom: 8,
                                        borderRadius: 8,
                                        background: "#1a1a1a",
                                        cursor: "pointer",
                                        transition: "0.2s",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background = "#2a2a2a")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = "#1a1a1a")
                                    }
                                >
                                    <span>{pl.name}</span>
                                    {pl.songIds.includes(Number(id)) && (
                                        <FaCheck color="#1db954" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>Không có playlist nào.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 120,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#333",
                        padding: "10px 18px",
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: 14,
                        opacity: 0.9,
                        zIndex: 2000,
                    }}
                >
                    {toast}
                </div>
            )}

            <Footer />

            <style>
                {`
                    ::-webkit-scrollbar { display: none; }
                    * { scrollbar-width: none; }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .popup-action-item {
                        padding: 12px 15px;
                        margin-bottom: 8px;
                        border-radius: 8px;
                        background: #1a1a1a;
                        cursor: pointer;
                        transition: 0.2s;
                    }
                    .popup-action-item:hover {
                        background: #2a2a2a;
                    }
                    .popup-action-item.disabled {
                        color: #555;
                        cursor: not-allowed;
                        background: #111;
                    }
                `}
            </style>
        </div>
    );
}

export default SongDetail;
