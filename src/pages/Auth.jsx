import React, { useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import bicycleImage from '../assets/Bicycle delivery image.jpg';

const Auth = () => {
    const { login } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: ['customer']
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('auth-page');
        return () => {
            document.body.classList.remove('auth-page');
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleChange = (role) => {
        setFormData(prev => ({
            ...prev,
            roles: [role]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            if (isLogin) {
                const response = await loginUser({
                    email: formData.email,
                    password: formData.password
                });
                login(response.data.token);
                navigate('/');
            } else {
                const response = await registerUser(formData);
                setMessage(response.data.message || 'Registered successfully');

                // Auto-login after registration
                try {
                    const loginRes = await loginUser({ email: formData.email, password: formData.password });
                    login(loginRes.data.token);
                    navigate('/');
                } catch (loginErr) {
                    console.error('Auto-login failed:', loginErr);
                    // If auto-login fails, stay on the page and show message
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || `${isLogin ? 'Login' : 'Registration'} failed`);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setMessage('');
        setFormData({
            name: '',
            email: '',
            password: '',
            roles: ['customer']
        });
    };

    return (
        <div className="auth-container">
            <button className="auth-close-btn" onClick={() => navigate('/')}>✕</button>
            <div className="auth-left">
                <img src={bicycleImage} alt="Bicycle Delivery" className="auth-image" />
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
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLogin ? 'Sign in to manage orders, favorites, and delivery status' : 'Join us and start your journey'}</p>
                    {(error || message) && (
                        <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
                            {error || message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="auth-form">
                        {!isLogin && (
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="auth-roles">
                                <label>Select your role:</label>
                                <div className="role-tiles">
                                    <div 
                                        className={`role-tile ${formData.roles.includes('customer') ? 'active' : ''}`}
                                        onClick={() => handleRoleChange('customer')}
                                    >
                                        <span className="role-icon">🛒</span>
                                        <span>Customer</span>
                                    </div>
                                    <div 
                                        className={`role-tile ${formData.roles.includes('supermarket') ? 'active' : ''}`}
                                        onClick={() => handleRoleChange('supermarket')}
                                    >
                                        <span className="role-icon">🏪</span>
                                        <span>Supermarket Owner</span>
                                    </div>
                                    <div 
                                        className={`role-tile ${formData.roles.includes('rider') ? 'active' : ''}`}
                                        onClick={() => handleRoleChange('rider')}
                                    >
                                        <span className="role-icon">🚴</span>
                                        <span>Rider</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
                    </form>
                    <p className="auth-switch">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <a href="#" onClick={(e) => { e.preventDefault(); toggleMode(); }}>
                            {isLogin ? 'Register' : 'Login'}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;