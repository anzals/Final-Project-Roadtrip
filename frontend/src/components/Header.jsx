import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "../styles/Header.css"; // Import header styles
import { ACCESS_TOKEN } from "../constants";
import { FaUserCircle } from "react-icons/fa"; // User icon

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false); 

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN); 
        setIsLoggedIn(token !== null);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        navigate("/login");
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <header className="header">
            <div className="logo">
                <img src="/images/logo.png" alt="Road Trip Mate Logo" className="logo-img"/>
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
};

export default Header;