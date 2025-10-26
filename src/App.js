import MainLayout from "./components/MainLayout";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './page/Login';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/home" element={<MainLayout />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App;