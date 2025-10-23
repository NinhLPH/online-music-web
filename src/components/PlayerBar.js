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
} from "react-icons/fa";

const PlayerBar = () => {
    const [songs, setSongs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(70);
    const audioRef = useRef(null);

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

    useEffect(() => {
        if (songs.length > 0 && audioRef.current) {
            const current = songs[currentIndex];
            const audio = audioRef.current;
            audio.src = current.src;
            audio.load();
            audio.onloadedmetadata = () => setDuration(audio.duration);
        }
    }, [currentIndex, songs]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) audio.play().catch(() => { });
        else audio.pause();
    }, [isPlaying, currentIndex]);

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

    const nextSong = () => setCurrentIndex((i) => (i + 1) % songs.length);
    const prevSong = () => setCurrentIndex((i) => (i === 0 ? songs.length - 1 : i - 1));
    const replaySong = () => {
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    const formatTime = (sec) => {
        if (!sec || isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const current = songs[currentIndex];
    if (!current) return null;

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

    return (
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
                    <div style={{ fontWeight: 600 }}>{current.title}</div>
                    <div style={{ color: "#b3b3b3", fontSize: "0.8rem" }}>
                        {current.artist || "Unknown Artist"}
                    </div>
                </div>
            </div>

            <div className="d-flex flex-column align-items-center" style={{ width: "50%" }}>
                <div className="d-flex align-items-center mb-2" style={{ gap: 18 }}>
                    <button title="Shuffle" style={iconBtn} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                        <FaRandom />
                    </button>

                    <button title="Previous" style={iconBtn} onClick={prevSong} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
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

                    <button title="Next" style={iconBtn} onClick={nextSong} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                        <FaStepForward />
                    </button>

                    <button title="Replay song" style={iconBtn} onClick={replaySong} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                        <FaRedoAlt />
                    </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: 500 }}>
                    <span style={{ fontSize: "0.75rem", color: "#b3b3b3", width: 35, textAlign: "right" }}>
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

                    <span style={{ fontSize: "0.75rem", color: "#b3b3b3", width: 35 }}>
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-end" style={{ width: "25%", gap: 12 }}>
                <FaListUl title="Queue" style={iconBtn} onMouseEnter={hoverIn} onMouseLeave={hoverOut} />
                <FaVolumeUp title="Volume" style={iconBtn} onMouseEnter={hoverIn} onMouseLeave={hoverOut} />
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
                    <div style={{ width: `${volume}%`, height: "100%", background: "#1db954", borderRadius: 2 }}></div>
                </div>
                <FaExpandAlt title="Fullscreen" style={iconBtn} onMouseEnter={hoverIn} onMouseLeave={hoverOut} />
            </div>

            <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={nextSong} />
        </div>
    );
};

export default PlayerBar;
