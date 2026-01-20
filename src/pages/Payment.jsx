import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/payment.css";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [paymentType, setPaymentType] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    upiId: "",
    wallet: "paytm"
  });

  // Get order details from location state
  const orderDetails = location.state || {};
  const { 
    items = [], 
    subtotal = 0, 
    discount = 0, 
    total = 0, 
    type = "read", 
    address: deliveryAddress = "",
    parsedAddress = null 
  } = orderDetails;
  
  // Check if this is a physical delivery order
  const isPhysicalDelivery = type === "buy";

  useEffect(() => {
    // If no order details, redirect back
    if (!location.state) {
      navigate("/cart");
    }
    
    // Pre-fill address fields with parsed address from cart
    if (parsedAddress) {
      setFormData(prev => ({ 
        ...prev, 
        address: parsedAddress.area || deliveryAddress,
        city: parsedAddress.city || "",
        pincode: parsedAddress.pincode || ""
      }));
    } else if (deliveryAddress) {
      setFormData(prev => ({ ...prev, address: deliveryAddress }));
    }
  }, [location.state, navigate, deliveryAddress, parsedAddress]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Clear cart items based on type
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      
      if (type === "read") {
        // Unlock books and add to library
        const bookIds = items.map(item => item.id);
        const unlocked = JSON.parse(localStorage.getItem("unlockedBooks")) || [];
        const updatedUnlocked = [...new Set([...unlocked, ...bookIds])];
        localStorage.setItem("unlockedBooks", JSON.stringify(updatedUnlocked));
        
        // Add to library
        const libraryBooks = JSON.parse(localStorage.getItem("libraryBooks")) || [];
        const newLibraryBooks = [...libraryBooks, ...items];
        const uniqueLibraryBooks = newLibraryBooks.filter((book, index, self) =>
          index === self.findIndex((b) => b.id === book.id)
        );
        localStorage.setItem("libraryBooks", JSON.stringify(uniqueLibraryBooks));
        
        // Remove read items from cart
        const remainingCart = cart.filter(b => b.type !== "read");
        localStorage.setItem("cart", JSON.stringify(remainingCart));
      } else {
        // Remove buy items from cart
        const remainingCart = cart.filter(b => b.type !== "buy");
        localStorage.setItem("cart", JSON.stringify(remainingCart));
      }

      // Navigate to thank you page
      navigate("/thankyou");
    }, 2000);
  };

  const isFormValid = () => {
    const { name, email, address, city, pincode } = formData;
    
    // For digital/read orders - only need name and email
    // For physical/buy orders - need full address
    const basicValid = name && email;
    const addressValid = isPhysicalDelivery ? (address && city && pincode) : true;
    
    if (paymentType === "card") {
      return basicValid && addressValid && formData.cardNumber.length >= 19 && formData.cardExpiry && formData.cardCvv.length >= 3;
    } else if (paymentType === "upi") {
      return basicValid && addressValid && formData.upiId.includes("@");
    }
    return basicValid && addressValid;
  };

  return (
    <div className="payment-container">
      <div className="payment-wrapper">
        {/* Left Side - Form */}
        <div className="payment-form-section">
          <button className="payment-back-btn" onClick={() => navigate("/cart")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Cart
          </button>

          <h1 className="payment-title">Complete Your Purchase</h1>
          <p className="payment-subtitle">
            {isPhysicalDelivery 
              ? "Enter your details for delivery and payment" 
              : "Enter your details for instant digital access"
            }
          </p>

          <form onSubmit={handleSubmit} className="payment-form">
            {/* Personal Information */}
            <div className="form-section">
              <h3 className="section-title">
                
                Personal Information
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    
                    required
                  />
                </div>
              </div>

              {/* Only show address fields for physical delivery (buy) orders */}
              {isPhysicalDelivery && (
                <>
                  <div className="form-group">
                    <label>Delivery Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Apartment 4B"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>PIN Code</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="400001"
                        maxLength="6"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Show info message for digital orders */}
              {!isPhysicalDelivery && (
                <div className="digital-info-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <p>No delivery address required for digital access. Your books will be available instantly in your library after payment.</p>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h3 className="section-title">
          
                Payment Method
              </h3>

              <div className="payment-methods">
                <button
                  type="button"
                  className={`method-btn ${paymentType === "card" ? "active" : ""}`}
                  onClick={() => setPaymentType("card")}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Credit/Debit Card
                </button>
                <button
                  type="button"
                  className={`method-btn ${paymentType === "upi" ? "active" : ""}`}
                  onClick={() => setPaymentType("upi")}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                  UPI
                </button>
                <button
                  type="button"
                  className={`method-btn ${paymentType === "wallet" ? "active" : ""}`}
                  onClick={() => setPaymentType("wallet")}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
                  </svg>
                  Wallet
                </button>
              </div>

              {/* Card Payment Form */}
              {paymentType === "card" && (
                <div className="payment-details card-details">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="password"
                        name="cardCvv"
                        value={formData.cardCvv}
                        onChange={handleInputChange}
                        placeholder="•••"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment Form */}
              {paymentType === "upi" && (
                <div className="payment-details upi-details">
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      placeholder="yourname@upi"
                      required
                    />
                  </div>
                  <div className="upi-apps">
                    <span className="upi-label">Popular UPI Apps:</span>
                    <div className="upi-icons">
                      <span className="upi-app">GPay</span>
                      <span className="upi-app">PhonePe</span>
                      <span className="upi-app">Paytm</span>
                      <span className="upi-app">BHIM</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Payment Form */}
              {paymentType === "wallet" && (
                <div className="payment-details wallet-details">
                  <div className="wallet-options">
                    {["paytm", "phonepe", "amazon", "mobikwik"].map(wallet => (
                      <label key={wallet} className={`wallet-option ${formData.wallet === wallet ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="wallet"
                          value={wallet}
                          checked={formData.wallet === wallet}
                          onChange={handleInputChange}
                        />
                        <span className="wallet-name">{wallet.charAt(0).toUpperCase() + wallet.slice(1)}</span>
                        <span className="wallet-check">✓</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`payment-submit-btn ${isProcessing ? "processing" : ""}`}
              disabled={!isFormValid() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing Payment...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Pay ₹{total} Securely
                </>
              )}
            </button>

            <p className="security-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Your payment information is encrypted and secure
            </p>
          </form>
        </div>

        {/* Right Side - Order Summary */}
        <div className="payment-summary-section">
          <div className="summary-card">
            <h2 className="summary-title">Order Summary</h2>
            
            {/* Order type badge */}
            <div className={`order-type-badge ${isPhysicalDelivery ? 'physical' : 'digital'}`}>
              {isPhysicalDelivery ? ' Physical Delivery' : ' Digital Access'}
            </div>

            {/* Delivery Address Summary for physical orders */}
            {isPhysicalDelivery && parsedAddress && (
              <div className="delivery-address-summary">
                <h4>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Delivery Address
                </h4>
                <div className="address-details">
                  {parsedAddress.area && <span>{parsedAddress.area}</span>}
                  {parsedAddress.city && <span>{parsedAddress.city}</span>}
                  {parsedAddress.state && <span>{parsedAddress.state}</span>}
                  {parsedAddress.pincode && <span className="pincode">{parsedAddress.pincode}</span>}
                </div>
              </div>
            )}
            
            <div className="summary-items">
              {items.map((item, index) => (
                <div key={index} className="summary-item">
                  <img src={item.cover} alt={item.title} className="summary-item-cover" />
                  <div className="summary-item-details">
                    <h4>{item.title}</h4>
                    <span className="summary-item-type">
                      {item.type === "read" ? "📖 Digital Access" : "📦 Physical Copy"}
                    </span>
                    {item.quantity > 1 && (
                      <span className="summary-item-qty">Qty: {item.quantity}</span>
                    )}
                  </div>
                  <span className="summary-item-price">
                    ₹{(item.type === "read" ? item.price : item.buyPrice) * (item.quantity || 1)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount (10%)</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            {discount > 0 && (
              <div className="savings-badge">
                🎉 You're saving ₹{discount} on this order!
              </div>
            )}
          </div>

          <div className="trust-badges">
            <div className="trust-badge">
              
              <span>Secure Payment</span>
            </div>
            <div className="trust-badge">
              
              <span>{isPhysicalDelivery ? 'Fast Delivery' : 'Instant Access'}</span>
            </div>
            <div className="trust-badge">
              
              <span>Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
