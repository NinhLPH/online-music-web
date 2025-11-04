import React, { useEffect, useState } from "react";
import axios from "axios";
import { useQueue } from "../context/QueueContext";
import PlayPauseButton from "./PlayPauseButton";

export default function Playlist({ playlistId }) {
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const { setSongList } = useQueue();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // lấy dữ liệu playlist
        const res = await axios.get(`http://localhost:9000/playlists/${playlistId}`);
        const playlistData = res.data;
        setPlaylist(playlistData);

        // lấy toàn bộ bài hát
        const allSongsRes = await axios.get("http://localhost:9000/songs");
        const allSongs = allSongsRes.data;

        // xác định danh sách ID bài hát
        const ids =
          playlistData.songIds ||
          playlistData.songs ||
          playlistData.songList ||
          [];

        // lọc bài hát theo danh sách ID
        const list = allSongs.filter(
          (s) => ids.includes(s.id) || ids.includes(String(s.id))
        );

        setSongs(list);
        setSongList(list);
      } catch (err) {
        console.error("❌ Lỗi khi tải playlist:", err);
      }
    };
    fetchData();
  }, [playlistId, setSongList]);

  if (!playlist) return <div>Loading...</div>;

  return (
    <div className="main-content" style={{ padding: 20 }}>
      <h2>🎵 {playlist.name}</h2>
      <p>{playlist.description || "Playlist mới tạo"}</p>

      {songs.length === 0 ? (
        <p style={{ color: "#999" }}>Không có bài hát nào trong playlist này.</p>
      ) : (
        songs.map((song) => (
          <div
            key={song.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #333",
            }}
          >
            <div>{song.title}</div>
            <PlayPauseButton song={song} />
          </div>
        ))
      )}
    </div>
  );
}
