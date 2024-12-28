import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      alert("Login successful");
      navigate("/"); // Redirect to home or desired page
    } catch (error) {
      console.error("Login failed:", error.message || error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};

export default useLogin;
