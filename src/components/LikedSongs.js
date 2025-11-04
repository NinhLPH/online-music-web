import React, { useEffect, useState } from "react";
import axios from "axios";
import { useQueue } from "../context/QueueContext";
import PlayPauseButton from "./PlayPauseButton";

export default function LikedSongs() {
  const [songs, setSongs] = useState([]);
  const { setSongList } = useQueue();

  useEffect(() => {
    const fetchLiked = async () => {
      const user = await axios.get("http://localhost:9000/users/1");
      const favorites = user.data.favorites || [];
      if (favorites.length === 0) return;
      const allSongs = await axios.get("http://localhost:9000/songs");
      const favSongs = allSongs.data.filter((s) => favorites.includes(s.id));
      setSongs(favSongs);
      setSongList(favSongs);
    };
    fetchLiked();
  }, [setSongList]);

  return (
    <div className="main-content" style={{ padding: 20 }}>
      <h2>💖 Liked Songs</h2>
      <div style={{ marginTop: 20 }}>
        {songs.map((song) => (
          <div
            key={song.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #333",
            }}
          >
            <div>
              <div style={{ fontWeight: "bold" }}>{song.title}</div>
            </div>
            <PlayPauseButton song={song} />
          </div>
        ))}
      </div>
    </div>
  );
}
