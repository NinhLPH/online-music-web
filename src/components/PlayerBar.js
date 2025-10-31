import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    FaPlay,
    FaPause,
    FaStepForward,
    FaStepBackward,
    FaRedoAlt,
    FaListUl,
    FaVolumeUp,
    FaExpandAlt,
    FaPlus,
    FaCheck,
} from "react-icons/fa";
import { useQueue } from "../context/QueueContext";

const PlayerBar = ({ onShowSongDetail }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(70);
    const [favorites, setFavorites] = useState([]);
    const [toast, setToast] = useState(null);
    const [confirmBox, setConfirmBox] = useState(null);
    const audioRef = useRef(null);

    const { toggleQueue, currentSong, setSongList, nextSong, playPrevSong } = useQueue();

    // 🧩 Tải danh sách bài hát & nghệ sĩ chỉ 1 lần duy nhất
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [songRes, artistRes] = await Promise.all([
                    axios.get("http://localhost:9000/songs"),
                    axios.get("http://localhost:9000/artists"),
                ]);
                const artists = artistRes.data;
                const songsWithArtist = songRes.data.map((song) => {
                    const artist = artists.find((a) => Number(a.id) === Number(song.artistId));
                    return { ...song, artist: artist ? artist.name : "Unknown Artist" };
                });
                setSongList(songsWithArtist);
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // ✅ chạy đúng 1 lần

    // 🧩 Lấy danh sách yêu thích ban đầu
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await axios.get("http://localhost:9000/users/1");
                setFavorites(res.data.favorites || []);
            } catch (err) {
                console.error("Lỗi tải danh sách yêu thích:", err);
            }
        };
        fetchFavorites();
    }, []);

    // ✅ Cập nhật realtime khi RightSidebar thay đổi
    useEffect(() => {
        const handleFavoritesUpdated = (e) => setFavorites(e.detail);
        window.addEventListener("favoritesUpdated", handleFavoritesUpdated);
        return () => window.removeEventListener("favoritesUpdated", handleFavoritesUpdated);
    }, []);

    // 🧩 Khi bài hát thay đổi
    useEffect(() => {
        if (!currentSong || !audioRef.current) return;
        const audio = audioRef.current;
        audio.src = currentSong.src;
        audio.load();
        audio.onloadedmetadata = () => setDuration(audio.duration);

        if (isPlaying) {
            audio.play().catch((err) => console.error("Không thể phát bài:", err));
        } else {
            audio.pause();
        }
    }, [currentSong, isPlaying]);

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (audio && duration > 0) setProgress((audio.currentTime / duration) * 100);
    };

    const handleSeekClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = (clickX / rect.width) * 100;
        const newTime = (percent / 100) * duration;
        audioRef.current.currentTime = newTime;
        setProgress(percent);
    };

    const handleVolumeClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = (clickX / rect.width) * 100;
        setVolume(percent);
        if (audioRef.current) audioRef.current.volume = percent / 100;
    };

    const replaySong = () => {
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    const formatTime = (sec) => {
        if (!sec || isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    if (!currentSong) return null;

    // ✅ Hiển thị thông báo
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    };

    // ❤️ Toggle yêu thích (DB thật)
    const toggleFavorite = async () => {
        try {
            const res = await axios.get("http://localhost:9000/users/1");
            const user = res.data;
            const isFav = user.favorites?.includes(currentSong.id);

            if (isFav) {
                setConfirmBox({
                    message: "Bạn có chắc muốn bỏ khỏi danh sách yêu thích?",
                    onConfirm: async () => {
                        const updated = user.favorites.filter((id) => id !== currentSong.id);
                        await axios.patch("http://localhost:9000/users/1", { favorites: updated });
                        setFavorites(updated);
                        window.dispatchEvent(new CustomEvent("favoritesUpdated", { detail: updated }));
                        setConfirmBox(null);
                        showToast("Đã xóa khỏi yêu thích");
                    },
                    onCancel: () => setConfirmBox(null),
                });
            } else {
                const updated = [...(user.favorites || []), currentSong.id];
                await axios.patch("http://localhost:9000/users/1", { favorites: updated });
                setFavorites(updated);
                window.dispatchEvent(new CustomEvent("favoritesUpdated", { detail: updated }));
                showToast(`Đã thêm "${currentSong.title}" vào yêu thích`);
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật yêu thích:", err);
            showToast("Không thể cập nhật danh sách yêu thích");
        }
    };

    const iconBtn = {
        background: "none",
        border: "none",
        color: "#fff",
        fontSize: "18px",
        cursor: "pointer",
        transition: "color 0.2s ease",
    };
    const hoverIn = (e) => (e.currentTarget.style.color = "#1db954");
    const hoverOut = (e) => (e.currentTarget.style.color = "#fff");

    const isFavorite = favorites.includes(currentSong.id);

    return (
        <>
            {/* 🔔 Toast */}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "100px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#1db954",
                        color: "#fff",
                        padding: "8px 16px",
                        borderRadius: 8,
                        zIndex: 1100,
                        fontWeight: 500,
                    }}
                >
                    {toast}
                </div>
            )}

            {/* 🧩 Confirm box */}
            {confirmBox && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "110px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#222",
                        color: "#fff",
                        padding: "12px 18px",
                        borderRadius: 10,
                        zIndex: 1200,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 280,
                    }}
                >
                    <div style={{ fontSize: "0.95rem" }}>{confirmBox.message}</div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            onClick={confirmBox.onConfirm}
                            style={{
                                background: "#1db954",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "4px 12px",
                            }}
                        >
                            Đồng ý
                        </button>
                        <button
                            onClick={confirmBox.onCancel}
                            style={{
                                background: "#444",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "4px 12px",
                            }}
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* 🎵 Player */}
            <div
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "90px",
                    backgroundColor: "#000",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px",
                    borderTop: "1px solid #222",
                    zIndex: 1000,
                }}
            >
                {/* Bên trái: thông tin bài */}
                <div className="d-flex align-items-center" style={{ width: "25%" }}>
                    <img
                        src={`https://picsum.photos/seed/${currentSong.id}/80`}
                        alt="cover"
                        onClick={() => onShowSongDetail && onShowSongDetail(currentSong)}
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 4,
                            marginRight: 10,
                            cursor: "pointer",
                        }}
                    />
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
                            <span
                                onClick={() => onShowSongDetail && onShowSongDetail(currentSong)}
                                style={{ cursor: "pointer" }}
                            >
                                {currentSong.title}
                            </span>
                            <button
                                onClick={toggleFavorite}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: isFavorite ? "#1db954" : "#fff",
                                }}
                            >
                                {isFavorite ? <FaCheck /> : <FaPlus />}
                            </button>
                        </div>
                        <div style={{ color: "#b3b3b3", fontSize: "0.8rem" }}>
                            {currentSong.artist || "Unknown Artist"}
                        </div>
                    </div>
                </div>

                {/* Giữa: điều khiển */}
                <div className="d-flex flex-column align-items-center" style={{ width: "50%" }}>
                    <div className="d-flex align-items-center mb-2" style={{ gap: 18 }}>
                        <button
                            title="Previous"
                            style={iconBtn}
                            onClick={playPrevSong}
                            onMouseEnter={hoverIn}
                            onMouseLeave={hoverOut}
                        >
                            <FaStepBackward />
                        </button>

                        <button
                            title={isPlaying ? "Pause" : "Play"}
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{ ...iconBtn, fontSize: 28 }}
                            onMouseEnter={hoverIn}
                            onMouseLeave={hoverOut}
                        >
                            {isPlaying ? <FaPause /> : <FaPlay />}
                        </button>

                        <button
                            title="Next"
                            style={iconBtn}
                            onClick={nextSong}
                            onMouseEnter={hoverIn}
                            onMouseLeave={hoverOut}
                        >
                            <FaStepForward />
                        </button>

                        <button
                            title="Replay song"
                            style={iconBtn}
                            onClick={replaySong}
                            onMouseEnter={hoverIn}
                            onMouseLeave={hoverOut}
                        >
                            <FaRedoAlt />
                        </button>
                    </div>

                    {/* Thanh tiến trình */}
                    <div style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: 500 }}>
                        <span style={{ fontSize: "0.75rem", color: "#b3b3b3", width: 35, textAlign: "right" }}>
                            {formatTime(audioRef.current?.currentTime || 0)}
                        </span>
                        <div
                            onClick={handleSeekClick}
                            style={{
                                flex: 1,
                                height: 3,
                                background: "#404040",
                                borderRadius: 2,
                                margin: "0 10px",
                                cursor: "pointer",
                            }}
                        >
                            <div
                                style={{
                                    width: `${progress}%`,
                                    height: "100%",
                                    background: "#1db954",
                                    borderRadius: 2,
                                }}
                            ></div>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#b3b3b3", width: 35 }}>
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Bên phải: volume + queue */}
                <div className="d-flex align-items-center justify-content-end" style={{ width: "25%", gap: 12 }}>
                    <button
                        title="Danh sách chờ"
                        onClick={toggleQueue}
                        style={iconBtn}
                        onMouseEnter={hoverIn}
                        onMouseLeave={hoverOut}
                    >
                        <FaListUl />
                    </button>

                    <FaVolumeUp style={iconBtn} />
                    <div
                        onClick={handleVolumeClick}
                        style={{
                            width: 90,
                            height: 3,
                            background: "#404040",
                            borderRadius: 2,
                            cursor: "pointer",
                        }}
                    >
                        <div
                            style={{
                                width: `${volume}%`,
                                height: "100%",
                                background: "#1db954",
                                borderRadius: 2,
                            }}
                        ></div>
                    </div>

                    <FaExpandAlt style={iconBtn} />
                </div>

                <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={nextSong} />
            </div>
        </>
    );
};

export default PlayerBar;
