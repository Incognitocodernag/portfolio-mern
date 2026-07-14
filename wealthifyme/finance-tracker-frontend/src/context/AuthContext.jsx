import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wm-user")); }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("wm-token"));
  const [showSplash, setShowSplash] = useState(false);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("wm-user", JSON.stringify(userData));
    localStorage.setItem("wm-token", authToken);
  };

  const register = (userData, authToken) => {
    login(userData, authToken);
    setShowSplash(true); // trigger splash after registration
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("wm-user");
    localStorage.removeItem("wm-token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, showSplash, setShowSplash }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);