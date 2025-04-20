import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";
import { validateEmail, validatePassword, doPasswordsMatch } from '../utils/validate';


function Form({ route, method }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState(""); 
    const [lastName, setLastName] = useState("");   
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";
    const imageSrc = method === "login" ? "images/login-img.jpg" : "images/signup-img.jpg";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        setFormError("");
    
        const userData = { email, password };
    
        if (method === "register") {
            if (!firstName || !lastName || !email || !password) {
                setFormError("All fields are required.");
                setLoading(false);
                return;
            }
    
            if (password.length < 8) {
                setFormError("Password must be at least 8 characters long.");
                setLoading(false);
                return;
            }
    
            userData.first_name = firstName;
            userData.last_name = lastName;
        }
    
        if (!validateEmail(email)) {
            setFormError("Please enter a valid email address.");
            setLoading(false);
            return;
        }
    
        try {
            const res = await api.post(route, userData);
    
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
    
                const profileRes = await api.get("/api/user/profile/", {
                    headers: {
                        Authorization: `Bearer ${res.data.access}`,
                    },
                });
    
                localStorage.setItem("firstName", profileRes.data.first_name);
                navigate("/");
            } else {
                navigate("/login");
            }
    
        } catch (error) {
            let serverMessage = error.response?.data?.detail || error.response?.data?.error;
        
            // If no direct detail, check for field-specific errors like { email: [...] }
            if (!serverMessage && error.response?.data) {
                const errorData = error.response.data;
                const firstKey = Object.keys(errorData)[0];
                const firstError = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
        
                serverMessage = firstError;
            }
        
            if (method === "login" && serverMessage) {
                setFormError("Invalid email and/or password.");
            } else if (method === "register" && serverMessage?.toLowerCase().includes("already exists")) {
                setFormError("An account with this email already exists.");
            } else if (serverMessage) {
                setFormError(serverMessage);
            } else {
                setFormError("Something went wrong. Please try again.");
            }
    
        } finally {
            setLoading(false);
        }
    };
    
    
    

    return (
        <div className="form-wrapper">
            <div className="form-grid">
            <div className="form-image-container">
                    <img 
                        src={imageSrc} 
                        alt="Form visual" 
                        className="form-image" 
                        onError={() => console.log("Image failed to load:", imageSrc)}
                    />
                </div>
                <div className="form-content-container">
                    <h1 className="form-title">{name}</h1>
                    {formError && <p className="form-error">{formError}</p>}
                    <form onSubmit={handleSubmit} className={method === "register" ? "register-form" : "login-form"}>
                        {method === "register" && (  
                            <div className="name-inputs"> 
                            <input
                                className="form-input half-width"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First Name"
                                required
                            />
                            <input
                                className="form-input half-width"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last Name"
                                required
                            />
                            </div>
                        )}
                        <input
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                        <div className="password-toggle-container">
  <input
    className="form-input"
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Password"
    required
  />
  <span
    className="toggle-password"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "Hide" : "Show"}
  </span>
</div>

                        {loading && <LoadingIndicator />}
                        <button className="form-button" type="submit">{name}</button>
                    </form>
                    <p className="form-link">
                        {method === "login"
                            ? "Don't have an account yet?"
                            : "Already have an account?"}{" "}
                        <Link to={method === "login" ? "/register" : "/login"} className="link-text">
                            {method === "login" ? "Register" : "Login"}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}


export default Form;
