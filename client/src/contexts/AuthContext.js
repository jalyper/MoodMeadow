// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    console.log('token valid, setting isLoggedIn to true...');
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    console.log('token removed from local storage, setting isLoggedIn to false...');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
