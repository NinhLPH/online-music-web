// src/components/SongDetail.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart, FaPlus, FaPlay, FaTimes } from "react-icons/fa";

function SongDetail({ song, onClose }) {
    const [artist, setArtist] = useState(null);
    const [album, setAlbum] = useState(null);
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        if (!song) return;

        // Lấy thông tin nghệ sĩ & album
        const fetchData = async () => {
            try {
                const [artistRes, albumRes, userRes] = await Promise.all([
                    axios.get(`http://localhost:9000/artists/${song.artistId}`),
                    axios.get(`http://localhost:9000/albums/${song.albumId}`),
                    axios.get(`http://localhost:9000/users/1`)
                ]);
                setArtist(artistRes.data);
                setAlbum(albumRes.data);
                setIsFav(userRes.data.favorites?.includes(song.id));
            } catch (err) {
                console.error("Lỗi tải dữ liệu chi tiết:", err);
            }
        };

        fetchData();
    }, [song]);

    const toggleFavorite = async () => {
        try {
            const res = await axios.get(`http://localhost:9000/users/1`);
            const user = res.data;
            const favorites = user.favorites || [];
            let updatedFavorites;

            if (favorites.includes(song.id)) {
                updatedFavorites = favorites.filter((id) => id !== song.id);
                setIsFav(false);
            } else {
                updatedFavorites = [...favorites, song.id];
                setIsFav(true);
            }

            await axios.patch(`http://localhost:9000/users/1`, {
                favorites: updatedFavorites,
            });
        } catch (err) {
            console.error("Không thể cập nhật yêu thích:", err);
        }
    };

    if (!song) return null;

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#121212",
                color: "#fff",
                zIndex: 999,
                padding: "40px 60px",
                overflowY: "auto",
                animation: "fadeIn 0.3s ease",
            }}
        >
            {/* Nút đóng */}
            <button
                onClick={onClose}
                style={{
                    position: "absolute",
                    top: 20,
                    right: 30,
                    background: "none",
                    border: "none",
                    color: "#fff",
                    fontSize: 22,
                    cursor: "pointer",
                }}
                title="Đóng"
            >
                <FaTimes />
            </button>

            {/* Ảnh và thông tin */}
            <div className="d-flex align-items-center mb-5">
                <img
                    src={`https://picsum.photos/seed/${song.id}/350`}
                    alt={song.title}
                    style={{
                        width: 280,
                        height: 280,
                        borderRadius: 12,
                        marginRight: 40,
                        objectFit: "cover",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
                    }}
                />
                <div>
                    <p className="text-uppercase text-muted mb-2" style={{ fontSize: "0.9rem" }}>
                        Bài hát
                    </p>
                    <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>{song.title}</h1>
                    <h4 style={{ color: "#b3b3b3", marginBottom: 20 }}>
                        {artist ? artist.name : "Đang tải..."} •{" "}
                        {album ? album.title : "Không rõ album"}{" "}
                        {album ? `(${album.releaseYear})` : ""}
                    </h4>

                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                        <button
                            style={{
                                background: "#1db954",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: 56,
                                height: 56,
                                fontSize: 22,
                                cursor: "pointer",
                            }}
                            title="Phát bài hát"
                        >
                            <FaPlay />
                        </button>

                        <button
                            onClick={toggleFavorite}
                            style={{
                                background: "none",
                                border: "none",
                                color: isFav ? "#1db954" : "#fff",
                                fontSize: 24,
                                cursor: "pointer",
                            }}
                            title={isFav ? "Đã yêu thích" : "Thêm vào yêu thích"}
                        >
                            <FaHeart />
                        </button>

                        <button
                            style={{
                                background: "none",
                                border: "none",
                                color: "#fff",
                                fontSize: 22,
                                cursor: "pointer",
                            }}
                            title="Thêm vào playlist"
                        >
                            <FaPlus />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mô tả */}
            <div style={{ maxWidth: 700 }}>
                <h5 className="mb-3">Giới thiệu</h5>
                <p style={{ color: "#ccc", lineHeight: 1.6 }}>
                    {song.description || "Bài hát chưa có mô tả chi tiết."}
                </p>
            </div>
        </div>
    );
}

export default SongDetail;
