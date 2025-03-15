import React from "react";
import "../styles/Footer.css"; // Import footer styles

const Footer = () => {
    return (
        <footer className="footer">
            <div className="contact-info">
                <h3>Contact</h3>
                <p>Email: support@roadtripmate.com</p>
                <p>Phone: +44 1234 567890</p>
            </div>
            <div className="social-icons">
                <a href="#" className="social-icon">✖️</a>
                <a href="#" className="social-icon">📷</a>
                <a href="#" className="social-icon">▶️</a>
            </div>
        </footer>
    );
};

export default Footer;
