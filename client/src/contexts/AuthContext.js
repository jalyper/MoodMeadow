// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      // Assuming the token is a JWT and the user's ID is stored in the payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.id);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    console.log('token valid, setting isLoggedIn to true...');
    setIsLoggedIn(true);
    // Assuming the token is a JWT and the user's ID is stored in the payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.user.id;
    localStorage.setItem('userId', userId);
    setUserId(payload.user.id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    console.log('token removed from local storage, setting isLoggedIn to false...');
    setIsLoggedIn(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, userId }}>
      {children}
    </AuthContext.Provider>
  );
};
