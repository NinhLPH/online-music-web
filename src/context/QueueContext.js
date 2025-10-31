// /src/context/QueueContext.js
import React, { createContext, useContext, useState } from "react";

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
    const [isQueueVisible, setIsQueueVisible] = useState(false);
    const [allSongs, setAllSongs] = useState([]); // toàn bộ danh sách từ DB
    const [currentSong, setCurrentSong] = useState(null);
    const [queue, setQueue] = useState([]); // các bài user-add, đầu = sẽ phát ngay sau current
    const [history, setHistory] = useState([]); // stack để prev

    const toggleQueue = () => setIsQueueVisible((p) => !p);

    /**
     * Gán danh sách DB.
     * Nếu chưa có currentSong, set bài đầu làm current và queue mặc định là các bài sau nó.
     */
    const setSongList = (songs) => {
        setAllSongs(songs || []);
        if (!currentSong && songs && songs.length > 0) {
            setCurrentSong(songs[0]);
            setQueue([]); // giữ queue user-add rỗng ban đầu
            setHistory([]);
        }
    };

    /**
     * Play 1 bài cụ thể (do user click ở UI).
     * - Lưu current vào history (nếu có)
     * - Set current = target
     * - Giữ nguyên queue (các bài user-add vẫn nằm chờ)
     */
    const playSong = (songId) => {
        const target =
            queue.find((s) => s.id === songId) ||
            allSongs.find((s) => s.id === songId) ||
            null;
        if (!target) return;
        if (currentSong) setHistory((h) => [...h, currentSong]);
        setCurrentSong(target);
        // Không auto-clear queue — keep user-added queue as-is; they will play first after current
    };

    /**
     * Thêm bài vào hàng chờ theo kiểu "play next" (chèn vào đầu queue).
     * - Nếu bài đang là current => không thêm.
     * - Nếu đã có trong queue => move lên đầu.
     * - Tránh duplicate.
     */
    const addToQueue = (song) => {
        if (!song) return;
        if (currentSong && song.id === currentSong.id) return;

        setQueue((prev) => {
            const idx = prev.findIndex((s) => s.id === song.id);
            if (idx !== -1) {
                // move existing item to head
                const newQ = [...prev];
                const [item] = newQ.splice(idx, 1);
                return [item, ...newQ];
            }
            return [song, ...prev];
        });
    };

    /**
     * Lấy phần còn lại từ allSongs sau current, loại bỏ các bài đã có trong queue
     */
    const getRemainingFromAll = () => {
        if (!currentSong) return allSongs.slice();
        const idx = allSongs.findIndex((s) => s.id === currentSong.id);
        const rem = idx === -1 ? allSongs.slice() : allSongs.slice(idx + 1);
        return rem.filter((s) => !queue.some((q) => q.id === s.id));
    };

    /**
     * nextSong: Logic khi bấm Next hoặc bài kết thúc:
     * - Nếu queue có item -> shift từ queue (đầu) -> play
     * - Else lấy item đầu từ remaining in allSongs -> play
     * - Nếu hết -> vòng về đầu allSongs
     */
    const nextSong = () => {
        if (queue.length > 0) {
            const [next, ...rest] = queue;
            if (currentSong) setHistory((h) => [...h, currentSong]);
            setCurrentSong(next);
            setQueue(rest);
            return;
        }

        const remaining = getRemainingFromAll();
        if (remaining.length > 0) {
            if (currentSong) setHistory((h) => [...h, currentSong]);
            setCurrentSong(remaining[0]);
            return;
        }

        // hết danh sách -> loop về đầu allSongs (tuỳ ý)
        if (allSongs.length > 0) {
            if (currentSong) setHistory((h) => [...h, currentSong]);
            setCurrentSong(allSongs[0]);
        }
    };

    /**
     * Prev: lấy từ history stack nếu có
     */
    const playPrevSong = () => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        setHistory((h) => h.slice(0, h.length - 1));
        // khi đi lùi, không auto đưa current vào queue (để tránh thay đổi order bất ngờ)
        setCurrentSong(prev);
    };

    const clearQueue = () => {
        setQueue([]);
    };

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
            }}
        >
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = () => useContext(QueueContext);
