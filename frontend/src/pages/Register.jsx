// Code adopted from 
// Title: Django & React Web App Tutorial - Authentication, Databases, Deployments & More...
// Author: Tech With Tim
// Youtube link: https://www.youtube.com/watch?v=c-QsfbznSXI&t=7203s

import Form from "../components/Form" // Import Form component
import Layout from "../components/Layout"
import "../styles/Register.css"


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
