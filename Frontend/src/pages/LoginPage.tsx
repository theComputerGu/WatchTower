import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import type { AppDispatch } from "../store";
import { login } from "../services/auth.service";
import { loginSuccess } from "../store/auth/authSlice";
import AnimatedBackground from "../components/ui/AnimatedBackground";

export default function LoginPage() {

  //connect to the redux
  const dispatch = useDispatch<AppDispatch>();

  //conect to the router
  const navigate = useNavigate();

  //local state in order to see those things:
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  //function that handles the log in process
  async function handleSubmit() {
    try {

      //hands the token that came back from the backend
      const result = await login({ email, password });

      //holds the user that came back from the backend in the redux
      dispatch(loginSuccess(result));
      
      navigate("/map");
    } catch (err: any) {
      setError(err.message);
    }
  }



  return (
    <>
      <AnimatedBackground />

      <div className="auth-page">
        <div className="auth-card">
          <h1>Sign In</h1>

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button className="primary" onClick={handleSubmit}>
            Sign In
          </button>

          <div className="auth-footer">
            Don’t have an account? <Link to="/register">Sign Up</Link>
          </div>
        </div>
      </div>
    </>
  );
}
