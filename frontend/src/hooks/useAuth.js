import { useState } from "react";
import { getMe } from "../services/authService";

export const useAuth = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const loginUser = (data) => {
    localStorage.setItem("token", data.token);
    const { token, ...userData } = data;
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const updateUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const refreshUser = async () => {
    const userData = await getMe();
    updateUser(userData);
    return userData;
  };

  const logoutUser = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loginUser, updateUser, refreshUser, logoutUser };
};
