import { useEffect, useState, useRef } from "react";
import Greeting from "../components/Greeting";
import Recommended from "../components/Recommended";
import FilterSortBar from "../components/FilterSortBar";
import BookList from "../components/BookList";
import { useNavigate } from "react-router-dom";
import AIAssistant from "../components/AIAssistant";
import "../styles/nextpage.css";

export default function NextPage({ wishlist, toggleWishlist ,setAllBooks }) {   // ⭐ RECEIVED FROM APP.JSX
  const navigate = useNavigate();

  const [name, setName] = useState("");
  
  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem("firstName") !== null;
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("firstName");
    navigate("/");
  };
  const [localBooks, setLocalBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showNotFound, setShowNotFound] = useState(false);
  const [recommendationsWhenNotFound, setRecommendationsWhenNotFound] = useState([]);

  const searchRef = useRef();
  const suggestionsRef = useRef();

  // ---------------------------
  // LOAD FIRST NAME
  // ---------------------------
  useEffect(() => {
    const n = localStorage.getItem("firstName");
    if (n) setName(n);
  }, []);

  // ---------------------------
  // FETCH 400 BOOKS + SHUFFLE
  // ---------------------------
  useEffect(() => {
  async function loadBooks() {
    const subjects = ["fantasy", "romance", "mystery", "fiction"];
    let final = [];

    for (let s of subjects) {
      const res = await fetch(
        `https://openlibrary.org/subjects/${s}.json?limit=100`
      );
      const data = await res.json();

      const books = data.works.map((item) => ({
        id: crypto.randomUUID(),
        title: item.title,
        genre: s,
        cover: item.cover_id
          ? `https://covers.openlibrary.org/b/id/${item.cover_id}-L.jpg`
          : "/default-book.jpg",
        price: Math.floor(Math.random() * 200) + 100,
        buyPrice: Math.floor(Math.random() * 300) + 200,
      }));

      final.push(...books);
    }

    // Shuffle
    for (let i = final.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [final[i], final[j]] = [final[j], final[i]];
    }

    setLocalBooks(final);      // ✅ UPDATE LOCAL STATE
    setAllBooks(final);        // ✅ UPDATE PARENT STATE
    setFilteredBooks(final);
  }

  loadBooks();
}, []); // ✅ REMOVE setAllBooks from dependency array

  // ---------------------------
  // FILTER + SORT
  // ---------------------------
  const handleFilterSort = (genre, sortType) => {
    let updated = [...localBooks];

    // Filter by genre
    if (genre !== "all") {
      updated = updated.filter((b) => b.genre === genre);
    }

    // Apply sorting
    switch (sortType) {
      case "genre-asc":
        updated.sort((a, b) => a.genre.localeCompare(b.genre));
        break;
      case "genre-desc":
        updated.sort((a, b) => b.genre.localeCompare(a.genre));
        break;
      case "read-price-low":
        updated.sort((a, b) => a.price - b.price);
        break;
      case "read-price-high":
        updated.sort((a, b) => b.price - a.price);
        break;
      case "buy-price-low":
        updated.sort((a, b) => a.buyPrice - b.buyPrice);
        break;
      case "buy-price-high":
        updated.sort((a, b) => b.buyPrice - a.buyPrice);
        break;
      case "title-asc":
        updated.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        updated.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "price-low-high":
        updated.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        updated.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredBooks(updated);
  };

  // ---------------------------
  // SEARCH LOGIC
  // ---------------------------

  const updateSuggestions = (term) => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }

    const q = term.toLowerCase();
    const matched = localBooks
      .filter((b) => b.title.toLowerCase().includes(q))
      .slice(0, 8);

    setSuggestions(matched);
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateSuggestions(value);
    setShowNotFound(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim().toLowerCase();
    if (!q) return;

    const matches = localBooks.filter((b) =>
      b.title.toLowerCase().includes(q)
    );

    if (matches.length > 0) {
      setFilteredBooks(matches);
      setShowNotFound(false);
      setSuggestions([]);
    } else {
      setFilteredBooks([]);
      setShowNotFound(true);

      const random = [...localBooks]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      setRecommendationsWhenNotFound(random);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (book) => {
    setSearchTerm(book.title);
    setFilteredBooks([book]);
    setSuggestions([]);
    setShowNotFound(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const dropdownStyle = {
    position: "absolute",
    top: "40px",
    right: "0px",
    width: "340px",
    maxHeight: "250px",
    background: "#2b1b12",
    borderRadius: "8px",
    padding: "8px",
    overflowY: "auto",
    border: "1px solid rgba(255,255,255,0.08)",
    zIndex: 1000,
  };

  return (
    <div className="nextpage-root">

      {/*  SEARCH + TOP BUTTONS */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginBottom: "14px" }}>
        
        {/* Search bar */}
        <div style={{ position: "relative" }}>
          <form onSubmit={handleSearchSubmit}>
            <input
              ref={searchRef}
              value={searchTerm}
              onChange={handleSearchInput}
              placeholder="Search books..."
              style={{
                width: "340px",
                padding: "10px 14px",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(0,0,0,0.25)",
                color: "var(--text)",
                outline: "none",
              }}
            />
          </form>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div ref={suggestionsRef} style={dropdownStyle}>
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSuggestionClick(s)}
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={s.cover}
                    style={{ width: "42px", height: "60px", borderRadius: "6px", objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontWeight: "700" }}>{s.title}</div>
                    <div style={{ opacity: 0.7, fontSize: "12px" }}>{s.genre}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="top-buttons">
          {/* Library Button */}
          <button className="library-btn" onClick={() => navigate("/library")}>
            📚 My Library
          </button>
          <button className="wishlist-btn" onClick={() => navigate("/wishlist")}>
            ❤️Wishlist
          </button>
          <button className="cart-btn" onClick={() => navigate("/cart")}>
            🛒Cart
          </button>
          
          {/* Logout Button - Only shown when logged in */}
          {isLoggedIn() && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>

      <Greeting name={name} />
      <Recommended books={localBooks} />
      <FilterSortBar onChange={handleFilterSort} />

      {showNotFound && (
        <div style={{ marginTop: "20px", color: "var(--text)" }}>
          <h3>❌ Sorry, this book is currently unavailable.</h3>
          <p>But you might like these:</p>

          <div style={{ display: "flex", gap: "12px" }}>
            {recommendationsWhenNotFound.map((b) => (
              <div key={b.id} style={{ textAlign: "center" }}>
                <img
                  src={b.cover}
                  style={{ width: "120px", height: "160px", borderRadius: "8px", objectFit: "cover" }}
                />
                <p>{b.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/*  BOOKLIST WITH WISHLIST PROPS */}
      <BookList 
        books={filteredBooks}
        wishlist={wishlist}          //  passed
        toggleWishlist={toggleWishlist} //  passed
      />

      <AIAssistant allBooks={localBooks} />

    </div>
  );
}
