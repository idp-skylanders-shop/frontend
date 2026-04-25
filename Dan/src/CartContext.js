import { createContext, useContext, useState, useEffect } from 'react';

/*
  Acest fisier este folosit pentru a expune componentelor din aplicatie metode
  precum adaugare/stergerea unui produs din cos. Si pentru a asigura persistenta
  datelor ( pentru a nu le pierde la un refresh)
*/

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("my-app-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  useEffect(() => {
    localStorage.setItem("my-app-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.cartId !== id));
  };
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("my-app-cart");
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}