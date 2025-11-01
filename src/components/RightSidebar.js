import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQueue } from "../context/QueueContext";
import { FaEllipsisH, FaTimes } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function RightSidebar() {
    const {
        currentSong,
        queue,
        allSongs,
        isQueueVisible,
        toggleQueue,
        addToQueue,
        playSong,
        clearQueue,
    } = useQueue();

    const [openMenu, setOpenMenu] = useState(null);
    const [toast, setToast] = useState(null);
    const [confirmBox, setConfirmBox] = useState(null);
    const [artistInfo, setArtistInfo] = useState(null);

    // 🔥 Lấy thông tin nghệ sĩ khi bài hát đổi
    useEffect(() => {
        const fetchArtist = async () => {
            if (!currentSong?.artistId) return;
            try {
                const res = await axios.get(`http://localhost:9000/artists/${currentSong.artistId}`);
                setArtistInfo(res.data);
            } catch (err) {
                console.error("Lỗi tải thông tin nghệ sĩ:", err);
            }
        };
        fetchArtist();
    }, [currentSong]);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2000);
    };

    // ❤️ Thêm / Xóa khỏi yêu thích
    const handleAddToFavorites = async (song) => {
        try {
            const res = await axios.get("http://localhost:9000/users/1");
            const user = res.data;
            const favorites = user.favorites || [];
            const isFav = favorites.includes(song.id);

            if (isFav) {
                setConfirmBox({
                    message: `Bạn có chắc muốn xóa "${song.title}" khỏi danh sách yêu thích?`,
                    onConfirm: async () => {
                        const updatedFavorites = favorites.filter((id) => id !== song.id);
                        await axios.patch("http://localhost:9000/users/1", { favorites: updatedFavorites });
                        setConfirmBox(null);
                        showToast(`Đã xóa "${song.title}" khỏi yêu thích`);
                        window.dispatchEvent(new CustomEvent("favoritesUpdated", { detail: updatedFavorites }));
                    },
                    onCancel: () => setConfirmBox(null),
                });
            } else {
                const updatedFavorites = [...favorites, song.id];
                await axios.patch("http://localhost:9000/users/1", { favorites: updatedFavorites });
                showToast(`Đã thêm "${song.title}" vào danh sách yêu thích`);
                window.dispatchEvent(new CustomEvent("favoritesUpdated", { detail: updatedFavorites }));
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật yêu thích:", err);
            showToast("Không thể cập nhật yêu thích", "error");
        }
    };

    // 🎵 Thêm vào playlist
    const handleAddToPlaylist = async (song) => {
        try {
            const playlistRes = await axios.get("http://localhost:9000/playlists/1");
            const playlist = playlistRes.data;
            const updated = { ...playlist, songIds: [...new Set([...(playlist.songIds || []), song.id])] };
            await axios.patch("http://localhost:9000/playlists/1", { songIds: updated.songIds });
            showToast(`Đã thêm "${song.title}" vào playlist`);
        } catch (err) {
            console.error("Lỗi khi thêm vào playlist:", err);
            showToast("Không thể thêm vào playlist", "error");
        }
    };

    // 🔜 Thêm vào hàng chờ
    const handleAddToQueue = (song) => {
        addToQueue(song);
        showToast(`"${song.title}" sẽ phát ngay sau bài hiện tại`);
    };

    // 🧩 Nếu danh sách chờ ẩn → hiển thị thông tin bài hát & nghệ sĩ
    if (!isQueueVisible) {
        if (!currentSong) return null;
        return (
            <div
                className="text-white d-flex flex-column align-items-center"
                style={{
                    width: "100%",
                    height: "calc(100vh - 110px)",
                    backgroundColor: "#181818",
                    borderLeft: "1px solid rgba(255,255,255,0.1)",
                    padding: "16px",
                    overflowY: "auto",
                }}
            >
                <h6 className="text-uppercase text-muted small mb-3">Đang phát</h6>

                <img
                    src={`https://picsum.photos/seed/${currentSong.id}/220`}
                    alt={currentSong.title}
                    style={{
                        width: 220,
                        height: 220,
                        borderRadius: 10,
                        objectFit: "cover",
                        marginBottom: 12,
                        cursor: "pointer",
                    }}
                    onClick={() =>
                        window.dispatchEvent(new CustomEvent("showSongDetail", { detail: currentSong }))
                    }
                />

                <div
                    style={{
                        fontWeight: 600,
                        fontSize: "1rem",
                        cursor: "pointer",
                        color: "#fff",
                        marginBottom: 4,
                    }}
                    onClick={() =>
                        window.dispatchEvent(new CustomEvent("showSongDetail", { detail: currentSong }))
                    }
                >
                    {currentSong.title}
                </div>

                <div style={{ color: "#b3b3b3", fontSize: "0.9rem", marginBottom: 16 }}>
                    {currentSong.artist}
                </div>

                {/* ✅ Giới thiệu nghệ sĩ */}
                {artistInfo && (
                    <div
                        style={{
                            background: "#121212",
                            borderRadius: 10,
                            padding: "14px 16px",
                            width: "100%",
                            marginTop: 10,
                        }}
                    >
                        <h6 className="text-uppercase text-muted small mb-3">Giới thiệu về nghệ sĩ</h6>
                        <img
                            src={artistInfo.coverImg}
                            alt={artistInfo.name}
                            style={{
                                width: "100%",
                                borderRadius: 8,
                                marginBottom: 10,
                                objectFit: "cover",
                            }}
                        />
                        <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 6 }}>
                            {artistInfo.name}
                        </div>
                        <div style={{ color: "#ccc", fontSize: "0.88rem", textAlign: "justify" }}>
                            {artistInfo.description || "Chưa có thông tin về nghệ sĩ này."}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 🔽 Danh sách bài trong queue
    const remaining = (allSongs || []).filter(
        (s) => s.id !== currentSong?.id && !queue.some((q) => q.id === s.id)
    );

    return (
        <>
            <div
                className="text-white"
                style={{
                    width: "100%",
                    height: "calc(100vh - 110px)",
                    overflowY: "auto",
                    backgroundColor: "#181818",
                    borderLeft: "1px solid rgba(255,255,255,0.1)",
                    padding: "16px",
                    paddingBottom: "40px",
                }}
            >
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold">Danh sách phát</h5>
                    <button
                        onClick={toggleQueue}
                        title="Đóng danh sách chờ"
                        style={{
                            background: "none",
                            border: "none",
                            color: "#fff",
                            fontSize: "20px",
                            cursor: "pointer",
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <h6 className="text-uppercase text-muted small mb-2">Đang phát</h6>
                {currentSong ? (
                    <SongItem
                        song={currentSong}
                        active
                        openMenu={openMenu}
                        setOpenMenu={setOpenMenu}
                        onPlay={() => playSong(currentSong.id)}
                        handleAddToFavorites={handleAddToFavorites}
                        handleAddToPlaylist={handleAddToPlaylist}
                        handleAddToQueue={handleAddToQueue}
                    />
                ) : (
                    <p className="text-muted">Chưa có bài hát nào.</p>
                )}

                {queue.length > 0 && (
                    <>
                        <h6 className="text-uppercase text-muted small mt-3 mb-2">
                            Tiếp theo trong danh sách chờ
                        </h6>
                        {queue.map((song) => (
                            <SongItem
                                key={song.id}
                                song={song}
                                openMenu={openMenu}
                                setOpenMenu={setOpenMenu}
                                onPlay={() => playSong(song.id)}
                                handleAddToFavorites={handleAddToFavorites}
                                handleAddToPlaylist={handleAddToPlaylist}
                                handleAddToQueue={handleAddToQueue}
                            />
                        ))}
                        <div className="d-flex justify-content-end mb-2">
                            <button
                                onClick={() =>
                                    setConfirmBox({
                                        message: "Bạn có chắc muốn xóa toàn bộ danh sách chờ không?",
                                        onConfirm: () => {
                                            clearQueue();
                                            showToast("Đã xóa danh sách chờ");
                                            setConfirmBox(null);
                                        },
                                        onCancel: () => setConfirmBox(null),
                                    })
                                }
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#b3b3b3",
                                    fontSize: "0.8rem",
                                    cursor: "pointer",
                                }}
                            >
                                Xóa danh sách chờ
                            </button>
                        </div>
                    </>
                )}

                {remaining.length > 0 && (
                    <>
                        <h6 className="text-uppercase text-muted small mb-2 mt-3">Nội dung tiếp theo</h6>
                        {remaining.map((song) => (
                            <SongItem
                                key={song.id}
                                song={song}
                                openMenu={openMenu}
                                setOpenMenu={setOpenMenu}
                                onPlay={() => playSong(song.id)}
                                handleAddToFavorites={handleAddToFavorites}
                                handleAddToPlaylist={handleAddToPlaylist}
                                handleAddToQueue={handleAddToQueue}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Confirm Box */}
            {confirmBox && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "100px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#222",
                        color: "#fff",
                        padding: "12px 18px",
                        borderRadius: 10,
                        zIndex: 2000,
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

            {/* Toast */}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 100,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: toast.type === "error" ? "#e74c3c" : "#1db954",
                        color: "#fff",
                        padding: "10px 20px",
                        borderRadius: 20,
                        zIndex: 3000,
                        fontSize: "0.9rem",
                        boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                    }}
                >
                    {toast.msg}
                </div>
            )}
        </>
    );
}

// 🎵 SongItem component
function SongItem({
    song,
    active,
    openMenu,
    setOpenMenu,
    onPlay,
    handleAddToFavorites,
    handleAddToPlaylist,
    handleAddToQueue,
}) {
    const [openUpward, setOpenUpward] = useState(false);

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setOpenUpward(spaceBelow < 200 && spaceAbove > 200);
        setOpenMenu(openMenu === song.id ? null : song.id);
    };

    return (
        <div
            className={`p-2 mb-2 rounded ${active ? "bg-black" : "bg-transparent"}`}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: active ? "#1a1a1a" : "transparent",
                position: "relative",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={onPlay}>
                <img
                    src={`https://picsum.photos/seed/${song.id}/60`}
                    alt={song.title}
                    style={{ width: 55, height: 55, borderRadius: 8, marginRight: 10 }}
                />
                <div>
                    <div style={{ fontWeight: 600, color: active ? "#1db954" : "#fff", fontSize: "0.9rem" }}>
                        {song.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#b3b3b3" }}>{song.artist}</div>
                </div>
            </div>

            <div
                onClick={handleMenuToggle}
                style={{ padding: "6px 8px", cursor: "pointer", fontSize: "1.1rem", color: "#ccc" }}
            >
                <FaEllipsisH />
            </div>

            {openMenu === song.id && (
                <div
                    className="rounded shadow-sm p-2"
                    style={{
                        position: "absolute",
                        right: 10,
                        top: openUpward ? "auto" : 65,
                        bottom: openUpward ? 65 : "auto",
                        width: 220,
                        zIndex: 1600,
                        background: "#2a2a2a",
                        border: "1px solid #444",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
                    }}
                >
                    <button
                        className="w-100 text-start text-white border-0 bg-transparent py-2 px-3"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites(song);
                            setOpenMenu(null);
                        }}
                    >
                        + Thêm / - Xóa khỏi yêu thích
                    </button>
                    <button
                        className="w-100 text-start text-white border-0 bg-transparent py-2 px-3"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToPlaylist(song);
                            setOpenMenu(null);
                        }}
                    >
                        + Thêm vào playlist
                    </button>
                    <button
                        className="w-100 text-start text-white border-0 bg-transparent py-2 px-3"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToQueue(song);
                            setOpenMenu(null);
                        }}
                    >
                        + Thêm vào danh sách chờ
                    </button>
                </div>
            )}
        </div>
    );
}
