import React, { useState } from "react";
import axios from "axios";
import { useQueue } from "../context/QueueContext";
import { FaEllipsisH } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function RightSidebar() {
    const {
        currentSong,
        upNext,
        queue,
        isQueueVisible,
        toggleQueue,
        addToQueue,
        playSong,
    } = useQueue();

    const [openMenu, setOpenMenu] = useState(null);
    const [toast, setToast] = useState(null);

    if (!isQueueVisible) return null;

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2000);
    };

    const handleAddToFavorites = async (song) => {
        try {
            const res = await axios.get("http://localhost:9000/users/1");
            const user = res.data;

            const updatedFavorites = [...new Set([...(user.favorites || []), song.id])];

            await axios.patch(`http://localhost:9000/users/1`, {
                favorites: updatedFavorites,
            });

            showToast(`Đã thêm "${song.title}" vào danh sách yêu thích`);
        } catch (err) {
            console.error("Lỗi khi thêm vào yêu thích:", err);
            showToast("Không thể thêm bài hát vào yêu thích", "error");
        }
    };

    const handleAddToPlaylist = async (song) => {
        try {
            const playlistRes = await axios.get("http://localhost:9000/playlists/1");
            const playlist = playlistRes.data;

            const updated = {
                ...playlist,
                songIds: [...new Set([...playlist.songIds, song.id])],
            };

            await axios.patch(`http://localhost:9000/playlists/1`, {
                songIds: updated.songIds,
            });

            showToast(`Đã thêm "${song.title}" vào playlist`);
        } catch (err) {
            console.error("Lỗi khi thêm vào playlist:", err);
            showToast("Không thể thêm vào playlist", "error");
        }
    };

    const handleAddToQueue = (song) => {
        addToQueue(song);
        showToast(`Đã thêm "${song.title}" vào danh sách chờ`);
    };

    return (
        <>
            <div
                className="bg-dark text-white"
                style={{
                    width: 340,
                    position: "fixed",
                    right: 0,
                    top: 60,
                    bottom: 90,
                    overflowY: "auto",
                    borderLeft: "1px solid #333",
                    zIndex: 1500,
                    padding: "16px",
                }}
            >
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold">Danh sách phát</h5>
                    <button
                        className="btn btn-sm btn-outline-light"
                        style={{ borderRadius: "50%" }}
                        onClick={toggleQueue}
                    >
                        ✖
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

                {upNext.length > 0 && (
                    <>
                        <h6 className="text-uppercase text-muted small mb-2 mt-3">
                            Phát tiếp theo
                        </h6>
                        {upNext.map((song) => (
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

                {queue.length > 0 && (
                    <>
                        <h6 className="text-uppercase text-muted small mb-2 mt-3">
                            Danh sách chờ
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
                    </>
                )}
            </div>

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
                        transition: "opacity 0.3s",
                    }}
                >
                    {toast.msg}
                </div>
            )}
        </>
    );
}

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
    return (
        <div
            className={`p-2 mb-2 rounded ${active ? "bg-black" : "bg-transparent"}`}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: active ? "#1a1a1a" : "transparent",
                position: "relative",
                transition: "background 0.2s",
            }}
        >
            <div
                style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                onClick={onPlay}
            >
                <img
                    src={`https://picsum.photos/seed/${song.id}/60`}
                    alt={song.title}
                    style={{
                        width: 55,
                        height: 55,
                        borderRadius: 8,
                        marginRight: 10,
                        objectFit: "cover",
                    }}
                />
                <div>
                    <div
                        style={{
                            fontWeight: 600,
                            color: active ? "#1db954" : "#fff",
                            fontSize: "0.9rem",
                        }}
                    >
                        {song.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#b3b3b3" }}>
                        {song.artist}
                    </div>
                </div>
            </div>

            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(openMenu === song.id ? null : song.id);
                }}
                style={{
                    padding: "6px 8px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    color: "#ccc",
                    transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1db954")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
            >
                <FaEllipsisH />
            </div>

            {openMenu === song.id && (
                <div
                    className="rounded shadow-sm p-2"
                    style={{
                        position: "absolute",
                        right: 10,
                        top: 65,
                        width: 220,
                        zIndex: 1600,
                        background: "#2a2a2a",
                        border: "1px solid #444",
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
                        Thêm vào yêu thích
                    </button>
                    <button
                        className="w-100 text-start text-white border-0 bg-transparent py-2 px-3"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToPlaylist(song);
                            setOpenMenu(null);
                        }}
                    >
                        Thêm vào playlist
                    </button>
                    <button
                        className="w-100 text-start text-white border-0 bg-transparent py-2 px-3"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToQueue(song);
                            setOpenMenu(null);
                        }}
                    >
                        Thêm vào danh sách chờ
                    </button>
                    <div
                        className="text-center mt-2"
                        style={{
                            background: "#1b1b1b",
                            borderRadius: 6,
                            padding: "6px 0",
                            cursor: "pointer",
                        }}
                        onClick={() => setOpenMenu(null)}
                    >
                        Đóng
                    </div>
                </div>
            )}
        </div>
    );
}
