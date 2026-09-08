import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth — thin wrapper over AuthContext for clean, readable hook usage.
 *
 * Usage:
 *   const { user, login, logout, loading } = useAuth();
 */
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default useAuth;
