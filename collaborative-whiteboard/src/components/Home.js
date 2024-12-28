import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useCreateSession from "../hooks/useCreateSession"; // Import the custom hook

const Home = () => {
  const [sessionId, setSessionId] = useState("");
  const { createSession, isLoading } = useCreateSession(); // Use the custom hook

  const navigate = useNavigate();

  const joinSession = () => {
    if (sessionId) {
      navigate(`/whiteboard/${sessionId}`);
    } else {
      alert("Please enter a session ID");
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome to Collaborative Whiteboard
      </h2>
      <button
        onClick={createSession}
        disabled={isLoading} // Disable button while loading
        className={`bg-blue-500 text-white py-2 px-4 rounded shadow-md hover:bg-blue-600 transition mb-4 ${
          isLoading ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        {isLoading ? "Creating..." : "Create Session"}
      </button>
      <div className="w-full max-w-sm mb-4">
        <input
          type="text"
          placeholder="Enter Session ID"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={joinSession}
          className="w-full bg-green-500 text-white py-2 px-4 rounded shadow-md hover:bg-green-600 transition"
        >
          Join Session
        </button>
      </div>
      <div className="flex gap-4">
        <button
          onClick={goToLogin}
          className="bg-indigo-500 text-white py-2 px-4 rounded shadow-md hover:bg-indigo-600 transition"
        >
          Login
        </button>
        <button
          onClick={goToRegister}
          className="bg-yellow-500 text-white py-2 px-4 rounded shadow-md hover:bg-yellow-600 transition"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Home;
