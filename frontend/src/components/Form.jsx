import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState(""); 
    const [lastName, setLastName] = useState("");   
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";
    const imageSrc = method === "login" ? "images/login-img.jpg" : "images/signup-img.jpg";
    <img src={imageSrc} alt="Form visual" className="form-image" onError={() => console.log("Image failed to load:", imageSrc)} />


    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        setFormError("");
    
        const userData = { email, password };

        if (method === "register" && (!firstName || !lastName || !email || !password)) {
            setFormError("All fields are required.");
            setLoading(false);
            return;
        }    

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setFormError("Please enter a valid email address.");
            return;
        }

        if (password.length < 8) {
            setFormError("Password must be at least 8 characters long.");
            return;
        }
    
    
        if (method === "register") {  

            if (method === "register" && password.length < 8) {
                setFormError("Password must be at least 8 characters long.");
                setLoading(false);
                return;
            }
            
            userData.first_name = firstName;
            userData.last_name = lastName;
        }
    
        try {
            const res = await api.post(route, userData);
    
            if (method === "login") {
                // Store tokens in local storage
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
    
                // Fetch user profile using the access token
                const profileRes = await api.get("/api/user/profile/", {
                    headers: {
                        Authorization: `Bearer ${res.data.access}`,
                    },
                });
    
                // Save user's first name in local storage
                localStorage.setItem("firstName", profileRes.data.first_name);
    
                // Redirect to the home page
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            const serverMessage = error.response?.data?.detail;

            if (method === "login" && serverMessage) {
                setFormError("Invalid email or password.");
            } else if (method === "register" && serverMessage?.includes("already exists")) {
                setFormError("An account with this email already exists.");
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
                        <input
                            className="form-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
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
