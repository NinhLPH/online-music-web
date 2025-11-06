import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaPlus, FaTimes, FaCheck } from "react-icons/fa";
import PlayPauseButton from "./PlayPauseButton";

function SongDetail({ song }) {
    const [artist, setArtist] = useState(null);
    const [album, setAlbum] = useState(null);
    const [isFav, setIsFav] = useState(false);
    const [toast, setToast] = useState(null);
    const [lyrics, setLyrics] = useState("");
    const [showLyrics, setShowLyrics] = useState(false);
    const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [inAnyPlaylist, setInAnyPlaylist] = useState(false); // ✅ kiểm tra đã trong playlist nào chưa

    useEffect(() => {
        if (!song) return;

        const fetchData = async () => {
            try {
                const [artistRes, albumRes, userRes, songRes, playlistsRes] =
                    await Promise.all([
                        axios.get(`http://localhost:9000/artists/${song.artistId}`),
                        axios.get(`http://localhost:9000/albums/${song.albumId}`),
                        axios.get(`http://localhost:9000/users/1`),
                        axios.get(`http://localhost:9000/songs/${song.id}`),
                        axios.get(`http://localhost:9000/playlists?userId=1`),
                    ]);

                setArtist(artistRes.data);
                setAlbum(albumRes.data);
                setIsFav(userRes.data.favorites?.includes(song.id));
                setLyrics(songRes.data.lyrics || "Chưa có lời bài hát cho bài này.");
                setPlaylists(playlistsRes.data);

                // ✅ Kiểm tra bài hát có nằm trong playlist nào không
                const isInPlaylist = playlistsRes.data.some((pl) =>
                    pl.songIds.includes(song.id)
                );
                setInAnyPlaylist(isInPlaylist);
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
            }
        };

        fetchData();
    }, [song]);

    useEffect(() => {
        const handleFavoritesUpdated = (e) => {
            const updated = e.detail;
            setIsFav(updated.includes(song.id));
        };
        window.addEventListener("favoritesUpdated", handleFavoritesUpdated);
        return () =>
            window.removeEventListener("favoritesUpdated", handleFavoritesUpdated);
    }, [song]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    };

    const toggleFavorite = async () => {
        try {
            const res = await axios.get(`http://localhost:9000/users/1`);
            const user = res.data;
            const favorites = user.favorites || [];
            let updatedFavorites;

            if (favorites.includes(song.id)) {
                updatedFavorites = favorites.filter((id) => id !== song.id);
                setIsFav(false);
                showToast(`Đã xóa "${song.title}" khỏi yêu thích`);
            } else {
                updatedFavorites = [...favorites, song.id];
                setIsFav(true);
                showToast(`Đã thêm "${song.title}" vào yêu thích`);
            }

            await axios.patch(`http://localhost:9000/users/1`, {
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

    const openPlaylistPopup = async () => {
        try {
            const res = await axios.get(`http://localhost:9000/playlists?userId=1`);
            setPlaylists(res.data);
            setShowPlaylistPopup(true);
        } catch (err) {
            console.error("Không thể tải playlist:", err);
        }
    };

    const toggleInPlaylist = async (playlistId) => {
        try {
            const res = await axios.get(`http://localhost:9000/playlists/${playlistId}`);
            const playlist = res.data;

            let updatedSongs;
            let message = "";

            if (playlist.songIds.includes(song.id)) {
                // ✅ Nếu đã có → xóa khỏi playlist
                updatedSongs = playlist.songIds.filter((id) => id !== song.id);
                message = `Đã xóa "${song.title}" khỏi playlist "${playlist.name}"`;
            } else {
                // ✅ Nếu chưa có → thêm vào playlist
                updatedSongs = [...playlist.songIds, song.id];
                message = `Đã thêm "${song.title}" vào playlist "${playlist.name}"`;
            }

            await axios.patch(`http://localhost:9000/playlists/${playlistId}`, {
                songIds: updatedSongs,
            });

            // ✅ Cập nhật lại trạng thái icon
            const playlistsRes = await axios.get(`http://localhost:9000/playlists?userId=1`);
            setPlaylists(playlistsRes.data);

            const isInPlaylist = playlistsRes.data.some((pl) =>
                pl.songIds.includes(song.id)
            );
            setInAnyPlaylist(isInPlaylist);

            setShowPlaylistPopup(false);
            showToast(message);
        } catch (err) {
            console.error("Lỗi khi thêm/hủy khỏi playlist:", err);
            showToast("Không thể cập nhật playlist");
        }
    };

    if (!song) return null;

    const bgImage = `https://picsum.photos/seed/${song.id}/1000`;

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 999,
                color: "#fff",
                overflowY: "auto",
                background: `url(${bgImage}) center center / cover no-repeat`,
                animation: "fadeIn 0.3s ease",
                paddingBottom: 100,
                backdropFilter: "blur(50px)",
            }}
        >
            {/* Overlay mờ */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.6), #121212 80%)",
                    filter: "blur(20px)",
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

                {/* ✅ Nút thêm/hủy playlist */}
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
                        inAnyPlaylist ? "Bài hát đã nằm trong playlist" : "Thêm vào playlist"
                    }
                >
                    {inAnyPlaylist ? <FaCheck /> : <FaPlus />}
                </button>
            </div>

            {/* Lời bài hát */}
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

            {/* Popup chọn playlist */}
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
                                    {pl.songIds.includes(song.id) && (
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

            <style>
                {`
          ::-webkit-scrollbar { display: none; }
          * { scrollbar-width: none; }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
            </style>
        </div>
    );
}

export default SongDetail;
