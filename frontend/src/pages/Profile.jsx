import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';

function Profile() {
    const [user, setUser] = useState({ name: '', email: '', profilePicture: '' });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await api.get('/api/user/profile/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
                });
                setUser(response.data);
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
            <h2>Account Details</h2>
            <div className="profile-details">
                <img src={user.profilePicture} alt="Profile" className="profile-picture" />
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <div className="profile-buttons">
                    <button onClick={handleEditProfile}>Edit Profile</button>
                    <button onClick={handleChangePassword}>Change Password</button>
                </div>
            </div>
        </div>
    );
}

export default Profile;
