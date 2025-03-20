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
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";
    const imageSrc = method === "login" ? "images/login-img.jpg" : "images/signup-img.jpg";
    <img src={imageSrc} alt="Form visual" className="form-image" onError={() => console.log("Image failed to load:", imageSrc)} />


    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        const userData = { email, password };

        if (method === "register") {  
            userData.first_name = firstName;
            userData.last_name = lastName;
        }

        try {
            const res = await api.post(route, userData);
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
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
