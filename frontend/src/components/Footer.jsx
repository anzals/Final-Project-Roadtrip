import "../styles/Footer.css"; 
import { FaInstagram, FaYoutube } from "react-icons/fa";

function Footer() {
    return (
        <footer className="footer">
            <div className="contact-info">
                <h3>Contact</h3>
                <p>Email: support@roadtripmate.com</p>
                <p>Phone: +44 1234 567890</p>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Roadtrip Mate. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
