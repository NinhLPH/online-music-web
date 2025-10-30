import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    FaPlay,
    FaPause,
    FaStepForward,
    FaStepBackward,
    FaRandom,
    FaRedoAlt,
    FaListUl,
    FaVolumeUp,
    FaExpandAlt,
    FaPlus,
    FaCheck,
} from "react-icons/fa";
import { useQueue } from "../context/QueueContext";

const PlayerBar = () => {
    const [songs, setSongs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(70);
    const [favorites, setFavorites] = useState([]);
    const [toast, setToast] = useState(null);
    const [confirmBox, setConfirmBox] = useState(null);
    const audioRef = useRef(null);

    const { toggleQueue, currentSong, setNowPlaying } = useQueue();

    // 🧩 Tải danh sách bài hát & nghệ sĩ
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [songRes, artistRes] = await Promise.all([
                    axios.get("http://localhost:9000/songs"),
                    axios.get("http://localhost:9000/artists"),
                ]);

                const artists = artistRes.data;
                const songsWithArtist = songRes.data.map((song) => {
                    const artist = artists.find(
                        (a) => Number(a.id) === Number(song.artistId)
                    );
                    return { ...song, artist: artist ? artist.name : "Unknown Artist" };
                });

                setSongs(songsWithArtist);
            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
            }
        };

        fetchData();
    }, []);

    // 🧩 Tải danh sách yêu thích ban đầu từ DB
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

    useEffect(() => {
        if (songs.length > 0 && !currentSong) {
            setNowPlaying(songs[0], songs.slice(1));
            setCurrentIndex(0);
        }
    }, [songs, currentSong, setNowPlaying]);

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

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) audio.play().catch(() => { });
        else audio.pause();
    }, [isPlaying]);

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (audio && duration > 0)
            setProgress((audio.currentTime / duration) * 100);
    };

    const handleSeekClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = (clickX / rect.width) * 100;
        const audio = audioRef.current;
        const newTime = (percent / 100) * duration;
        audio.currentTime = newTime;
        setProgress(percent);
    };

    const handleVolumeClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = (clickX / rect.width) * 100;
        setVolume(percent);
        if (audioRef.current) audioRef.current.volume = percent / 100;
    };

    const nextSong = () => {
        if (!songs.length) return;
        setCurrentIndex((i) => {
            const next = (i + 1) % songs.length;
            const newSong = songs[next];
            setNowPlaying(newSong, songs.slice(next + 1));
            return next;
        });
        setIsPlaying(true);
    };

    const prevSong = () => {
        if (!songs.length) return;
        setCurrentIndex((i) => {
            const prev = i === 0 ? songs.length - 1 : i - 1;
            const newSong = songs[prev];
            setNowPlaying(newSong, songs.slice(prev + 1));
            return prev;
        });
        setIsPlaying(true);
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

    const current = currentSong || songs[currentIndex];
    if (!current) return null;

    // ✅ Hiển thị thông báo nhỏ (toast)
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    };

    // ❤️ Thêm hoặc xác nhận xóa khỏi yêu thích (liên kết DB thật)
    const toggleFavorite = async () => {
        try {
            const res = await axios.get("http://localhost:9000/users/1");
            const user = res.data;

            const isFav = user.favorites?.includes(current.id);

            if (isFav) {
                // mở hộp xác nhận xóa
                setConfirmBox({
                    message: "Bạn có chắc muốn bỏ khỏi danh sách yêu thích?",
                    onConfirm: async () => {
                        const updatedFavorites = user.favorites.filter(
                            (id) => id !== current.id
                        );

                        await axios.patch("http://localhost:9000/users/1", {
                            favorites: updatedFavorites,
                        });

                        setFavorites(updatedFavorites);
                        setConfirmBox(null);
                        showToast("Đã xóa khỏi danh sách yêu thích");
                    },
                    onCancel: () => setConfirmBox(null),
                });
            } else {
                const updatedFavorites = [
                    ...(user.favorites || []),
                    current.id,
                ];

                await axios.patch("http://localhost:9000/users/1", {
                    favorites: updatedFavorites,
                });

                setFavorites(updatedFavorites);
                showToast(`Đã thêm "${current.title}" vào danh sách yêu thích`);
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

    const isFavorite = favorites.includes(current.id);

    return (
        <>
            {/* 🔔 Thông báo nổi trên PlayerBar */}
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
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                        fontWeight: 500,
                    }}
                >
                    {toast}
                </div>
            )}

            {/* 🧩 Hộp xác nhận nhỏ */}
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
                        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        zIndex: 1200,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 280,
                        textAlign: "center",
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
                                cursor: "pointer",
                                fontWeight: 500,
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
                                cursor: "pointer",
                                fontWeight: 500,
                            }}
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* 🎵 Player chính */}
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
                {/* Bên trái: Thông tin bài hát */}
                <div className="d-flex align-items-center" style={{ width: "25%" }}>
                    <img
                        src={`https://picsum.photos/seed/${current.id}/80`}
                        alt="cover"
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 4,
                            marginRight: 10,
                        }}
                    />
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontWeight: 600,
                            }}
                        >
                            <span>{current.title}</span>
                            <button
                                onClick={toggleFavorite}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: isFavorite ? "#1db954" : "#fff",
                                }}
                                title={
                                    isFavorite
                                        ? "Đã trong danh sách yêu thích"
                                        : "Thêm vào yêu thích"
                                }
                            >
                                {isFavorite ? <FaCheck /> : <FaPlus />}
                            </button>
                        </div>
                        <div style={{ color: "#b3b3b3", fontSize: "0.8rem" }}>
                            {current.artist || "Unknown Artist"}
                        </div>
                    </div>
                </div>

                {/* Giữa: Điều khiển */}
                <div
                    className="d-flex flex-column align-items-center"
                    style={{ width: "50%" }}
                >
                    <div className="d-flex align-items-center mb-2" style={{ gap: 18 }}>
                        <button
                            title="Shuffle"
                            style={iconBtn}
                            onMouseEnter={hoverIn}
                            onMouseLeave={hoverOut}
                        >
                            <FaRandom />
                        </button>

                        <button
                            title="Previous"
                            style={iconBtn}
                            onClick={prevSong}
                            onMouseEnter={hoverIn}
                            onMouseLeave={hoverOut}
                        >
                            <FaStepBackward />
                        </button>

                        <button
                            title={isPlaying ? "Pause" : "Play"}
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{ ...iconBtn, fontSize: 28 }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#1db954")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
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
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            maxWidth: 500,
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.75rem",
                                color: "#b3b3b3",
                                width: 35,
                                textAlign: "right",
                            }}
                        >
                            {formatTime(audioRef.current?.currentTime || 0)}
                        </span>

                        <div
                            title="Click to seek"
                            onClick={handleSeekClick}
                            style={{
                                flex: 1,
                                height: 3,
                                background: "#404040",
                                borderRadius: 2,
                                margin: "0 10px",
                                cursor: "pointer",
                                position: "relative",
                            }}
                        >
                            <div
                                style={{
                                    width: `${progress}%`,
                                    height: "100%",
                                    background: "#1db954",
                                    borderRadius: 2,
                                    transition: "width 0.1s linear",
                                }}
                            ></div>
                        </div>

                        <span
                            style={{ fontSize: "0.75rem", color: "#b3b3b3", width: 35 }}
                        >
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Bên phải: Volume & Queue */}
                <div
                    className="d-flex align-items-center justify-content-end"
                    style={{ width: "25%", gap: 12 }}
                >
                    <button
                        title="Danh sách chờ"
                        onClick={() => toggleQueue()}
                        style={iconBtn}
                        onMouseEnter={hoverIn}
                        onMouseLeave={hoverOut}
                    >
                        <FaListUl />
                    </button>

                    <FaVolumeUp
                        title="Volume"
                        style={iconBtn}
                        onMouseEnter={hoverIn}
                        onMouseLeave={hoverOut}
                    />
                    <div
                        title="Click to change volume"
                        onClick={handleVolumeClick}
                        style={{
                            width: 90,
                            height: 3,
                            background: "#404040",
                            borderRadius: 2,
                            cursor: "pointer",
                            position: "relative",
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

                    <FaExpandAlt
                        title="Fullscreen"
                        style={iconBtn}
                        onMouseEnter={hoverIn}
                        onMouseLeave={hoverOut}
                    />
                </div>

                <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={nextSong}
                />
            </div>
        </>
    );
};

export default PlayerBar;
