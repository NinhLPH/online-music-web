import React, { createContext, useContext, useState } from "react";

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [upNext, setUpNext] = useState([]);
    const [queue, setQueue] = useState([]);
    const [isQueueVisible, setIsQueueVisible] = useState(false);

    // 🔄 Hiện / ẩn sidebar danh sách chờ
    const toggleQueue = () => setIsQueueVisible((prev) => !prev);

    // ➕ Thêm bài hát mới vào danh sách chờ
    const addToQueue = (song) => {
        setQueue((prev) => {
            const exists = prev.some((s) => s.id === song.id);
            return exists ? prev : [...prev, song];
        });
    };

    // 🎵 Cập nhật bài đang phát và danh sách kế tiếp
    const setNowPlaying = (song, upcoming = []) => {
        setCurrentSong(song);
        setUpNext(upcoming);
    };

    // ▶️ Phát bài hát theo id
    const playSong = (songId) => {
        // gom tất cả bài có thể phát lại
        const allSongs = [currentSong, ...upNext, ...queue].filter(Boolean);

        // tìm bài theo id
        const newCurrent = allSongs.find((s) => s.id === songId);
        if (!newCurrent) return;

        // xác định bài tiếp theo sau bài được chọn
        const index = allSongs.findIndex((s) => s.id === songId);
        const upcoming = allSongs.slice(index + 1);

        // cập nhật vào context
        setNowPlaying(newCurrent, upcoming);

        // loại bỏ bài vừa chọn khỏi hàng đợi (nếu có trong queue)
        setQueue((prev) => prev.filter((s) => s.id !== songId));
    };

    return (
        <QueueContext.Provider
            value={{
                currentSong,
                upNext,
                queue,
                isQueueVisible,
                toggleQueue,
                addToQueue,
                playSong,
                setNowPlaying,
            }}
        >
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = () => useContext(QueueContext);
