import Header from "../components/Header" // Import Header
import Footer from "../components/Footer" // Import Footer
import Form from "../components/Form" // Import Form component
import Layout from "../components/Layout"
import "../styles/Register.css"
import api from "../api";

function Register() {
    return (
        <Layout>
            <div className="register-page">
                <main className="register-container">
                    <Form route="/api/user/register/" method="register" />
                </main>
            </div>
        </Layout>
    );
}

export default Register;
