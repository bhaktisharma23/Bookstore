import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookPreview from "./BookPreview";

export default function BookList({ books, wishlist, toggleWishlist }) {
  const [popup, setPopup] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const navigate = useNavigate(); 

  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem("firstName") !== null;
  };

  // Show auth prompt
  const promptAuth = () => {
    setShowAuthPrompt(true);
  };

  // ✅ ADD TO CART FOR READ ONLY
  const addToReadCart = (book, e) => {
    e.stopPropagation(); // Prevent opening preview
    
    // Check auth first
    if (!isLoggedIn()) {
      promptAuth();
      return;
    }
    
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const alreadyInCart = savedCart.some(item => item.id === book.id && item.type === "read");
    
    if (!alreadyInCart) {
      const updatedCart = [...savedCart, { ...book, type: "read", quantity: 1 }];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setPopup("Added to Read cart!");
    } else {
      setPopup("Already in cart!");
    }
    
    setTimeout(() => setPopup(""), 1500);
  };

  // ✅ ADD TO CART FOR BUYING
  const addToCart = (book, e) => {
    e.stopPropagation(); // Prevent opening preview
    
    // Check auth first
    if (!isLoggedIn()) {
      promptAuth();
      return;
    }
    
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const alreadyInCart = savedCart.some(item => item.id === book.id && item.type === "buy");
    
    if (!alreadyInCart) {
      const updatedCart = [...savedCart, { ...book, type: "buy", quantity: 1 }];
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setPopup("Added to Buy cart!");
    } else {
      setPopup("Already in cart!");
    }

    setTimeout(() => setPopup(""), 1500);
  };

  // Handle wishlist toggle with auth check
  const handleToggleWishlist = (book, e) => {
    e.stopPropagation(); // Prevent opening preview
    
    // Check auth first
    if (!isLoggedIn()) {
      promptAuth();
      return;
    }
    
    toggleWishlist(book);
  };

  // Open book preview
  const openPreview = (book) => {
    setSelectedBook(book);
  };

  // Close book preview
  const closePreview = () => {
    setSelectedBook(null);
  };

  return (
    <>
      {popup && <div className="popup-msg">{popup}</div>}

      <div className="booklist">
        {books.map((b) => (
          <div 
            key={b.id} 
            className="book-card" 
            style={{ position: "relative", cursor: "pointer" }}
            onClick={() => openPreview(b)}
          >

            {/* ❤️ HEART BUTTON */}
            <button
              className="heart-btn"
              onClick={(e) => handleToggleWishlist(b, e)}
            >
              {wishlist.some((w) => w.id === b.id) ? "❤️" : "🤍"}
            </button>

            <img className="book-cover" src={b.cover} alt={b.title} />

            <div className="book-info">
              <h3>{b.title}</h3>
              <p className="genre">{b.genre}</p>
            </div>

           <div className="actions">
              {/* READ ONLY BUTTON */}
              <button 
                className="read-btn"
                onClick={(e) => addToReadCart(b, e)}
              >
                Read it only at ₹{b.price}
              </button>

              <button
                className="buy-btn"
                onClick={(e) => addToCart(b, e)}
              >
                Buy Now at ₹{b.buyPrice}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Book Preview Modal */}
      {selectedBook && (
        <BookPreview book={selectedBook} onClose={closePreview} />
      )}

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="auth-prompt-overlay" onClick={() => setShowAuthPrompt(false)}>
          <div className="auth-prompt-box" onClick={(e) => e.stopPropagation()}>
            <button className="auth-prompt-close" onClick={() => setShowAuthPrompt(false)}>
              ×
            </button>
            <div className="auth-prompt-icon">🔐</div>
            <h3>Sign In Required</h3>
            <p>Please sign in to add books to your cart or wishlist</p>
            <button 
              className="auth-prompt-btn"
              onClick={() => navigate("/")}
            >
              Go to Sign In
            </button>
          </div>
        </div>
      )}
    </>
  );
}
