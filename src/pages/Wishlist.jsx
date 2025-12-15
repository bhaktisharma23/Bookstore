import { useNavigate } from "react-router-dom";
import "../styles/wishlist.css";

export default function Wishlist({ wishlist, toggleWishlist }) {
  const navigate = useNavigate();

  const addToCart = (book, type) => {
    const saved = JSON.parse(localStorage.getItem("cart")) || [];
    const alreadyInCart = saved.some(item => item.id === book.id && item.type === type);
    
    if (!alreadyInCart) {
      localStorage.setItem("cart", JSON.stringify([...saved, { ...book, type }]));
    }
    
    navigate("/cart");
  };

  return (
    <div className="wishlist-root">
      <div className="wishlist-header">
        <button className="back-btn" onClick={() => navigate("/nextpage")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Books
        </button>
        <h1>
          <span>❤️</span>
          Your Wishlist
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-icon">💔</div>
          <h2>Your wishlist is empty</h2>
          <p>Start adding books you love and want to read later!</p>
          <button className="browse-books-btn" onClick={() => navigate("/nextpage")}>
            Browse Books
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((b) => (
            <div key={b.id} className="wishlist-card">
              <img 
                src={b.cover} 
                alt={b.title}
                className="wishlist-cover"
                onError={(e) => { e.target.src = "/default-book.jpg"; }}
              />
              
              <div className="wishlist-info">
                <h3>{b.title}</h3>
                <span className="genre-tag">{b.genre}</span>
              </div>
              
              <div className="wishlist-price">
                <p>₹{b.price}</p>
              </div>
              
              <div className="wishlist-actions">
                <button 
                  className="remove-btn"
                  onClick={() => toggleWishlist(b)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Remove
                </button>
                <button 
                  className="cart-btn"
                  onClick={() => addToCart(b, "read")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
