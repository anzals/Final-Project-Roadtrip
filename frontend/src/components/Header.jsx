import React from "react";
import "../styles/Header.css"; // Import header styles

const Header = () => {
    return (
        <header className="header">
            <div className="logo">
                <img src="/images/logo.png" alt="Road Trip Mate Logo" className="logo-img"/>
                <h1>Road Trip Mate</h1>
            </div>
            <hr className="header-line" />
        </header>
    );
};

export default Header;
