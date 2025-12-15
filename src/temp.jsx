import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NextPage from "./pages/NextPage";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import ThankYouPage from "./pages/ThankYouPage";
import Reader from "./pages/Reader";
import MyLibrary from "./pages/MyLibrary";
import Payment from "./pages/Payment";
import Footer from "./components/Footer";
import { useState } from "react";

export default function App() {
  const [wishlist, setWishlist] = useState([]);
  const [allBooks, setAllBooks] = useState([]);

  const toggleWishlist = (book) => {
    const exists = wishlist.find((b) => b.id === book.id);
    if (exists) {
      setWishlist(wishlist.filter((b) => b.id !== book.id));
    } else {
      setWishlist([...wishlist, book]);
    }
  };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/nextpage"
              element={
                <NextPage wishlist={wishlist} toggleWishlist={toggleWishlist} setAllBooks={setAllBooks} />
              }
            />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment" element={<Payment />} />
            <Route
              path="/wishlist"
              element={
                <Wishlist wishlist={wishlist} toggleWishlist={toggleWishlist} />
              }
            />
            <Route path="/thankyou" element={<ThankYouPage />} />
            <Route path="/reader/:id" element={<Reader allBooks={allBooks} />} />
            <Route path="/library" element={<MyLibrary allBooks={allBooks} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
