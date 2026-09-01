import React, { useState, useContext, useEffect } from 'react';
import { registerUser, loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import bicycleImage from '../assets/Bicycle delivery image.jpg';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('customer');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        document.body.classList.add('auth-page');
        return () => {
            document.body.classList.remove('auth-page');
        };
    }, []);

    const handleRoleChange = (role) => {
        setRole(role);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await registerUser({ name, email, password, roles: [role] });
            setMessage(response.data.message || 'Registered successfully');

            // Immediately log user in after successful registration
            try {
                const loginRes = await loginUser({ email, password });
                const token = loginRes.data.token;
                if (token) {
                    login(token);
                }
            } catch (loginErr) {
                console.error('Auto-login failed:', loginErr);
            }

            navigate('/');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <button className="auth-close-btn" onClick={() => navigate('/')}>✕</button>
            <div className="auth-left">
                <div className="auth-logo">
                    <div className="auth-logo-mark">B</div>
                    <div className="auth-logo-text">Bicycle App</div>
                </div>
                <div className="auth-image-container">
                    <img src={bicycleImage} alt="Bicycle Delivery" className="auth-image" />
                </div>
                <div className="auth-overlay">
                    <div className="auth-stars">
                        <span>⭐</span>
                        <span>⭐</span>
                        <span>⭐</span>
                        <span>⭐</span>
                        <span>⭐</span>
                    </div>
                    <p className="auth-inspiration">Your trusted delivery partner for everything you need</p>
                </div>
            </div>
            <div className="auth-right">
                <div className="auth-form-container">
                    <h2>Create Account</h2>
                    <p>Join us and start your journey</p>
                    {message && <div className={`alert ${message.includes('failed') ? 'alert-error' : 'alert-success'}`}>{message}</div>}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Enter your password" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="auth-roles">
                            <label>Select your role:</label>
                            <div className="role-tiles">
                                <div className={`role-tile ${role === 'customer' ? 'active' : ''}`} onClick={() => handleRoleChange('customer')}>
                                    <span className="role-icon">🛒</span>
                                    <span>Customer</span>
                                </div>
                                <div className={`role-tile ${role === 'supermarket' ? 'active' : ''}`} onClick={() => handleRoleChange('supermarket')}>
                                    <span className="role-icon">🏪</span>
                                    <span>Supermarket Owner</span>
                                </div>
                                <div className={`role-tile ${role === 'rider' ? 'active' : ''}`} onClick={() => handleRoleChange('rider')}>
                                    <span className="role-icon">🚴</span>
                                    <span>Rider</span>
                                </div>
                            </div>
                        </div>
                        <button type="submit">Register</button>
                    </form>
                    <p className="auth-switch">
                        Already have an account? <a href="/login">Login</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;