import React, { useState } from "react";
import "./App.css";
import bgImage from "./assets/background.jpg";

/*
  Fisier care se ocupa de UI-ul pentru logarea sau crearea unui noi
  utilizator pe site. 

  Un utilizator poate deveni un seller
*/

function LoginForm({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confPass, setconfPass] = useState("");
  const [wantToSell, setWantToSell] = useState(false); 
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegistering) {
      if (password !== confPass) {
        setError("Passwords do not match!");
        return;
      }

      try {
        const roleAssign = wantToSell ? "seller" : "user";

        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            username: username, 
            password: password,
            role: roleAssign 
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          alert("Account created successfully! You can now login.");
          setIsRegistering(false);
          setPassword("");
          setconfPass("");
          setWantToSell(false);
        } else {
          setError(data.message || "Registration Failed");
        }
      } catch (err) {
        console.error(err);
        setError("Backend Error, could not connect");
      }
      return;
    }

    const urlParams = new URLSearchParams();
    urlParams.append("client_id", "react-frontend");
    urlParams.append("grant_type", "password");
    urlParams.append("username", username);
    urlParams.append("password", password);

    try {
      const response = await fetch("/realms/skylander_shop/protocol/openid-connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlParams,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("react-token", data.access_token);
        localStorage.setItem("react-username", username);
        onLoginSuccess(data.access_token, username);
      } else {
        setError("Invalid Portal Name or Secret Code");
      }
    } catch (err) {
      console.error(err);
      setError("Connection Error: Is Keycloak running on port 8081?");
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setPassword("");
    setconfPass("");
    setWantToSell(false);
  };

  return (
    <div className="login-box">
      
      <div 
        className="login-bg-layer"
        style={{ backgroundImage: `url(${bgImage})` }} 
      />

      <div className="login-content">
          <h3>{isRegistering ? "New Portal Master" : "Portal Access"}</h3>
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              placeholder="Portal Master Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="magic-input"
              required
            />

            <input
              type="password"
              placeholder="Secret Code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="magic-input"
              required
            />

            {isRegistering && (
              <>
                <input
                  type="password"
                  placeholder="Confirm Secret Code"
                  value={confPass}
                  onChange={(e) => setconfPass(e.target.value)}
                  className="magic-input"
                  required
                  style={{ borderColor: (confPass && password !== confPass) ? "red" : "#ddd" }}
                />

                {/* Checkbox pentru a putea vinde produse */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '5px',
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    borderRadius: '8px'
                }}>
                  <input 
                    type="checkbox" 
                    id="sellerCheck"
                    checked={wantToSell}
                    onChange={(e) => setWantToSell(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="sellerCheck" style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', cursor: 'pointer' }}>
                    I want to sell Skylanders
                  </label>
                </div>
              </>
            )}

            <button type="submit" className="magic-btn">
              {isRegistering ? "Create Account" : "Enter Shop"}
            </button>

            {error && <p style={{ color: "red", fontSize: "12px", fontWeight: "bold", margin: "0" }}>{error}</p>}
          </form>

          <p onClick={toggleMode} style={{ marginTop: "15px", fontSize: "13px", color: "#0056b3", textDecoration: "underline", cursor: "pointer" }}>
            {isRegistering ? "Already have an account? Login." : "Don't have an account? Create one."}
          </p>
      </div>
    </div>
  );
}

export default LoginForm;