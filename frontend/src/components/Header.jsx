import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "../styles/Header.css"; // Import header styles
import { ACCESS_TOKEN } from "../constants";

const Header = () => {
    const navigate = useNavigate()
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN); 
        setIsLoggedIn(token !== null);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        navigate("/login");
    };

    return (
        <header className="header">
            <div className="logo">
                <img src="/images/logo.png" alt="Road Trip Mate Logo" className="logo-img"/>
            </div>
            <h1>Road Trip Mate</h1>
            {isLoggedIn && (
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            )}
            <div className="header-line" />
        </header>
    );
};

export default Header;