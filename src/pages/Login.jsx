import React, { useState, useContext, useEffect } from 'react';
import { loginUser } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('auth-page');
        return () => {
            document.body.classList.remove('auth-page');
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ email, password });
            login(response.data.token);
            setError('');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-left">
                <div className="auth-logo">
                    <div className="auth-logo-mark">B</div>
                    <div className="auth-logo-text">Bicycle App</div>
                </div>
                <div className="auth-stars">
                    <span>⭐</span>
                    <span>⭐</span>
                    <span>⭐</span>
                    <span>⭐</span>
                    <span>⭐</span>
                </div>
                <p className="auth-inspiration">Your trusted delivery partner for everything you need</p>
            </div>
            <div className="auth-right">
                <div className="auth-form-container">
                    <h2>Welcome Back</h2>
                    <p>Sign in to your account to continue</p>
                    {error && <div className="alert">{error}</div>}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="submit">Login</button>
                    </form>
                    <p className="auth-switch">
                        Don't have an account? <a href="/register">Register</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;