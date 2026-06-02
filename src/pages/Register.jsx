import React, { useState, useContext } from 'react';
import { registerUser, loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

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
        <div className="container">
            <div className="page-header">
                <h2>Register</h2>
                <p>Create your account and select your roles in the Bicycle App.</p>
            </div>
            {message && <div className="alert">{message}</div>}
            <div className="card card-form">
                <form onSubmit={handleSubmit} className="product-form">
                    <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <div className="roles-section">
                        <label>Select your role:</label>
                        <label>
                            <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={() => handleRoleChange('customer')} />
                            Customer
                        </label>
                        <label>
                            <input type="radio" name="role" value="supermarket" checked={role === 'supermarket'} onChange={() => handleRoleChange('supermarket')} />
                            Supermarket Owner
                        </label>
                        <label>
                            <input type="radio" name="role" value="rider" checked={role === 'rider'} onChange={() => handleRoleChange('rider')} />
                            Rider
                        </label>
                    </div>
                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;