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
            <div className="header-col" />

            <div className="logo-container" onClick={handleHome}>
                <img src="/images/logo.jpg" alt="Road Trip Mate Logo" className="logo-img" />
            </div>

            <div className="header-col right">
            {isLoggedIn && (
                <div
                className="user-dropdown-wrapper"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
                >
                    <FaUserCircle className="user-icon" size={30} />
                    {dropdownOpen && (
                        <div className="dropdown">
                            <button className="dropdown-item" onClick={handleProfile}>Profile</button>
                            <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </div>
            )}
            </div>

            <div className="header-line" />
        </header>
    );
}

export default Header;
