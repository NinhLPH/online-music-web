import { FaPlay, FaPause } from "react-icons/fa";
import { useQueue } from "../context/QueueContext";
import { useAuth } from "../context/AuthContext";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ THÊM

/**
Nút Play/Pause dùng chung cho tất cả nơi (MainContent, SongDetail, v.v.)
Tự đồng bộ trạng thái phát thông qua QueueContext và PlayerBar.
*/
const PlayPauseButton = ({ song, showText = false }) => {
    const {
        currentSong,
        playSong,
        isPlaying,
        togglePlayPause,
    } = useQueue();

    const { currentUser } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);

    const navigate = useNavigate(); // ✅ THÊM

    // ✅ Xác định bài hiện tại
    const isCurrent = currentSong && currentSong.id === song.id;
    const playingThisSong = isCurrent && isPlaying;

    const handleClick = () => {
        if (!song) return;

        // 🧩 Kiểm tra quyền nghe
        if (song.isPremium) {
            const isPremiumUser =
                currentUser &&
                currentUser.subscription?.tier === "premium" &&
                currentUser.subscription?.status === "active";

            if (!isPremiumUser) {
                setShowModal(true); // 🧩 mở popup thay vì alert
                return;
            }
        }

        const isCurrent = currentSong && currentSong.id === song.id;
        if (!isCurrent) {
            playSong(song.id);
            window.dispatchEvent(new CustomEvent("playerSongChange", { detail: song }));
            window.dispatchEvent(new CustomEvent("playerPlay"));
            return;
        }

        togglePlayPause();
        window.dispatchEvent(new CustomEvent(isPlaying ? "playerPause" : "playerPlay"));
    };

    return (
        <>
            <button
                onClick={handleClick}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 16,
                }}
                title={playingThisSong ? "Tạm dừng" : "Phát"}
            >
                {playingThisSong ? <FaPause /> : <FaPlay />}
                {showText && (playingThisSong ? "Pause" : "Play")}
            </button>

            {/* 🔒 Popup Premium */}
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 3000,
                    }}
                    onClick={() => setShowModal(false)} // ← click ngoài để thoát luôn
                >
                    <div
                        style={{
                            background: "#181818",
                            padding: "30px",
                            borderRadius: "10px",
                            width: "380px",
                            textAlign: "center",
                            color: "#fff",
                            boxShadow: "0 0 15px rgba(0,0,0,0.6)",
                        }}
                        onClick={(e) => e.stopPropagation()} // ← chặn click bên trong
                    >
                        <p style={{ fontSize: "17px", marginBottom: "25px", lineHeight: 1.4 }}>
                            🔒 Bài hát <b>"{song.title}"</b> chỉ dành cho tài khoản{" "}
                            <span style={{ color: "#1db954", fontWeight: "bold" }}>Premium</span>.
                        </p>

                        <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    navigate("/upgrade"); // ✅ CHUYỂN TRANG NÂNG CẤP
                                }}
                                style={{
                                    background: "#1db954",
                                    color: "#000",
                                    fontWeight: 600,
                                    border: "none",
                                    padding: "10px 22px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Nâng cấp Premium
                            </button>

                            <button
                                onClick={() => setShowModal(false)} // ✅ Hủy: đóng modal
                                style={{
                                    background: "#333",
                                    color: "#fff",
                                    border: "none",
                                    padding: "10px 22px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🧩 Toast mini */}
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
                        zIndex: 4000,
                    }}
                >
                    {toast}
                </div>
            )}
        </>
    );
};

export default PlayPauseButton;
