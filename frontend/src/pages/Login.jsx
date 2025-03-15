import Form from "../components/Form" //connects to form structure
import Header from "../components/Header" 
import Footer from "../components/Footer" 
import "../styles/Login.css"

function Login() {
    return (
        <div className="login-page">
            <Header />
            <main className="login-container">
                <Form route="/api/token/" method="login" />
            </main>
            <Footer />
        </div>
    );
}

export default Login