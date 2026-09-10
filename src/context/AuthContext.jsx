import React, { createContext, useState, useEffect } from 'react';
import { setToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setTokenState] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            setToken(token); // set axios header
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                
                console.log('JWT Payload:', payload);
                
                // Check if token is expired
                if (payload.exp && payload.exp < Date.now() / 1000) {
                    console.error('JWT token is expired');
                    localStorage.removeItem('token');
                    setTokenState(null);
                    setUser(null);
                    setLoading(false);
                    return;
                }
                
                const userData = { 
                    id: payload.id, 
                    _id: payload.id,
                    roles: payload.roles, 
                    email: payload.email, 
                    name: payload.name,
                    vendorId: payload.vendorId || payload.supermarketId,
                    supermarketId: payload.supermarketId || payload.vendorId
                };
                
                console.log('Setting user data:', userData);
                setUser(userData);
            } catch (err) {
                console.error('Error decoding JWT token:', err);
                localStorage.removeItem('token');
                setTokenState(null);
                setUser(null);
            }
        }
        setLoading(false);
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
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};