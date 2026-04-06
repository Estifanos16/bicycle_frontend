import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const register = async () => {
    try {
      await API.post("/auth/register", {
        name,
        email,
        password,
        role
      });

      alert("Registration successful!");
    } catch (error) {
      alert("Registration failed");
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="customer">Customer</option>
        <option value="rider">Rider</option>
        <option value="supermarket">Supermarket</option>
      </select>

      <button onClick={register}>Register</button>
    </div>
  );
}
<p>
  Already have an account? <Link to="/">Login</Link>
</p>

export default Register;