import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { generatePreview, generateFullContent, getPageContent, getTotalPages } from "../utils/readerContent";
import "../styles/reader.css";

export default function Reader({ allBooks }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [book, setBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load book data and unlock status
  useEffect(() => {
    setIsLoading(true);
    
    // Try to find book in allBooks first
    let foundBook = allBooks?.find((b) => String(b.id) === String(id));
    
    // If not found, check libraryBooks
    if (!foundBook) {
      const libraryBooks = JSON.parse(localStorage.getItem("libraryBooks")) || [];
      foundBook = libraryBooks.find((b) => String(b.id) === String(id));
    }
    
    setBook(foundBook);
    
    // Check if unlocked
    const unlocked = JSON.parse(localStorage.getItem("unlockedBooks")) || [];
    setIsUnlocked(unlocked.includes(id) || unlocked.includes(Number(id)));
    
    // Reset page on book change
    setCurrentPage(0);
    
    // Simulate content loading
    setTimeout(() => setIsLoading(false), 500);
  }, [id, allBooks]);

  // Get total pages based on unlock status
  const totalPages = book ? getTotalPages(book, isUnlocked) : 0;
  
  // Get current page content
  const pageContent = book ? getPageContent(book, currentPage, isUnlocked) : null;

  // Page navigation with animation
  const goToPage = useCallback((direction) => {
    if (isAnimating) return;
    
    const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
    
    if (newPage < 0 || newPage >= totalPages) return;
    
    setIsAnimating(true);
    setAnimationDirection(direction);
    
    setTimeout(() => {
      setCurrentPage(newPage);
      setAnimationDirection(null);
      setTimeout(() => setIsAnimating(false), 100);
    }, 500);
  }, [currentPage, totalPages, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goToPage("next");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPage("prev");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPage]);

  // Handle unlock/add to cart
  const handleUnlock = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    const alreadyInCart = cart.some((item) => String(item.id) === String(book.id));
    
    if (!alreadyInCart) {
      cart.push({ ...book, type: "read" });
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    
    navigate("/cart");
  };

  // Book not found state
  if (!isLoading && !book) {
    return (
      <div className="not-found">
        <h2>📚 Book Not Found</h2>
        <p>The book you're looking for doesn't exist in our library.</p>
        <button className="back-button" onClick={() => navigate("/nextpage")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Books
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="reader-container">
        <div className="book-wrapper">
          <div className="book">
            <div className="page">
              <div className="page-content">
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <span className="loading-text">Opening your book...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate visible page dots (max 7)
  const getVisibleDots = () => {
    const maxDots = 7;
    if (totalPages <= maxDots) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    
    let start = Math.max(0, currentPage - Math.floor(maxDots / 2));
    let end = Math.min(totalPages, start + maxDots);
    
    if (end - start < maxDots) {
      start = Math.max(0, end - maxDots);
    }
    
    return Array.from({ length: end - start }, (_, i) => start + i);
  };

  return (
    <div className="reader-container">
      {/* Header */}
      <header className="reader-header">
        <button className="back-button" onClick={() => navigate("/nextpage")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        
        <h1 className="book-title-header">{book.title}</h1>
        
        <span className="page-indicator">
          {currentPage + 1} / {totalPages}
        </span>
      </header>

      {/* Book */}
      <div className="book-wrapper">
        <div className="book">
          <div className={`page ${animationDirection === "next" ? "turning-forward" : ""} ${animationDirection === "prev" ? "turning-backward" : ""}`}>
            <div className="page-shadow"></div>
            
            {/* Unlocked banner */}
            {isUnlocked && currentPage === 0 && (
              <div className="unlocked-banner">
                <span>✓</span> Unlocked
              </div>
            )}
            
            <div className="page-content">
              {/* Chapter title */}
              {pageContent?.chapter && (
                <div className="page-chapter">
                  {pageContent.isTitle ? "✦ " : ""}{pageContent.chapter}{pageContent.isTitle ? " ✦" : ""}
                </div>
              )}
              
              {/* Page text */}
              <div className={`page-text ${!isUnlocked && currentPage > 0 ? "blurred" : ""}`}>
                {pageContent?.text.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              
              {/* Page number */}
              <span className="page-number">— {currentPage + 1} —</span>
            </div>
            
            {/* Locked overlay for non-preview pages */}
            {!isUnlocked && currentPage >= 2 && (
              <div className="locked-overlay">
                <span className="lock-icon">🔒</span>
                <h3 className="locked-title">Content Locked</h3>
                <p className="locked-subtitle">
                  Unlock the full book to continue your reading journey with "{book.title}"
                </p>
                <p className="locked-price">₹{book.price}</p>
                <button className="unlock-button" onClick={handleUnlock}>
                  Unlock Full Book
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="navigation">
        <button 
          className="nav-button prev" 
          onClick={() => goToPage("prev")}
          disabled={currentPage === 0 || isAnimating}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Previous
        </button>
        
        {/* Page dots */}
        <div className="page-dots">
          {getVisibleDots().map((pageNum) => (
            <span 
              key={pageNum} 
              className={`page-dot ${pageNum === currentPage ? "active" : ""}`}
              onClick={() => {
                if (!isAnimating && pageNum !== currentPage) {
                  setCurrentPage(pageNum);
                }
              }}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>
        
        <button 
          className="nav-button next" 
          onClick={() => goToPage("next")}
          disabled={currentPage === totalPages - 1 || isAnimating}
        >
          Next
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </nav>

      {/* Footer info */}
      <footer className="reader-footer">
        <span className="genre-badge">{book.genre}</span>
        <p>Use arrow keys or swipe to navigate</p>
      </footer>
    </div>
  );
}
