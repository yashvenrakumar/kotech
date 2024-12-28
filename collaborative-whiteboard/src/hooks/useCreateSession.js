import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const useCreateSession = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const createSession = async () => {
    const newSessionId = `${Date.now()}`;
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/api/session", // Fixed the URL
        { sessionId: newSessionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Session created successfully");
      navigate(`/whiteboard/${newSessionId}`);
    } catch (error) {
      console.error("Error creating session:", error.message || error);
      alert("Session creation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { createSession, isLoading };
};

export default useCreateSession;
