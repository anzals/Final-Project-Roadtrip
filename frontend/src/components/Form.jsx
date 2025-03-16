import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Sign Up";
    const imageSrc = method === "login" ? "/images/login-img.jpg" : "/images/signup-img.jpg";

    // Dynamic link text and route
    const linkText = method === "login" ? "Sign up" : "Login";
    const linkRoute = method === "login" ? "/register" : "/login";
    const linkMessage = method === "login" 
        ? "Don't have an account yet?" 
        : "Already have an account?";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { email, password });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login"); // Redirect to login page after registering
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-wrapper">
            <div className="form-grid">
                {/* Image Section */}
                <div className="form-image-container">
                    <img src={imageSrc} alt="Form visual" className="form-image" />
                </div>
    
                {/* Form Section */}
                <div className="form-content-container">
                    <h1 className="form-title">{name}</h1>
                    <form onSubmit={handleSubmit}>
                        <input 
                            className="form-input" 
                            type="text" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email" 
                        />
                        <input 
                            className="form-input" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Password" 
                        />
                        {loading && <LoadingIndicator />}
                        <button className="form-button" type="submit">{name}</button>
                    </form>

                    {/* Add navigation link */}
                    <p className="form-link">
                        {linkMessage} <Link to={linkRoute} className="link-text">{linkText}</Link>
                    </p>
                </div>
            </div>
        </div>
    );    
}

export default Form;

// testing