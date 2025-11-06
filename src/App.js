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


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <QueueProvider>
                    <Routes>

                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route element={<MainLayout />}>
                            <Route path="/home" element={<MainContent />} />
                            <Route path="/song/:id" element={<SongDetail />} />
                            <Route path="/artist/:id" element={<AlbumArtists />} />

                        </Route>

                        <Route path="/admin" element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            }
                        />
                    </Routes>
                </QueueProvider>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
