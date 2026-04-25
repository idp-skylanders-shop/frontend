import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import logo from './assets/logo.jpg';

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();

  const handleSuccess = (token, user) => {
    onLoginSuccess(token, user);
    navigate('/');
  };

  return (
    <div className="login-page-container">
      <img src={logo} alt="Logo" style={{ width: "20vw", marginBottom: "20px" }} />
      
      <h1>Portal Authentication</h1>
      
      <LoginForm onLoginSuccess={handleSuccess} />
      
      <button 
        style={{marginTop: "20px", background: "none", border: "none", color: "blue", cursor: "pointer"}}
        onClick={() => navigate('/')}
      >
        Cancel / Go Back
      </button>
    </div>
  );
}

export default LoginPage;