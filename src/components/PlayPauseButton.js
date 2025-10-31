import React from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { useQueue } from "../context/QueueContext";

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

// ✅ Xác định bài hiện tại
const isCurrent = currentSong && currentSong.id === song.id;
const playingThisSong = isCurrent && isPlaying;

const handleClick = () => {
if (!song) return;

 // 🔹 Nếu chọn bài khác → phát bài mới
 if (!isCurrent) {
     playSong(song.id);
     window.dispatchEvent(new CustomEvent("playerSongChange", { detail: song }));
     window.dispatchEvent(new CustomEvent("playerPlay"));
     return;
 }

 // 🔹 Nếu là bài hiện tại → toggle phát / tạm dừng
 togglePlayPause();
 window.dispatchEvent(new CustomEvent(isPlaying ? "playerPause" : "playerPlay"));


};

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