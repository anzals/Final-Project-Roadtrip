import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import { ACCESS_TOKEN } from "../constants";
import { FaUserCircle } from "react-icons/fa";

function Header() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        setIsLoggedIn(token !== null);
    }, []);

    const handleHome = () => {
        navigate("/");
    };

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        navigate("/login");
    };

    const handleProfile = () => {
        navigate("/profile");
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <header className="header">
            <div className="logo" onClick={handleHome}>
                <img src="/images/logo.png" alt="Road Trip Mate Logo" className="logo-img" />
            </div>
            <h1>Road Trip Mate</h1>
            {isLoggedIn && (
                <div 
                    className="user-icon-container" 
                    onMouseEnter={toggleDropdown} 
                    onMouseLeave={toggleDropdown}
                >
                    <FaUserCircle className="user-icon" size={30} />
                    {dropdownOpen && (
                        <div className="dropdown">
                            <button className="dropdown-item" onClick={handleProfile}>
                                Profile
                            </button>
                            <button className="dropdown-item" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
            <div className="header-line" />
        </header>
    );
}

export default Header;
