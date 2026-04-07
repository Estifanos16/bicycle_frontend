import React, { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roles, setRoles] = useState(['customer']);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRoleChange = (role) => {
        if (roles.includes(role)) {
            setRoles(roles.filter(r => r !== role));
        } else {
            setRoles([...roles, role]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await registerUser({ name, email, password, roles });
            setMessage(response.data.message);
            // Redirect to home after successful registration
            setTimeout(() => navigate('/'), 2000);
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
                        <label>Select your roles:</label>
                        <label>
                            <input type="checkbox" checked={roles.includes('customer')} onChange={() => handleRoleChange('customer')} />
                            Customer
                        </label>
                        <label>
                            <input type="checkbox" checked={roles.includes('supermarket')} onChange={() => handleRoleChange('supermarket')} />
                            Supermarket Owner
                        </label>
                        <label>
                            <input type="checkbox" checked={roles.includes('rider')} onChange={() => handleRoleChange('rider')} />
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