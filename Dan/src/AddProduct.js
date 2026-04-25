import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo.jpg';
import bgImage from './assets/background.jpg';
import './App.css';

/*
  Frontend-ul pentru adaugarea unui nou produs pe site
  Va face heavy lifting-ul de convertire a unei imagini in base64
*/

function AddProduct({ token }) {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);

  const [form, setForm] = useState({
    name: '',
    element: '',
    series: '',
    price: '',
    stock: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value
    }));
  };


  // functie care transforma o imgine in base64 pentru a o incarca pe site
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageBase64 = "";
    if (selectedFile) {
      imageBase64 = await convertToBase64(selectedFile);
    }

    const productPayload = {
      name: form.name,
      element: form.element,
      series: form.series,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      description: form.description,
      image_data: imageBase64 
    };

    // cerere post catre backend pentru a crea un nou produs
    // este important ca backend-ul sa faca asta pentru a mentina
    // consistenta bazei de date
    fetch('/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(productPayload)
    })
    .then(response => {
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    })
    .then(data => navigate('/'))
    .catch(err => console.error(err));
  };

  return (
    <div className="login-page-container">
      <img src={logo} alt="Logo" style={{ width: "20vw", marginBottom: "20px" }} />
      <h1>Summon New Skylander</h1>

      <div className="login-box" style={{ width: '500px', padding: '0' }}>
        
        <div 
          className="login-bg-layer" 
          style={{ 
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} 
        />
        
        <div className="login-content" style={{ padding: '30px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <input
              className="magic-input"
              name="name"
              placeholder="Name (required)"
              value={form.name}
              onChange={handleChange}
              required
            />

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

             <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <select
                  className="magic-input"
                  name="element"
                  value={form.element}
                  onChange={handleChange}
                  style={{ flex: 1, cursor: 'pointer', margin: 0 }}
                  required
                >
                  <option value="" disabled>Select Element</option>
                  <option value="Fire">Fire 🔥</option>
                  <option value="Water">Water 💧</option>
                  <option value="Earth">Earth ⛰️</option>
                  <option value="Air">Air 🌪️</option>
                  <option value="Life">Life 🌱</option>
                  <option value="Undead">Undead ☠️</option>
                  <option value="Tech">Tech ⚙️</option>
                  <option value="Magic">Magic ✨</option>
                </select>
            </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <select
                  className="magic-input"
                  name="series"
                  value={form.series}
                  onChange={handleChange}
                  style={{ flex: 1, cursor: 'pointer', margin: 0 }}
                  required
                >
                  <option value="" disabled>Select Series</option>
                  <option value="Spyro's Adventure">Spyro's Adventure 🐉</option>
                  <option value="Giants">Giants 🗿</option>
                  <option value="Swap Force">Swap Force 🔁</option>
                  <option value="Trap Team">Trap Team 🪤</option>
                  <option value="SuperChargers">SuperChargers 🏎️</option>
                  <option value="Imaginators">Imaginators 💡</option>
                  <option value="Unknown">Unknown ❓</option>
                </select>
            </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                className="magic-input"
                name="price"
                placeholder="Price"
                type="text"
                inputMode="decimal"
                required
                value={form.price}
                onChange={(e) => {
                  // Permite doar numere reale si maxim un punct pentru zecimale
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                    handleChange(e);
                  }
                }}
                style={{ flex: 1 }}
              />
              
              <input
                className="magic-input"
                name="stock"
                placeholder="Stock"
                required
                type="text"
                inputMode="numeric"
                
                value={form.stock}
                onChange={(e) => {
                  // Permite doar numere intregi
                  const val = e.target.value;
                  if (val === '' || /^\d+$/.test(val)) {
                     handleChange(e);
                  }
                }}
                style={{ flex: 1 }}
              />
            </div>

            <div>
              <label style={{
                display: 'block', 
                marginBottom: '8px', 
                marginLeft: '2px', 
                fontSize: '14px', 
                color: 'black', 
                fontWeight: 'bold' 
              }}>
                Import image
              </label>

              <div style={{ 
                backgroundColor: 'white',   
                padding: '10px', 
                borderRadius: '8px', 
                border: '1px solid #ccc' 
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ width: '100%', fontSize: '14px' }}
                  required
                />
              </div>
            </div>

            <textarea
              className="magic-input"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              style={{ minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
            />

            <button type="submit" className="magic-btn" style={{ marginTop: '10px' }}>
              Summon
            </button>
          </form>
        </div>
      </div>

      <button 
        style={{marginTop: "20px", background: "none", border: "none", color: "blue", cursor: "pointer"}}
        onClick={() => navigate('/')}
      >
        Cancel / Go Back
      </button>
    </div>
  );
}

export default AddProduct;