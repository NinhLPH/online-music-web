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

    useEffect(() => {
        if (!currentUser?.subscription?.expiresOn) return;

        const checkExpire = async () => {
            const now = new Date();
            const exp = new Date(currentUser.subscription.expiresOn);

            if (exp < now) {
                await fetch(`http://localhost:9000/users/${currentUser.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        subscription: {
                            tier: "basic",
                            status: "expired",
                            expiresOn: null
                        }
                    })
                });
                window.location.reload();
            }
        };

        checkExpire();
    }, [currentUser]);

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
            const checkUser = await axios.get(`${API_URL}/users?username=${username}`);
            if (checkUser.data && checkUser.data.length > 0) {
                return { success: false, message: 'Tên đăng nhập đã tồn tại.' };
            }

            const newUser = {
                username: username,
                password: password,
                avatar: `https://picsum.photos/seed/${username}/100/100`,
                favorites: [],
                subscription: {
                    tier: "basic",
                    status: "active",
                    expiresOn: null
                }
            };

            await axios.post(`${API_URL}/users`, newUser);

            const loggedInUser = await login(username, password);
            if (loggedInUser) {
                return { success: true, user: loggedInUser };
            } else {
                return { success: false, message: 'Đăng ký thành công nhưng đăng nhập tự động thất bại.' };
            }

        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, message: 'Đã xảy ra lỗi trong quá trình đăng ký.' };
        }
    };

    // CHECK PREMIUM 
    const isPremium = () => {
        if (!currentUser || !currentUser.subscription) return false;
        const exp = new Date(currentUser.subscription.expiresOn);
        const now = new Date();
        return currentUser.subscription.tier === "premium" &&
               currentUser.subscription.status === "active" &&
               exp > now;
    };
   const updateSubscription = async (subscription) => {
    const updatedUser = {
        ...currentUser,
        subscription
    };

    try {
        await axios.patch(`${API_URL}/users/${currentUser.id}`, { subscription });

        setCurrentUser(updatedUser);

        localStorage.setItem("music-app-user", JSON.stringify(updatedUser));
    } catch (err) {
        console.error("Update subscription failed:", err);
    }
};


    const value = { currentUser, login, logout, register, isPremium, updateSubscription };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
