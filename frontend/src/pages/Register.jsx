import Header from "../components/Header" // Import Header
import Footer from "../components/Footer" // Import Footer
import Form from "../components/Form" // Import Form component
import "../styles/Register.css"

function Register() {
    return (
        <div className="register-page">
            <Header />
            <main className="register-container">
                <Form route="/api/user/register/" method="register" />
            </main>
            <Footer />
        </div>
    );
}

export default Register;
