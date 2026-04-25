import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';

function Order({ username }) {
  const navigate = useNavigate();
  const { setCart, removeFromCart: removeFromCartFrontend } = useCart();
   
  const [cartItems, setCartItems] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Variabile pentru confirmarea cumpararii
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    email: '', 
    firstName: '',
    lastName: '',
    address: '',
    country: '',
    phone: '' 
  });

  // calculeaza totalul de plata alaturi de transport
  const subtotal = cartItems.reduce((total, item) => total + item.price, 0);
  const shippingCost = subtotal >= 100 ? 0 : 10;
  const grandTotal = subtotal + shippingCost;

  const showNotification = (message, type) => {
    setNotification({ message, type });
    if (type === 'error') {
        setTimeout(() => setNotification(null), 3000);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`/api/cart/items/${username}`);
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
       
      setCartItems(data); 
      setCart(data); 
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!username) {
        setLoading(false);
        return;
    }
    fetchCart();
  }, [username]);

  const getGroupedItems = () => {
    const grouped = {};
    cartItems.forEach(item => {
        if (!grouped[item.productId]) {
            grouped[item.productId] = { ...item, qty: 0, cartIds: [] };
        }
        grouped[item.productId].qty += 1;
        grouped[item.productId].cartIds.push(item.cartId);
    });
    return Object.values(grouped);
  };

  const handleIncrease = async (itemGroup) => {
    try {
        const res = await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: itemGroup.productId, userId: username })
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Cannot add more items");
        }
        await fetchCart();
    } catch (err) {
        showNotification(err.message, 'error');
    }
  };

  const handleDecrease = async (itemGroup) => {
    const cartIdToRemove = itemGroup.cartIds[itemGroup.cartIds.length - 1];
    try {
      const res = await fetch(`/api/cart/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: cartIdToRemove, productId: itemGroup.productId })
      });
      if (!res.ok) throw new Error("Failed to remove");
      await fetchCart();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && !/^[0-9+]*$/.test(value)) return; 
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (!formData.firstName || !formData.address || !formData.country || !formData.phone || !formData.email) {
      showNotification("Please fill in all details (including Email).", 'error');
      return;
    }

    try {
      const res = await fetch(`/api/cart/checkout/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
      });

      if (!res.ok) throw new Error("Checkout failed");

      // trimite datele catre backend pentru a trimite mail-ul
      const itemsToSend = getGroupedItems(); 
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...formData,         
            total: subtotal, 
            items: itemsToSend 
        })
      }).catch(err => console.error("Email notification failed:", err));

      showNotification(`Order placed! Confirmation sent to ${formData.email}`, 'success');
      
      setCartItems([]);
      setCart([]);

      setTimeout(() => {
          navigate('/'); 
      }, 2500);

    } catch (err) {
      showNotification("Checkout failed: " + err.message, 'error');
    }
  };

  if (loading) return <h2 style={{padding: '40px'}}>Loading...</h2>;
  if (!username) { return ( <div style={{ padding: '40px' }}>Please Login</div> ); }
  
  const groupedItems = getGroupedItems();

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>

      {notification && (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: notification.type === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 1000,
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}>
            {notification.message}
        </div>
      )}

      <button onClick={() => navigate('/')} style={backBtnStyle}>← Back to Shop</button>

      <h1 style={{ marginBottom: '30px' }}>Checkout</h1>

      {cartItems.length === 0 ? (
        <h2 style={{ textAlign: 'center', marginTop: '40px', color: '#888' }}>Your cart is empty</h2>
      ) : (
        <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
            
            {/* Pe partea stanga a paginii, va fi un form pentru a completa datele de livrare */}
            <div style={{ flex: '1', minWidth: '300px' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Shipping Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} style={inputStyle} />
                    <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} style={inputStyle} />
                    <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} style={inputStyle} />
                    <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} style={inputStyle} />
                    <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} style={inputStyle} />
                    <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} style={inputStyle} maxLength={15} />
                </div>
            </div>

            {/* Pe partea dreapta va fi un sumar cu produsele selectate si totalul */}
            <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginTop: 0 }}>Order Summary</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                    {groupedItems.map(item => (
                    <div key={item.productId} style={{ borderBottom: '1px solid #eee', padding: '15px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{fontWeight: 'bold', fontSize: '1.1em'}}>{item.name}</div>
                            <div style={{fontSize: '0.9em', color: '#666'}}>${item.price.toFixed(2)} / each</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button onClick={() => handleDecrease(item)} style={qtyBtnStyle}>-</button>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>x{item.qty}</span>
                            <button onClick={() => handleIncrease(item)} style={qtyBtnStyle}>+</button>
                        </div>
                    </div>
                    ))}
                </div>

                <div style={{ borderTop: '2px solid #333', paddingTop: '15px' }}>
                    {/* Subtotal*/}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '1em', color: '#555' }}>
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {/* Taxa transport */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1em', color: '#555' }}>
                        <span>Transport Fee:</span>
                        <span style={{ color: shippingCost === 0 ? 'green' : '#555', fontWeight: shippingCost === 0 ? 'bold' : 'normal' }}>
                            {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                        </span>
                    </div>

                    {/* Pretul total */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.4em', fontWeight: 'bold' }}>
                        <span>Total:</span>
                        <span>${grandTotal.toFixed(2)}</span>
                    </div>

                    <button onClick={handleCheckout} style={{ width: '100%', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '15px', fontSize: '18px', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer' }}>
                        Place Order
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' };
const backBtnStyle = { marginBottom: "20px", background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "16px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px" };
const qtyBtnStyle = { width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ccc', backgroundColor: 'white', cursor: 'pointer', fontWeight: 'bold' };

export default Order;