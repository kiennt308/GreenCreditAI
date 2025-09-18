import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
// import io from 'socket.io-client';

import './i18n';
import { LanguageProvider } from './contexts/LanguageContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import EvaluationForm from './components/EvaluationForm';
import LanguageSwitcher from './components/LanguageSwitcher';

const AppContent = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored authentication
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  // Set up axios defaults for authenticated requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <img src="./GCT_logo.png" alt="Logo" style={{ width: '60px', height: '60px', marginRight: '10px' }} />
            <a className="navbar-brand" href="/">GreenCredit AI</a>
            <div className="navbar-nav ms-auto d-flex align-items-center">
              <div className="me-3">
                <LanguageSwitcher />
              </div>
              {isAuthenticated ? (
                <>
                  <span className="navbar-text me-3">{t('auth.welcomeMessage', { username: user?.username || 'User' })}</span>
                  <button className="btn btn-outline-light" onClick={handleLogout}>
                    {t('auth.logoutButton')}
                  </button>
                </>
              ) : (
                <>
                  <a className="nav-link" href="/login">{t('navigation.login')}</a>
                  <a className="nav-link" href="/register">{t('navigation.register')}</a>
                </>
              )}
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register onLogin={handleLogin} />
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard user={user} token={token} />
            </ProtectedRoute>
          } />
          <Route path="/evaluate" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <EvaluationForm user={user} token={token} />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;