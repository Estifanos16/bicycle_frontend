import React, { useState, useContext } from 'react';
import { loginUser, registerUser } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
        <div className="container">
            <div className="page-header auth-page-header">
                <div className="auth-page-top">
                    <span className="auth-page-icon">👤</span>
                    <div>
                        <h2>Account Profile</h2>
                        <p>{isLogin ? 'Sign in to manage orders, favorites, and delivery status.' : 'Create your account and start shopping with Bicycle App.'}</p>
                    </div>
                </div>
            </div>

            {(error || message) && (
                <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
                    {error || message}
                </div>
            )}

            <div className="card card-form">
                <div className="auth-toggle">
                    <button
                        type="button"
                        className={`auth-toggle-btn ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className={`auth-toggle-btn ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="product-form">
                    {!isLogin && (
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />

                    {!isLogin && (
                        <div className="roles-section">
                            <label>Select your role:</label>
                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="customer"
                                    checked={formData.roles.includes('customer')}
                                    onChange={() => handleRoleChange('customer')}
                                />
                                Customer
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="supermarket"
                                    checked={formData.roles.includes('supermarket')}
                                    onChange={() => handleRoleChange('supermarket')}
                                />
                                Supermarket Owner
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="role"
                                    value="rider"
                                    checked={formData.roles.includes('rider')}
                                    onChange={() => handleRoleChange('rider')}
                                />
                                Rider
                            </label>
                        </div>
                    )}

                    <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
                </form>
            </div>
        </div>
    );
};

export default Auth;