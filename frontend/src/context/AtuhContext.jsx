import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment.jsx";

// Create the context
export const AuthContext = createContext(null);

// Axios client for API
const client = axios.create({
  baseURL: `${server}/api/v1/users`
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Register function
  const handleRegister = async (name, username, password) => {
    try {
      const response = await client.post("/register", {
        name,
        username,
        password,
      });

      if (response.status === httpStatus.CREATED) {
        return response.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  // Login function
  const handleLogin = async (username, password) => {
    try {
      const response = await client.post("/login", {
        username,
        password,
      });

      if (response.status === httpStatus.OK) {
        localStorage.setItem("token", response.data.token);
        setUserData(response.data.user); // optional, based on your backend
        navigate("/home");
      }
    } catch (err) {
      throw err;
    }
  };

  // Get user activity history
  const getHistoryOfUser = async () => {
    try {
      const response = await client.get("/get_all_activity", {
        params: {
          token: localStorage.getItem("token")
        }
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // Add meeting to user's history
  const addToUserHistory = async (meetingCode) => {
    try {
      const response = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode,
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // Context value
  const value = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addToUserHistory,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
