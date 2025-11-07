import React, { createContext, useContext, useState, useEffect } from "react";

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
    const [isQueueVisible, setIsQueueVisible] = useState(false);
    const [allSongs, setAllSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [queue, setQueue] = useState([]);
    const [history, setHistory] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleQueue = () => setIsQueueVisible((p) => !p);

    // 🧩 Load từ localStorage khi app khởi động
    useEffect(() => {
        const saved = localStorage.getItem("playerState");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.currentSong) setCurrentSong(parsed.currentSong);
                if (parsed.isPlaying !== undefined) setIsPlaying(parsed.isPlaying);
            } catch (err) {
                console.error("Lỗi khôi phục player:", err);
            }
        }
    }, []);

    // 🧩 Lưu lại mỗi khi currentSong hoặc isPlaying thay đổi
    useEffect(() => {
        const data = {
            currentSong,
            isPlaying,
        };
        localStorage.setItem("playerState", JSON.stringify(data));
    }, [currentSong, isPlaying]);

    const setSongList = (songs) => {
        setAllSongs(songs || []);
        if (!currentSong && songs && songs.length > 0) {
            setCurrentSong(songs[0]);
            setQueue([]);
            setHistory([]);
        }
    };

    const playSong = (songId) => {
        const target =
            queue.find((s) => s.id === songId) ||
            allSongs.find((s) => s.id === songId) ||
            null;
        if (!target) return;
        if (currentSong) setHistory((h) => [...h, currentSong]);
        setCurrentSong(target);
        setIsPlaying(true);
    };

    const addToQueue = (song) => {
        if (!song) return;
        if (currentSong && song.id === currentSong.id) return;

        setQueue((prev) => {
            const idx = prev.findIndex((s) => s.id === song.id);
            if (idx !== -1) {
                const newQ = [...prev];
                const [item] = newQ.splice(idx, 1);
                return [item, ...newQ];
            }
            return [song, ...prev];
        });
    };

    const getRemainingFromAll = () => {
        if (!currentSong) return allSongs.slice();
        const idx = allSongs.findIndex((s) => s.id === currentSong.id);
        const rem = idx === -1 ? allSongs.slice() : allSongs.slice(idx + 1);
        return rem.filter((s) => !queue.some((q) => q.id === s.id));
    };

    const nextSong = () => {
        if (queue.length > 0) {
            const [next, ...rest] = queue;
            if (currentSong) setHistory((h) => [...h, currentSong]);
            setCurrentSong(next);
            setQueue(rest);
            setIsPlaying(true);
            return;
        }

        const remaining = getRemainingFromAll();
        if (remaining.length > 0) {
            if (currentSong) setHistory((h) => [...h, currentSong]);
            setCurrentSong(remaining[0]);
            setIsPlaying(true);
            return;
        }

        if (allSongs.length > 0) {
            if (currentSong) setHistory((h) => [...h, currentSong]);
            setCurrentSong(allSongs[0]);
            setIsPlaying(true);
        }
    };


    const playPrevSong = () => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        setHistory((h) => h.slice(0, h.length - 1));
        setCurrentSong(prev);
        setIsPlaying(true);
    };

    const clearQueue = () => setQueue([]);

    const play = () => setIsPlaying(true);
    const pause = () => setIsPlaying(false);
    const togglePlayPause = () => setIsPlaying((prev) => !prev);

    return (
        <QueueContext.Provider
            value={{
                isQueueVisible,
                toggleQueue,
                allSongs,
                setSongList,
                currentSong,
                playSong,
                addToQueue,
                queue,
                nextSong,
                playPrevSong,
                clearQueue,
                isPlaying,
                setIsPlaying,
                play,
                pause,
                togglePlayPause,
            }}
        >
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = () => useContext(QueueContext);
