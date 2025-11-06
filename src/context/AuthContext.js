import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:9000';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('music-app-user');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('music-app-user');
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.get(`${API_URL}/users`, {
                params: {
                    username: username,
                    password: password,
                },
            });

            if (response.data && response.data.length > 0) {
                const user = response.data[0];
                const { password, ...userToStore } = user; 
                
                localStorage.setItem('music-app-user', JSON.stringify(userToStore));
                setCurrentUser(userToStore);
                return userToStore;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('music-app-user');
        setCurrentUser(null);
    };

    const register = async (username, password) => {
        try {
            // 1. Kiểm tra xem user đã tồn tại chưa
            const checkUser = await axios.get(`${API_URL}/users?username=${username}`);
            if (checkUser.data && checkUser.data.length > 0) {
                return { success: false, message: 'Tên đăng nhập đã tồn tại.' };
            }

            // 2. Tạo đối tượng user mới
            const newUser = {
                username: username,
                password: password,
                avatar: `https://picsum.photos/seed/${username}/100/100`, // Avatar mặc định
                favorites: [],
                subscription: { // Gói cước mặc định
                    tier: "basic",
                    status: "active",
                    expiresOn: null 
                }
            };

            // 3. POST user mới lên server
            await axios.post(`${API_URL}/users`, newUser);

            // 4. Tự động đăng nhập sau khi đăng ký thành công
            const loggedInUser = await login(username, password);
            if (loggedInUser) {
                return { success: true, user: loggedInUser };
            } else {
                // Trường hợp này ít xảy ra, nhưng vẫn nên xử lý
                return { success: false, message: 'Đăng ký thành công nhưng đăng nhập tự động thất bại.' };
            }

        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, message: 'Đã xảy ra lỗi trong quá trình đăng ký.' };
        }
    };

    const value = {currentUser, login, logout, register};

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};