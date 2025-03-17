import React from "react";
import "../styles/Footer.css"; // Import footer styles
import { FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="contact-info">
                <h3>Contact</h3>
                <p>Email: support@roadtripmate.com</p>
                <p>Phone: +44 1234 567890</p>
            </div>
            <div className="social-icons">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FaInstagram size={24} /></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FaYoutube size={24} /></a>
            </div>
        </footer>
    );
};

export default Footer;
