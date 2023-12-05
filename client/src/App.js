import React from 'react';
import Modal from 'react-modal';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Create from './pages/Create'; // Import your new component
import MyLibrary from './pages/MyLibrary';
import Discover from './pages/Discover';
import HomePage from './pages/HomePage';
import './App.css'; // Assuming your CSS file is named App.css
import { AuthProvider } from './contexts/AuthContext';

Modal.setAppElement('#root');

function App() {
  return (
    <AuthProvider>
      <Router>
          <Routes>
            <Route path="/create" element={<Create />} />
            <Route path="/my-library" element={<MyLibrary />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
