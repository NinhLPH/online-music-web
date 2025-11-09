import React from "react";
import MainLayout from "./components/MainLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { QueueProvider } from "./context/QueueContext";
import LoginPage from "./page/Login";
import SongDetail from "./components/SongDetail";
import MainContent from "./components/MainContent";
import AlbumArtists from "./components/AlbumArtists";
import AdminDashboard from "./page/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import RegisterPage from "./page/Register";
import Upgrade from "./page/Upgrade";
import AlbumDetail from "./components/AlbumDetail";
import LikedSongs from "./components/LikedSongs";
import PlaylistDetail from "./components/PlaylistDetail";


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <QueueProvider>
                    <Routes>

                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route element={<MainLayout />}>
                            <Route index element={<MainContent />} />
                            <Route path="/home" element={<MainContent />} />
                            <Route path="/song/:id" element={<SongDetail />} />
                            <Route path="/artist/:id" element={<AlbumArtists />} />
                            <Route path="album/:id" element={<AlbumDetail />} />
                            <Route path="liked" element={<LikedSongs />} />
                            <Route path="playlist/:id" element={<PlaylistDetail />} />

                        </Route>

                        <Route path="/admin" element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            }
                        />
                        <Route path="/upgrade" element={<Upgrade/>} />
                    </Routes>
                </QueueProvider>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
