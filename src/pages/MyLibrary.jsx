import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyLibrary({ allBooks }) {
  const navigate = useNavigate();
  const [unlockedBooks, setUnlockedBooks] = useState([]);

  useEffect(() => {
    const unlocked = JSON.parse(localStorage.getItem("unlockedBooks")) || [];
    const libraryBooks = JSON.parse(localStorage.getItem("libraryBooks")) || [];
    
    // First, try to get books from allBooks (current session)
    let myBooks = allBooks.filter((book) => unlocked.includes(book.id));
    
    // Then add any books from libraryBooks that aren't in myBooks already
    libraryBooks.forEach((libBook) => {
      if (unlocked.includes(libBook.id) && !myBooks.find(b => b.id === libBook.id)) {
        myBooks.push(libBook);
      }
    });
    
    setUnlockedBooks(myBooks);
  }, [allBooks]);

  return (
    <div
      style={{
        padding: "40px 50px",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2b1b12, #473124)",
        color: "#f9e8d8",
      }}
    >
      <button
        onClick={() => navigate("/nextpage")}
        style={{
          marginBottom: "25px",
          padding: "10px 18px",
          background: "rgba(199, 157, 116, 0.2)",
          border: "1px solid #c79d74",
          borderRadius: "8px",
          color: "#c79d74",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        ← Back to Books
      </button>

      <h1
        style={{
          fontSize: "42px",
          marginBottom: "15px",
          color: "#c79d74",
          fontWeight: "700",
        }}
      >
         My Library
      </h1>

      <p style={{ fontSize: "18px", opacity: 0.8, marginBottom: "35px" }}>
        Your purchased books ready to read anytime
      </p>

      {unlockedBooks.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "60px" }}>
          <p style={{ fontSize: "20px", opacity: 0.7, marginBottom: "20px" }}>
            No books in your library yet.
          </p>
          <button
            onClick={() => navigate("/nextpage")}
            style={{
              padding: "14px 28px",
              background: "#c79d74",
              border: "none",
              borderRadius: "10px",
              color: "#2b1b12",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: "25px",
          }}
        >
          {unlockedBooks.map((book) => (
            <div
              key={book.id}
              style={{
                background: "#2b1b12",
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid rgba(199, 157, 116, 0.2)",
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(199, 157, 116, 0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  position: "relative",
                  marginBottom: "12px",
                }}
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  style={{
                    width: "100%",
                    height: "280px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(76, 175, 80, 0.9)",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "white",
                  }}
                >
                  ✅ Unlocked
                </div>
              </div>

              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                {book.title}
              </h3>

              <p
                style={{
                  opacity: 0.7,
                  textTransform: "capitalize",
                  marginBottom: "15px",
                }}
              >
                {book.genre}
              </p>

              <button
                onClick={() => navigate(`/reader/${book.id}`)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#c79d74",
                  border: "none",
                  borderRadius: "8px",
                  color: "#2b1b12",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#d4ab84";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "#c79d74";
                }}
              >
                Read Now 📖
              </button>
            </div>
          ))}
        </div>
      )}

      {unlockedBooks.length > 0 && (
        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
            padding: "20px",
            background: "rgba(199, 157, 116, 0.1)",
            borderRadius: "10px",
            border: "1px solid rgba(199, 157, 116, 0.2)",
          }}
        >
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>
            You have <strong>{unlockedBooks.length}</strong> book
            {unlockedBooks.length !== 1 ? "s" : ""} in your library
          </p>
          <p style={{ opacity: 0.7, fontSize: "16px" }}>
            Keep exploring and add more books to your collection!
          </p>
        </div>
      )}
    </div>
  );
}