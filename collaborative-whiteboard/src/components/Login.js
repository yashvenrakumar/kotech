import React, { useState } from "react";
import useLogin from "../hooks/useLogin"; // Import the custom hook
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, isLoading } = useLogin(); // Use the custom hook

  const navigate = useNavigate();

  const goToRegister = () => {
    navigate("/register");
  };
  const goToHome = () => {
    navigate("/");
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>
      <div className="w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => handleLogin(email, password)}
          disabled={isLoading} // Disable button while loading
          className={`w-full bg-blue-500 text-white py-3 px-4 rounded shadow-md hover:bg-blue-600 transition ${
            isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <button
          onClick={goToRegister}
          className="mt-4 w-full text-blue-500 hover:text-blue-700 transition text-sm"
        >
          Register
        </button>
        <button
          onClick={goToHome}
          className="mt-4 w-full text-blue-500 hover:text-blue-700 transition text-sm"
        >
          Home
        </button>
      </div>
    </div>
  );
};

export default Login;
