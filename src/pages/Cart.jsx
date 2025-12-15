import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "../styles/cart.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiYmhha3RpMjMiLCJhIjoiY21pdDNhdXA5MDV2djNmcjRhY3lxN2ptYSJ9.9b3JrGtm9yimZvX7YPTWbw";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [parsedAddress, setParsedAddress] = useState(null);
  const [finalAddress, setFinalAddress] = useState("");
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const marker = useRef(null);
  const suggestionsRef = useRef(null);

  const navigate = useNavigate();
  
  // Parse address details from Nominatim response
  const parseAddressDetails = (data) => {
    if (!data) return null;
  
    // Handle BOTH reverse & search responses
    const addr = data.address || data;
  
    const area =
      addr.suburb ||
      addr.neighbourhood ||
      addr.village ||
      addr.hamlet ||
      addr.locality ||
      addr.town ||
      "";
  
    const city =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      "";
  
    const state = addr.state || "Karnataka";
    const pincode = addr.postcode || "";
  
    const fullAddress = [area, city, state, pincode]
      .filter(Boolean)
      .join(", ");
  
    return fullAddress
      ? { area, city, state, pincode, fullAddress }
      : null;
  };
  
  
  const reverseGeocode = async (lat, lon) => {
    setIsLoadingAddress(true);
    setParsedAddress(null);
    
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.address) {
        const parsed = parseAddressDetails(data);
        setParsedAddress(parsed);
        setSelectedAddress(parsed ? parsed.fullAddress : data.display_name);
      } else {
        setSelectedAddress("");
        setParsedAddress(null);
      }
    } catch (err) {
      console.log("Reverse geocode error:", err);
      setSelectedAddress("");
      setParsedAddress(null);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart")) || [];
    // Ensure each item has a quantity
    const cartWithQuantity = saved.map(item => ({
      ...item,
      quantity: item.quantity || 1
    }));
    setCart(cartWithQuantity);
  }, []);

  // Save cart to localStorage whenever it changes
  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const readBooks = cart.filter((b) => b.type === "read");
  const buyBooks = cart.filter((b) => b.type === "buy");

  // Calculate totals with quantity
  const readSubtotal = readBooks.reduce((sum, b) => sum + ((b.price || 0) * (b.quantity || 1)), 0);
  const buySubtotal = buyBooks.reduce((sum, b) => sum + ((b.buyPrice || 0) * (b.quantity || 1)), 0);
  
  // Calculate discounts (10% if > ₹500)
  const readDiscount = readSubtotal > 500 ? Math.round(readSubtotal * 0.1) : 0;
  const buyDiscount = buySubtotal > 500 ? Math.round(buySubtotal * 0.1) : 0;
  
  const readTotal = readSubtotal - readDiscount;
  const buyTotal = buySubtotal - buyDiscount;

  // Update quantity
  const updateQuantity = (bookId, type, newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > 10) return; // Max 10 quantity
    
    const updatedCart = cart.map(item => {
      if (item.id === bookId && item.type === type) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  useEffect(() => {
    if (showMap && mapContainer.current && !mapReady) {
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [75.7139, 14.167],
        zoom: 7,
        maxBounds: [
          [74.0, 11.5],
          [78.5, 18.5],
        ],
      });

      const initialLng = 77.5946;
      const initialLat = 12.9716;

      marker.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([initialLng, initialLat])
        .addTo(mapInstance.current);

      // Get address for initial marker position
      reverseGeocode(initialLat, initialLng);

      marker.current.on("dragend", () => {
        const lngLat = marker.current.getLngLat();
        reverseGeocode(lngLat.lat, lngLat.lng);
      });

      setMapReady(true);
    }
  }, [showMap, mapReady]);

  const searchNominatim = async (q) => {
    setQuery(q);
    if (q.length < 3) {
      setResults([]);
      return;
    }
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q + " Karnataka"
      )}&addressdetails=1&limit=8`;
      const response = await fetch(url);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.log("Search error:", err);
    }
  };

  const handleSelectLocation = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    marker.current.setLngLat([lon, lat]);
    mapInstance.current.flyTo({ center: [lon, lat], zoom: 15 });
    
    // Parse address from the selected place
    const parsed = parseAddressDetails(place);
    if (parsed) {
      setParsedAddress(parsed);
      setSelectedAddress(parsed.fullAddress);
      setQuery(parsed.fullAddress);
    } else {
      setSelectedAddress(place.display_name);
      setQuery(place.display_name);
    }
    
    setResults([]);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setResults([]);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const removeFromCart = (id, type) => {
    const updated = cart.filter((b) => !(b.id === id && b.type === type));
    saveCart(updated);
  };

  // Confirm address selection and redirect to payment
  const handleConfirmAddress = () => {
    if (!selectedAddress || !parsedAddress) return;
    
    setFinalAddress(selectedAddress);
    setAddressConfirmed(true);
    setShowMap(false);
    
    // Navigate to payment page with buy books and address
    navigate("/payment", {
      state: {
        items: buyBooks,
        subtotal: buySubtotal,
        discount: buyDiscount,
        total: buyTotal,
        type: "buy",
        address: selectedAddress,
        parsedAddress: parsedAddress
      }
    });
  };

  // Change address (reset confirmation)
  const handleChangeAddress = () => {
    setAddressConfirmed(false);
    setShowMap(true);
  };

  // Navigate to payment page for read books (NO ADDRESS REQUIRED)
  const handleReadPayment = () => {
    if (readBooks.length === 0) return;
    
    navigate("/payment", {
      state: {
        items: readBooks,
        subtotal: readSubtotal,
        discount: readDiscount,
        total: readTotal,
        type: "read"
        // No address for read-only books
      }
    });
  };

  // Navigate to payment page for buy books (ADDRESS REQUIRED)
  const handleBuyPayment = () => {
    if (!addressConfirmed || !finalAddress) {
      alert("Please select and confirm your delivery address first!");
      return;
    }
    if (buyBooks.length === 0) return;
    
    navigate("/payment", {
      state: {
        items: buyBooks,
        subtotal: buySubtotal,
        discount: buyDiscount,
        total: buyTotal,
        type: "buy",
        address: finalAddress
      }
    });
  };

  return (
    <div className="cart-container">
      {/* Header */}
      <div className="cart-header">
        <button className="cart-back-btn" onClick={() => navigate("/nextpage")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Continue Shopping
        </button>
      </div>

      <div className="cart-content">
        <h1 className="cart-title">
          <span className="cart-icon">🛒</span>
          Your Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon">📚</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any books yet. Start exploring our collection!</p>
            <button className="browse-btn" onClick={() => navigate("/nextpage")}>
              Browse Books
            </button>
          </div>
        ) : (
          <div className="cart-sections">
            {/* READ ONLY SECTION - NO ADDRESS REQUIRED */}
            {readBooks.length > 0 && (
              <div className="cart-section read-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <span className="section-emoji">📖</span>
                    <div>
                      <h2>Digital Access</h2>
                      <p>Read instantly on any device • No shipping required</p>
                    </div>
                  </div>
                  <span className="item-count">{readBooks.reduce((sum, b) => sum + (b.quantity || 1), 0)} {readBooks.length === 1 ? 'book' : 'books'}</span>
                </div>

                <div className="cart-items">
                  {readBooks.map((b) => (
                    <div key={`${b.id}-read`} className="cart-item">
                      <img src={b.cover} alt={b.title} className="item-cover" />
                      <div className="item-details">
                        <h3 className="item-title">{b.title}</h3>
                        <span className="item-genre">{b.genre}</span>
                        <span className="item-type">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                          </svg>
                          Digital Copy
                        </span>
                      </div>
                      
                      {/* Quantity Selector */}
                      <div className="quantity-selector">
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(b.id, "read", (b.quantity || 1) - 1)}
                          disabled={(b.quantity || 1) <= 1}
                        >
                          −
                        </button>
                        <span className="qty-value">{b.quantity || 1}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(b.id, "read", (b.quantity || 1) + 1)}
                          disabled={(b.quantity || 1) >= 10}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="item-price">₹{b.price * (b.quantity || 1)}</div>
                      <button className="remove-btn" onClick={() => removeFromCart(b.id, "read")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="section-summary">
                  <div className="summary-rows">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{readSubtotal}</span>
                    </div>
                    {readDiscount > 0 && (
                      <div className="summary-row discount-row">
                        <span>
                          <span className="discount-badge">10% OFF</span>
                          Discount Applied
                        </span>
                        <span>-₹{readDiscount}</span>
                      </div>
                    )}
                    <div className="summary-row total-row">
                      <span>Total</span>
                      <span>₹{readTotal}</span>
                    </div>
                  </div>
                  
                  {readDiscount > 0 && (
                    <div className="savings-message">
                      🎉 You're saving ₹{readDiscount} on this order!
                    </div>
                  )}
                  
                  {readSubtotal > 0 && readSubtotal <= 500 && (
                    <div className="discount-hint">
                      💡 Add ₹{500 - readSubtotal} more to get 10% off!
                    </div>
                  )}

                  {/* No address required info */}
                  <div className="no-address-info">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                    <span>Instant digital access • No delivery address required</span>
                  </div>

                  <button className="checkout-btn" onClick={handleReadPayment}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Proceed to Payment • ₹{readTotal}
                  </button>
                </div>
              </div>
            )}

            {/* BUY BOOKS SECTION - ADDRESS REQUIRED */}
            {buyBooks.length > 0 && (
              <div className="cart-section buy-section">
                <div className="section-header buy-header">
                  <div className="section-title-wrapper">
                    <span className="section-emoji">📦</span>
                    <div>
                      <h2>Physical Delivery</h2>
                      <p>Get books delivered to your door</p>
                    </div>
                  </div>
                  <span className="item-count">{buyBooks.reduce((sum, b) => sum + (b.quantity || 1), 0)} {buyBooks.length === 1 ? 'book' : 'books'}</span>
                </div>

                <div className="cart-items">
                  {buyBooks.map((b) => (
                    <div key={`${b.id}-buy`} className="cart-item">
                      <img src={b.cover} alt={b.title} className="item-cover" />
                      <div className="item-details">
                        <h3 className="item-title">{b.title}</h3>
                        <span className="item-genre">{b.genre}</span>
                        <span className="item-type physical">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          </svg>
                          Physical Copy
                        </span>
                      </div>
                      
                      {/* Quantity Selector */}
                      <div className="quantity-selector">
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(b.id, "buy", (b.quantity || 1) - 1)}
                          disabled={(b.quantity || 1) <= 1}
                        >
                          −
                        </button>
                        <span className="qty-value">{b.quantity || 1}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(b.id, "buy", (b.quantity || 1) + 1)}
                          disabled={(b.quantity || 1) >= 10}
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="item-price">₹{b.buyPrice * (b.quantity || 1)}</div>
                      <button className="remove-btn" onClick={() => removeFromCart(b.id, "buy")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Address Section - REQUIRED for physical delivery */}
                <div className="address-section">
                  <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Delivery Address <span className="required-badge">Required</span>
                  </h3>
                  
                  {addressConfirmed && finalAddress ? (
                    <div className="selected-address confirmed">
                      <div className="address-confirmed-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        Address Confirmed
                      </div>
                      <p>{finalAddress}</p>
                      <button className="change-address-btn" onClick={handleChangeAddress}>
                        Change Address
                      </button>
                    </div>
                  ) : (
                    <div className="address-not-selected">
                      <p className="address-warning">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        Please select and confirm your delivery address to proceed
                      </p>
                      <button className="select-address-btn" onClick={() => setShowMap(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        Select Delivery Address
                      </button>
                    </div>
                  )}
                </div>

                <div className="section-summary">
                  <div className="summary-rows">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{buySubtotal}</span>
                    </div>
                    {buyDiscount > 0 && (
                      <div className="summary-row discount-row">
                        <span>
                          <span className="discount-badge">10% OFF</span>
                          Discount Applied
                        </span>
                        <span>-₹{buyDiscount}</span>
                      </div>
                    )}
                    <div className="summary-row total-row">
                      <span>Total</span>
                      <span>₹{buyTotal}</span>
                    </div>
                  </div>
                  
                  {buyDiscount > 0 && (
                    <div className="savings-message">
                      🎉 You're saving ₹{buyDiscount} on this order!
                    </div>
                  )}
                  
                  {buySubtotal > 0 && buySubtotal <= 500 && (
                    <div className="discount-hint">
                      💡 Add ₹{500 - buySubtotal} more to get 10% off!
                    </div>
                  )}

                  <button 
                    className={`checkout-btn ${!addressConfirmed ? 'disabled' : ''}`} 
                    onClick={handleBuyPayment}
                    disabled={!addressConfirmed}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    {addressConfirmed ? `Proceed to Payment • ₹${buyTotal}` : 'Confirm Address First'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAP POPUP */}
      {showMap && (
        <div className="map-overlay">
          <div className="map-modal">
            <div className="map-header">
              <h2>Select Delivery Location</h2>
              <button className="map-close-btn" onClick={() => setShowMap(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="map-search">
              <input
                value={query}
                onChange={(e) => searchNominatim(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search location in Karnataka…"
              />
              {results.length > 0 && (
                <div ref={suggestionsRef} className="map-suggestions">
                  {results.map((place) => (
                    <div
                      key={place.place_id}
                      onClick={() => handleSelectLocation(place)}
                      className="suggestion-item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {place.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div ref={mapContainer} className="map-container"></div>
            
            <div className="map-footer">
              {/* Address Preview Section */}
              <div className={`address-preview-section ${parsedAddress ? 'has-valid-address' : ''}`}>
                <div className="address-preview-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {isLoadingAddress ? "Resolving Address..." : "Delivery Address:"}
                </div>
                
                {isLoadingAddress ? (
                  <div className="address-loading">
                    <div className="loading-spinner"></div>
                    <span>Finding your location...</span>
                  </div>
                ) : parsedAddress ? (
                  <div className="parsed-address-display">
                    <div className="address-row">
                      <span className="address-label">Area:</span>
                      <span className="address-value">{parsedAddress.area || "—"}</span>
                    </div>
                    <div className="address-row">
                      <span className="address-label">City:</span>
                      <span className="address-value">{parsedAddress.city || "—"}</span>
                    </div>
                    <div className="address-row">
                      <span className="address-label">State:</span>
                      <span className="address-value">{parsedAddress.state || "—"}</span>
                    </div>
                    <div className="address-row">
                      <span className="address-label">Pincode:</span>
                      <span className="address-value">{parsedAddress.pincode || "—"}</span>
                    </div>
                  </div>
                ) : (
                  <p className="selected-location-text">
                    Drag the marker or search to select a delivery location
                  </p>
                )}
              </div>
              
              <div className="map-actions">
                <button className="map-cancel-btn" onClick={() => setShowMap(false)}>
                  Cancel
                </button>
                {/* Confirm button visible only when valid address is resolved */}
                {parsedAddress && !isLoadingAddress && (
                  <button 
                    className="map-confirm-btn ready"
                    onClick={handleConfirmAddress}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Confirm Address
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
