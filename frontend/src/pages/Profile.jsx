import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Layout from "../components/Layout";
import "../styles/Profile.css"

function Profile() {
    const [user, setUser] = useState({ firstName: '', lastName: '', email: '' }); // User info
    const [loading, setLoading] = useState(true); // Loading indicator
    const [editMode, setEditMode] = useState(false); // Edit mode toggle, determines if user can edit data
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Delete profile confirmation
    const [message, setMessage] = useState(''); // Show message
    const [showCurrentPassword, setShowCurrentPassword] = useState(false); // Allows user to toggle visibility for password inputs
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    // Fetch user info
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

    // Toggle edit mode
    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    // Save updates profile info
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
                // Store updated info locally for display
                localStorage.setItem("firstName", user.firstName);
                localStorage.setItem("lastName", user.lastName);
                localStorage.setItem("email", user.email);
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

    // Handle enter and escape when editing profile fields.
    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleSaveProfile();
        } else if (event.key === "Escape") {
            setEditMode(false);
        }
    };

    // Save password update after validating inputs
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
            setMessage("Error updatating password, please check your current password.");
        }
    };

    // Delete account with confirmation
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
        <Layout>
          <div className="profile-page">
            <div className="profile-container">
              <div className="profile-header">
                <h2>User Profile</h2>
                <button className="edit-user-profile-button" onClick={handleEditToggle}>
                  {editMode ? "Cancel" : "Edit"}
                </button>
              </div>
      
              <div className="profile-forms">
                <div className="profile-card">
                  <div className="profile-info">
                    <h3>User Details</h3>
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
                  <label>Current Password</label>
                  <div className="profile-password-toggle-container">
                    <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <span
                    className="toggle-password"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? "Hide" : "Show"}
                    </span>
                  </div>

                  <label>New Password</label>
                  <div className="profile-password-toggle-container">
                    <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <span
                    className="toggle-password"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </span>
                  </div>

                  <label>Confirm New Password</label>
                  <div className="profile-password-toggle-container">
                    <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </span>
                  </div>
                  
                  <button className="save-button" onClick={handleSavePassword}>
                    Save
                  </button>
                  {message && <p className="message">{message}</p>}
                </div>
              </div>
      
              <div className="delete-account-section">
                <button className="delete-profile-button" onClick={() => setShowDeleteConfirm(true)}>
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
        </Layout>
      );      
}

export default Profile;
