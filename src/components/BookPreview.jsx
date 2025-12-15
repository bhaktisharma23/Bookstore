import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/bookpreview.css";

export default function BookPreview({ book, onClose }) {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  if (!book) return null;

  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem("firstName") !== null;
  };

  // Generate book description based on genre
  const getBookDescription = (book) => {
    const descriptions = {
      fantasy: [
        "Enter a world where magic breathes life into every page.",
        "An epic tale of adventure that will transport you to realms unknown.",
        "Perfect for readers who love enchanting stories and mythical creatures."
      ],
      romance: [
        "A heartwarming story of love, passion, and second chances.",
        "Experience the journey of two souls destined to find each other.",
        "An emotional rollercoaster that will leave you believing in love."
      ],
      mystery: [
        "A gripping tale of suspense that will keep you guessing until the end.",
        "Dark secrets and hidden truths await in this thrilling page-turner.",
        "Every chapter brings you closer to the shocking revelation."
      ],
      fiction: [
        "A beautifully crafted story that explores the depths of human experience.",
        "Characters so real they'll stay with you long after the last page.",
        "A masterpiece of storytelling that transcends genres."
      ],
      thriller: [
        "Heart-pounding suspense from the first page to the last.",
        "A race against time where nothing is as it seems.",
        "Prepare for twists that will leave you breathless."
      ],
      "self-help": [
        "Transform your life with proven strategies and timeless wisdom.",
        "Discover the tools you need to unlock your full potential.",
        "A guide to becoming the best version of yourself."
      ],
      finance: [
        "Master the principles of wealth building and financial freedom.",
        "Learn the secrets that separate the wealthy from the rest.",
        "Your roadmap to financial independence starts here."
      ]
    };

    const genre = book.genre?.toLowerCase() || "fiction";
    return descriptions[genre] || descriptions.fiction;
  };

  const description = getBookDescription(book);

  // Add to cart for reading
  const handleReadNow = () => {
    // Check auth first
    if (!isLoggedIn()) {
      setShowAuthPrompt(true);
      return;
    }
    
    setIsAdding(true);
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const alreadyInCart = savedCart.some(item => item.id === book.id && item.type === "read");
    
    if (!alreadyInCart) {
      const updatedCart = [...savedCart, { ...book, type: "read", quantity: 1 }];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setAddedMessage("Added for reading!");
    } else {
      setAddedMessage("Already in cart!");
    }
    
    setTimeout(() => {
      setIsAdding(false);
      navigate("/cart");
    }, 800);
  };

  // Add to cart for buying
  const handleBuyNow = () => {
    // Check auth first
    if (!isLoggedIn()) {
      setShowAuthPrompt(true);
      return;
    }
    
    setIsAdding(true);
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const alreadyInCart = savedCart.some(item => item.id === book.id && item.type === "buy");
    
    if (!alreadyInCart) {
      const updatedCart = [...savedCart, { ...book, type: "buy", quantity: 1 }];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setAddedMessage("Added for purchase!");
    } else {
      setAddedMessage("Already in cart!");
    }
    
    setTimeout(() => {
      setIsAdding(false);
      navigate("/cart");
    }, 800);
  };

  // Handle auth redirect
  const handleAuthRedirect = () => {
    onClose();
    navigate("/");
  };

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="preview-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Book Cover Section */}
        <div className="preview-cover-section">
          <div className="preview-cover-wrapper">
            <img 
              src={book.cover} 
              alt={book.title} 
              className="preview-cover"
              onError={(e) => { e.target.src = "/default-book.jpg"; }}
            />
            <div className="preview-cover-shadow"></div>
          </div>
        </div>

        {/* Book Details Section */}
        <div className="preview-details">
          <span className="preview-genre">{book.genre}</span>
          <h2 className="preview-title">{book.title}</h2>
          
          <div className="preview-description">
            {description.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          <div className="preview-prices">
            <div className="price-option">
              <span className="price-label">Read Only</span>
              <span className="price-value">₹{book.price}</span>
            </div>
            <div className="price-divider"></div>
            <div className="price-option">
              <span className="price-label">Buy Physical</span>
              <span className="price-value">₹{book.buyPrice}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="preview-actions">
            <button 
              className="preview-btn read-btn"
              onClick={handleReadNow}
              disabled={isAdding}
            >
              {isAdding && addedMessage.includes("reading") ? (
                <span className="btn-success">✓ {addedMessage}</span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  Read Now
                </>
              )}
            </button>
            <button 
              className="preview-btn buy-btn"
              onClick={handleBuyNow}
              disabled={isAdding}
            >
              {isAdding && addedMessage.includes("purchase") ? (
                <span className="btn-success">✓ {addedMessage}</span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Buy Now
                </>
              )}
            </button>
          </div>

          {addedMessage && (
            <div className="preview-added-msg">
              {addedMessage}
            </div>
          )}
        </div>
      </div>

      {/* Auth Prompt within Preview */}
      {showAuthPrompt && (
        <div className="preview-auth-prompt" onClick={(e) => e.stopPropagation()}>
          <div className="preview-auth-box">
            <button className="preview-auth-close" onClick={() => setShowAuthPrompt(false)}>×</button>
            <div className="preview-auth-icon">🔐</div>
            <h3>Sign In Required</h3>
            <p>Please sign in to add this book to your cart</p>
            <button className="preview-auth-btn" onClick={handleAuthRedirect}>
              Go to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
