import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (email, password) => {
    setIsLoading(true);

    try {
      await axios.post("http://localhost:5000/auth/register", { email, password });
      alert("Registration successful");
      navigate("/login"); // Redirect to login page after successful registration
    } catch (error) {
      console.error("Registration failed:", error.message || error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleRegister, isLoading };
};

export default useRegister;
