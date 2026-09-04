import React, { createContext, useState, useEffect } from 'react';
import { setToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setTokenState] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        if (token) {
            setToken(token); // set axios header
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ 
                    id: payload.id, 
                    _id: payload.id,
                    roles: payload.roles, 
                    email: payload.email, 
                    name: payload.name,
                    vendorId: payload.vendorId || payload.supermarketId,
                    supermarketId: payload.supermarketId || payload.vendorId
                });
            } catch (err) {
                console.error('Error decoding JWT token:', err);
                setUser(null);
            }
        }
    }, [token]);

    const login = (token) => {
        localStorage.setItem('token', token);
        setTokenState(token);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setTokenState(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};