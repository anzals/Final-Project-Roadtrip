import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';

function Profile() {
    const [user, setUser] = useState({ firstName: '', lastName: '', email: '' });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await api.get('/api/user/profile/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
                });
                const { first_name, last_name, email } = response.data;
                setUser({
                    firstName: first_name,
                    lastName: last_name,
                    email: email,
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setLoading(false);
            }
        }
        fetchUserData();
    }, []);

    const handleEditProfile = () => {
        navigate('/profile/edit');
    };

    const handleChangePassword = () => {
        navigate('/profile/change-password');
    };

    if (loading) return <div>Loading profile...</div>;

    return (
        <div className="profile-page">
            <Header />
            <div className="profile-container">
                <h2>User Profile</h2>
                <div className="profile-card">
                    <img src={user.profilePicture} alt="Profile" className="profile-picture" />
                    <div className="profile-info">
                        <label>First Name</label>
                        <input type="firstName" value={user.firstName} disabled />
                        <label>Last Name</label>
                        <input type="lastName" value={user.lastName} disabled />
                        <label>Email</label>
                        <input type="email" value={user.email} disabled />
                        <label>Password</label>
                        <input type="password" value="********" disabled />
                    </div>
                    <button className="edit-button" onClick={handleEditProfile}>Edit</button>
                </div>
            </div>
        </div>
    );
}

export default Profile;
