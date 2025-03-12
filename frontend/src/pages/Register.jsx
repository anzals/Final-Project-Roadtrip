import Form from "../components/Form" //connects to form structure

function Register() {
    return <Form route="/api/user/register/" method="register" />
}

export default Register