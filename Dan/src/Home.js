import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from './assets/logo.jpg';
import FilterBar from './FilterBar';
import { useCart } from './CartContext'; 
import './App.css'; 

function Home({ authenticated, username, onLogout, token, roles = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, addToCart, setCart, clearCart } = useCart(); 

  const [allProducts, setAllProducts] = useState([]); 
  const [products, setProducts] = useState([]);        
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null); 
  
  // variabile folosite pentru filtrarea produselor
  const [filterElement, setFilterElement] = useState("");
  const [filterSeries, setFilterSeries] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");    
  const [searchQuery, setSearchQuery] = useState(""); 
  
  // pentru a nu supraincarca aplicatia cu foarte multe produse
  // pe o pagina ( pe care un user oricum nu le poate vedea pe toate)
  // am folosit paginarea
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 32; 
  const MAX_LIMIT = 100; 

  // variabile care verifica ce drepturi are un user conectat
  const isAdmin = authenticated && roles.includes("admin");
  const isSeller = authenticated && roles.includes("seller");

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000); 
  };

  // functie de logout
  // trebuie sa stearga cosul de cumparaturi pentru a NU tine
  // produse "ostatice"
  const handleUserLogout = async () => {
      if (username) {
          try {
              await fetch(`/api/cart/clear/${username}`, { 
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
              });
              console.log("Backend cart cleared successfully.");
          } catch (err) {
              console.error("Failed to clear backend cart:", err);
          }
      }
      clearCart(); 
      onLogout();
      showNotification("Logged out & Cart Emptied", "success");
  };

  // functie care primeste produsele de la baza de date
  // pentru a le afisa pe site
  useEffect(() => {
      let isMounted = true;

      const fetchProducts = async () => {
        try {
          const res = await fetch('/api/products', { cache: 'no-store' });
          const data = await res.json();
          if (isMounted) {
              setAllProducts(data);
              setLoading(false);
          }
        } catch (err) {
          console.error("Polling error:", err);
          if (isMounted) setLoading(false);
        }
      };

      fetchProducts();
      const intervalId = setInterval(fetchProducts, 2000);

      if (authenticated && username) {
        fetch(`/api/cart/items/${username}`, { cache: 'no-store' })
          .then(res => res.json())
          .then(data => { 
             if (isMounted && authenticated && Array.isArray(data)) {
                 setCart(data); 
             }
          })
          .catch(err => console.error(err));
      } else {
        if (isMounted) setCart([]);
      }

      return () => {
        isMounted = false; 
        clearInterval(intervalId);
      };
  }, [location.key, authenticated, username, setCart]);

  // aplica filtrele
  useEffect(() => {
    let result = allProducts;
    if (searchQuery !== "") result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterElement !== "") result = result.filter(p => p.element === filterElement);
    if (filterSeries !== "") result = result.filter(p => p.series === filterSeries);
    
    // limitele superioare/inferioare pentru range-ul pretului
    const currentMin = minPrice === '' ? 0 : Number(minPrice);
    const currentMax = maxPrice === '' ? MAX_LIMIT : Number(maxPrice);
    
    result = result.filter(p => p.price >= currentMin && p.price <= currentMax);
    setProducts(result);
  }, [allProducts, filterElement, filterSeries, minPrice, maxPrice, searchQuery]);

  // forteaza un refresh la pagina daca utilizatorul a selectat un filtru nou
  useEffect(() => {
    setCurrentPage(1);
  }, [filterElement, filterSeries, minPrice, maxPrice, searchQuery]);

  const handleMinSlide = (e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 1));
  const handleMaxSlide = (e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 1));
  const handleMinInputChange = (e) => setMinPrice(Math.max(0, Number(e.target.value)));
  const handleMaxInputChange = (e) => setMaxPrice(Math.min(MAX_LIMIT, Number(e.target.value)));
  const handleBlur = () => { if (minPrice === '') setMinPrice(0); if (maxPrice === '') setMaxPrice(MAX_LIMIT); };

  // paginare
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  // logica pentru a sterge un produs
  // call la backend, care il elimina din baza de date
  // si sterge poza asociata
  const handleDelete = (id) => {
     if (!window.confirm("Delete?")) return;
     fetch(`/api/products/${id}`, {
       method: 'DELETE',
       headers: { 'Authorization': `Bearer ${token}` }
     }).then(() => setAllProducts(prev => prev.filter(p => p.id !== id)));
  };

  const handleAddToCart = async (product) => {
    if (!authenticated) {
      showNotification("You must be logged in!", "error");
      return;
    }
    if (product.stock <= 0) {
        showNotification("We apologize, but this item is out of stock.", "error");
        return;
    }

    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, userId: username })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add to cart");

      addToCart(product); 
      showNotification(`${product.name} added to portal!`, "success"); 
    } catch (err) {
      showNotification(err.message, "error"); 
    }
  };

  return (
    <div>
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: notification.type === 'error' ? '#ff4d4d' : '#4caf50', 
          color: 'white', padding: '15px 30px', borderRadius: '8px', zIndex: 1000, fontWeight: 'bold'
        }}>
          {notification.message}
        </div>
      )}

      {/* Principalul Navigation Bar de pe site */}
      <div className="navbar" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '20px', top: '20px', display: 'flex', gap: '10px' }}>
            {authenticated && (
                <button className="magic-btn" onClick={() => navigate('/profile')}>
                    Profile
                </button>
            )}
            <button 
                className="magic-btn" 
                onClick={() => navigate('/order')} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '15px' }}
            >
                🛒 Cart {cart.length > 0 && <span style={{ backgroundColor: '#ff4d4d', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid white' }}>{cart.length}</span>}
            </button>
        </div>

        <img src={logo} alt="Logo" style={{ width: "30vw", height: "10vw", maxWidth: "500px" }} />
        
        <div className="top-right" style={{ position: 'absolute', right: '20px', top: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
           <div style={{ display: 'flex', gap: '10px' }}>
            {!authenticated ? (
              <button className="magic-btn" onClick={() => navigate('/login')}>Login / Register</button>
            ) : (
              <>
                {(isAdmin || isSeller) && (
                   <button className="magic-btn" onClick={() => navigate('/add_product')}>Add Skylander</button>
                )}
                <button className="magic-btn" onClick={handleUserLogout}>Logout ({username})</button>
              </>
            )}
          </div>
          <input type="text" maxLength={50} placeholder="Search by name..." className="magic-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') setSearchQuery(searchTerm); }} style={{ width: '100%', padding: '10px', textAlign: 'right' }} />
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        {authenticated ? <h2 style={{color: "green"}}>Welcome, Portal Master {username}!</h2> : <h2>Welcome to the Shop</h2>}
      </div>

      <div style={{ display: 'flex', minHeight: '100vh', padding: '20px' }}>
        
        {/* UI-ul pentru zona de filtrare*/}
        <FilterBar 
             filterElement={filterElement} setFilterElement={setFilterElement}
             filterSeries={filterSeries} setFilterSeries={setFilterSeries}
             
             minPrice={minPrice} 
             maxPrice={maxPrice}

             handleMinSlide={handleMinSlide} 
             handleMaxSlide={handleMaxSlide}
             handleMinInputChange={handleMinInputChange} 
             handleMaxInputChange={handleMaxInputChange}
             handleBlur={handleBlur}
             
             searchTerm={searchTerm} setSearchTerm={setSearchTerm}
             setSearchQuery={setSearchQuery}
             MAX_LIMIT={MAX_LIMIT}
        />

        <div style={{ flex: 1, marginLeft: '20px' }}>
          <div className="product-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '20px' }}>
            {loading ? <p>Summoning Skylanders...</p> : paginatedProducts.map((skylander) => {
                const isOwner = authenticated && (username === skylander.owner);
                const canDelete = isAdmin || isOwner;
                return (
                  <div key={skylander.id} className="card" style={{ border: '1px solid #ccc', borderRadius: '10px', padding: '15px', width: '250px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', position: 'relative', backgroundColor: 'white' }}>
                    <img src={skylander.image_url} alt={skylander.name} style={{ width: '100%', height: '200px', objectFit: 'contain' }} onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} />
                    <h3>{skylander.name}</h3>
                    <p style={{ color: '#666', fontStyle: 'italic' }}>{skylander.element} Element</p>
                    <p>{skylander.description}</p>
                    <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '1.2em' }}>${skylander.price}</div>

                    <button
                      className="magic-btn"
                      style={{ marginTop: '10px', width: '100%', opacity: skylander.stock > 0 ? 1 : 0.6 }}
                      onClick={() => handleAddToCart(skylander)}
                    >
                      {skylander.stock > 0 ? "Add to Portal" : "Out of Stock"}
                    </button>

                    {canDelete && (
                      <button onClick={() => handleDelete(skylander.id)} style={{ marginTop: '10px', width: '100%', backgroundColor: isOwner && !isAdmin ? '#ff9800' : '#ff4d4d', color: 'white', border: 'none', padding: '8px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isAdmin ? "Delete (Admin)" : "Delete (Owner)"}
                      </button>
                    )}
                  </div>
                );
            })}
          </div>

          {/* UI-ul pentru controlarea paginii*/}
          {totalPages > 1 && (
            <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>« Prev</button>
              {[...Array(totalPages).keys()].map(n => {
                const page = n + 1;
                if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2) {
                  return (
                    <button key={page} onClick={() => goToPage(page)} style={{ fontWeight: page === currentPage ? 'bold' : 'normal' }}>
                      {page}
                    </button>
                  );
                }
                if (Math.abs(page - currentPage) === 3) return <span key={page}>...</span>;
                return null;
              })}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next »</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;