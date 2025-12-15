import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();
  
  const books = [
    "/book1.jpg",
    "/book2.jpg",
    "/book3.jpg",
    "/book4.jpg",
    "/book5.jpg",
  ];

  // POPUP STATES
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  // INPUT STATES
  const [email, setEmail] = useState("");

  const [signupData, setSignupData] = useState({
    first: "",
    last: "",
    dob: "",
    password: "",
  });

  const [signinData, setSigninData] = useState({
    email: "",
    password: "",
  });

  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem("firstName") !== null;
  };

  // Handle Explore button - requires auth
  const handleExplore = () => {
    if (isLoggedIn()) {
      navigate("/nextpage");
    } else {
      setShowSignIn(true);
    }
  };

  // -------- GET STARTED PRESSED --------
  const handleGetStarted = () => {
    if (!email.trim()) {
      alert("Please enter a valid email.");
      return;
    }

    const user = JSON.parse(localStorage.getItem(email));

    if (user) {
      setShowSignIn(true); // Email exists → login
      setSigninData({ ...signinData, email: email });
    } else {
      setShowSignUp(true); // New email → signup
    }
  };

  // ---------- SIGN UP SUBMIT ----------
  const handleSignUpSubmit = () => {
    if (!signupData.first || !signupData.last || !signupData.dob || !signupData.password) {
      alert("Please fill all details.");
      return;
    }

    // Save user in localStorage
    localStorage.setItem(
      email,
      JSON.stringify({
        ...signupData,
        email: email,
      })
    );

    alert("Account created! Please Sign In.");
    setShowSignUp(false);
    setShowSignIn(true);
    setSigninData({ ...signinData, email: email });
  };

  // ---------- SIGN IN SUBMIT ----------
  const handleSignInSubmit = () => {
    const user = JSON.parse(localStorage.getItem(signinData.email));

    if (!user) {
      alert("No account found.");
      return;
    }
    if (user.password !== signinData.password) {
      alert("Incorrect password.");
      return;
    }

    localStorage.setItem("firstName", user.first);
    
    navigate("/nextpage");
  };

  return (
    <div className="home-root">
      {/* Decorative Background Elements */}
      <div className="bg-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      {/* CENTERED LOGO */}
      <div className="logo-center-container">
        <h1 className="logo-animated">
          <span className="logo-part logo-book">Book</span>
          <span className="logo-part logo-verse">Verse</span>
        </h1>
      </div>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-badge"> Over 10,000+ Books Available</div>
          <h2>Step Into a World of Stories</h2>
          <p>Your imagination deserves a beautiful home. Discover bestsellers, timeless classics, and hidden gems waiting to be explored.</p>

          <div className="hero-cta">
            <button className="explore-btn" onClick={handleExplore}>
              <span>Explore Books</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
           
          </div>

          {/* Features */}
          <div className="hero-features">
            <div className="feature">
              <span className="feature-icon">📖</span>
              <span>Read Anywhere</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🚚</span>
              <span>Free Delivery</span>
            </div>
            <div className="feature">
              <span className="feature-icon">💰</span>
              <span>Best Prices</span>
            </div>
          </div>
        </div>

        <div className="right-side">
          <div className="right-content">
            <h1>Unlimited Books, Stories & More</h1>
            <p className="right-subtitle">Start your reading journey today.</p>
            <p>Ready to read? Enter your email to create or restart your membership.</p>

            <div className="email-box">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button onClick={handleGetStarted}>
                Get Started
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <button className="small-signin" onClick={() => setShowSignIn(true)}>
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ========= SIGN UP POPUP ========= */}
      {showSignUp && (
        <div className="popup-overlay" onClick={() => setShowSignUp(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowSignUp(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            
            <div className="popup-header">
              <h2>Create Account</h2>
              <p>Join BookVerse and start your reading journey</p>
            </div>

            <div className="popup-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={signupData.first}
                    onChange={(e) =>
                      setSignupData({ ...signupData, first: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={signupData.last}
                    onChange={(e) =>
                      setSignupData({ ...signupData, last: e.target.value })
                    }
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={signupData.dob}
                  onChange={(e) =>
                    setSignupData({ ...signupData, dob: e.target.value })
                  }
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                />
              </div>

              <button className="popup-btn" onClick={handleSignUpSubmit}>
                Create Account
              </button>
              
              <p className="popup-switch">
                Already have an account?{" "}
                <button onClick={() => { setShowSignUp(false); setShowSignIn(true); }}>
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========= SIGN IN POPUP ========= */}
      {showSignIn && (
        <div className="popup-overlay" onClick={() => setShowSignIn(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowSignIn(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            
            <div className="popup-header">
              <h2>Welcome Back</h2>
              <p>Sign in to continue reading</p>
            </div>

            <div className="popup-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={signinData.email}
                  onChange={(e) =>
                    setSigninData({ ...signinData, email: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={signinData.password}
                  onChange={(e) =>
                    setSigninData({ ...signinData, password: e.target.value })
                  }
                />
              </div>

              <button className="popup-btn" onClick={handleSignInSubmit}>
                Sign In
              </button>
              
              <p className="popup-switch">
                Don't have an account?{" "}
                <button onClick={() => { setShowSignIn(false); setShowSignUp(true); }}>
                  Create one
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
