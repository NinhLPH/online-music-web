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
                return true;
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

    const value = {currentUser, login, logout};

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};