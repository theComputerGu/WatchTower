import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { register } from "../services/auth.service";
import { loginSuccess } from "../store/auth/authSlice";
import AnimatedBackground from "../components/ui/AnimatedBackground";

export default function RegisterPage() {

  //connect to redux:
  const dispatch = useDispatch<AppDispatch>();

  //navigate:
  const navigate = useNavigate();

  //local useStates:
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  //function that handled signing up:
  async function handleSubmit() {

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const result = await register({ email, password, username });

      //holds in the redux:
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
          <h1>Create Account</h1>
          <p>Join WatchTower system</p>

          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="john_doe"
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button className="primary" onClick={handleSubmit}>
            Create Account
          </button>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}
