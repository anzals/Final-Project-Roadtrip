import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';

function Profile() {
    const [user, setUser] = useState({ firstName: '', lastName: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [message, setMessage] = useState('');
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

    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    const handleSaveProfile = async () => {
        try {
            const response = await api.patch('/api/user/profile/', {
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
            });
    
            if (response.status === 200) {
                setMessage("Profile updated successfully!");
                setEditMode(false);
            } else {
                setMessage("Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage("Error updating profile.");
        }
    };
       


    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleSaveProfile();
        } else if (event.key === "Escape") {
            setEditMode(false);
        }
    };

    const handleSavePassword = async () => {
        if (!currentPassword) {
            setMessage("Please enter your current password.");
            return;
        }
    
        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }
    
        if (newPassword.length < 8) {
            setMessage("New password must be at least 8 characters long.");
            return;
        }
    
        try {
            const response = await api.patch('/api/user/change-password/', {
                current_password: currentPassword,
                new_password: newPassword,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
            });
    
            if (response.status === 200) {
                setMessage("Password updated successfully!");
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage("Failed to update password.");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            setMessage("Error updating password. Please check your current password.");
        }
    };
    
    const handleDeleteAccount = async () => {
        try {
            const response = await api.delete('/api/user/delete/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                }
            });

            if (response.status === 204) {
                localStorage.clear();
                navigate("/login");
            } else {
                setMessage("Failed to delete account.");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            setMessage("Error deleting account.");
        }
    };

    if (loading) return <div>Loading profile...</div>;

    return (
        <div className="profile-page">
            <Header />
            <div className="profile-container">
                <h2>User Profile</h2>
                <div className="profile-card">
                    <button className="edit-button" onClick={handleEditToggle}>
                        {editMode ? "Cancel" : "Edit"}
                    </button>
                    <div className="profile-info">
                        <label>First Name</label>
                        <input
                            type="text"
                            value={user.firstName}
                            disabled={!editMode}
                            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                            onKeyDown={handleKeyPress}
                        />
                        <label>Last Name</label>
                        <input
                            type="text"
                            value={user.lastName}
                            disabled={!editMode}
                            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                            onKeyDown={handleKeyPress}
                        />
                        <label>Email</label>
                        <input
                            type="email"
                            value={user.email}
                            disabled={!editMode}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            onKeyDown={handleKeyPress}
                        />
                    </div>
                </div>

                <div className="password-change-card">
                    <h3>Change Password</h3>
                    <label>Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <label>New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button className="save-button" onClick={handleSavePassword}>
                        Save
                    </button>
                    {message && <p className="message">{message}</p>}
                </div>

                <div className="delete-account-section">
                    <button
                        className="delete-button"
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        Delete Account
                    </button>
                </div>

                {showDeleteConfirm && (
                    <div className="delete-popup">
                        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                        <button onClick={handleDeleteAccount}>Yes, delete my account</button>
                        <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
