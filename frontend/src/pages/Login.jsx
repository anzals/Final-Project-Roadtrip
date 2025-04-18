import Form from "../components/Form" //connects to form structure
import Layout from "../components/Layout";
import "../styles/Login.css"

function Login() {
    return (
        <Layout>
            <div className="login-page">
                <main className="login-container">
                    <Form route="/api/token/" method="login" />
                </main>
            </div>
        </Layout>
    );
}

export default Login