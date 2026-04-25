import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import keycloak from "./keycloak";
import Home from './Home';
import LoginPage from './LoginPage';
import AddProduct from './AddProduct';
import Order from './Order';
import './App.css';
import { CartProvider } from './CartContext';
import Profile from './Profile';

// componenta radacina care leaga toate fisierele impreuna
// defineste toate rutele posibile pentru site

const parseRoles = (token) => {
  try {
    if (!token) return [];
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const data = JSON.parse(jsonPayload);
    return data.realm_access?.roles || [];
  } catch (e) {
    console.error("Failed to parse roles", e);
    return [];
  }
};

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");
  const [roles, setRoles] = useState([]);

  const isRun = useRef(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("react-token");
    const storedUser = sessionStorage.getItem("react-username");

    if (storedToken && storedUser) {
      setAuthenticated(true);
      setToken(storedToken);
      setUsername(storedUser);
      setRoles(parseRoles(storedToken)); 
    } 
  }, []);

  const handleLoginSuccess = (accessToken, user) => {
    sessionStorage.setItem("react-token", accessToken);
    sessionStorage.setItem("react-username", user);

    setAuthenticated(true);
    setToken(accessToken);
    setUsername(user);
    setRoles(parseRoles(accessToken));
  };

  const handleLogout = () => {
    sessionStorage.removeItem("react-token");
    sessionStorage.removeItem("react-username");
    
    setAuthenticated(false);
    setToken(null);
    setUsername("");
    setRoles([]);
    keycloak.logout(); 
  };

  return (
  <BrowserRouter>
    <CartProvider>
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              authenticated={authenticated} 
              username={username} 
              onLogout={handleLogout} 
              token={token}
              roles={roles}
            />
          } 
        />

        <Route 
          path="/login" 
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />

        <Route 
          path="/add_product" 
          element={<AddProduct token={token} />}
        />

        <Route 
          path="/order" 
          element={<Order username={username} />}
        />

        <Route
          path="/profile"
          element={<Profile username={username} />}
        />
      </Routes>
    </CartProvider>
  </BrowserRouter>
);
}

export default App;