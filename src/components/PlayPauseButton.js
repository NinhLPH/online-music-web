import React from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { useQueue } from "../context/QueueContext";

/**
 * Component phát / tạm dừng nhạc cho 1 bài cụ thể.
 * @param {Object} song - Bài hát cần play/pause.
 * @param {boolean} [showText=false] - Có hiển thị chữ "Play"/"Pause" hay không.
 */
const PlayPauseButton = ({ song, showText = false }) => {
    const {
        currentSong,
        playSong,
    } = useQueue();

    // ✅ Xác định xem bài này có đang phát không
    const isCurrent = currentSong && currentSong.id === song.id;

    // ✅ Lưu trạng thái phát của toàn player (nhận qua custom event)
    const [isPlaying, setIsPlaying] = React.useState(false);
    React.useEffect(() => {
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        window.addEventListener("playerPlay", handlePlay);
        window.addEventListener("playerPause", handlePause);
        return () => {
            window.removeEventListener("playerPlay", handlePlay);
            window.removeEventListener("playerPause", handlePause);
        };
    }, []);

    const handleClick = () => {
        if (!song) return;
        // Nếu đang phát bài khác → phát bài mới
        if (!isCurrent) {
            playSong(song.id);
            window.dispatchEvent(new CustomEvent("playerPlay"));
            return;
        }

        // Nếu là bài hiện tại → toggle play/pause
        const audio = document.querySelector("audio");
        if (!audio) return;
        if (audio.paused) {
            audio.play();
            window.dispatchEvent(new CustomEvent("playerPlay"));
        } else {
            audio.pause();
            window.dispatchEvent(new CustomEvent("playerPause"));
        }
    };

    const playingThisSong = isCurrent && isPlaying;

    return (
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
    );
};

export default PlayPauseButton;
