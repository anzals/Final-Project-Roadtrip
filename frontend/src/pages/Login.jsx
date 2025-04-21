// Code adopted from 
// Title: Django & React Web App Tutorial - Authentication, Databases, Deployments & More...
// Author: Tech With Tim
// Youtube link: https://www.youtube.com/watch?v=c-QsfbznSXI&t=7203s

import Form from "../components/Form" 
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