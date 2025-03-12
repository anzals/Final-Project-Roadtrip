import Form from "../components/Form" //connects to form structure

function Login() {
    return <Form route="/api/token/" method="login" />
}

export default Login