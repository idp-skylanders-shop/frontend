import React from 'react';
import { useNavigate } from 'react-router-dom';

/*
  Feature deprecated, am lasat butonul de profil prezent totusi
*/

function Profile({ username }) {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#f4f4f4'
    }}>
      <div style={{
        padding: '50px',
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        textAlign: 'center',
        minWidth: '300px'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>Portal Master Profile</h1>
        
        <div style={{ fontSize: '1.5em', marginBottom: '30px' }}>
          Username: <strong style={{ color: 'green' }}>{username}</strong>
        </div>

        <button 
          className="magic-btn" 
          onClick={() => navigate('/')}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Return to Shop
        </button>
      </div>
    </div>
  );
}

export default Profile;