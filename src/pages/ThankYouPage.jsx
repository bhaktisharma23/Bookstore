import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ThankYouPage() {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    feedback: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingFeedback =
      JSON.parse(localStorage.getItem("feedbacks")) || [];

    existingFeedback.push(formData);

    localStorage.setItem(
      "feedbacks",
      JSON.stringify(existingFeedback)
    );

    alert("Thank you for your feedback ");

    setFormData({ email: "", mobile: "", feedback: "" });
    setShowForm(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#0a0a09ff",
        fontFamily: "Inter, sans-serif",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
         Thank you for shopping with us!
      </h1>

      <div style={{ display: "flex", gap: "15px" }}>
        <button
          onClick={() => navigate("/nextpage")}
          style={buttonStyle}
        >
          Continue Shopping
        </button>

        <button
          onClick={() => setShowForm(true)}
          style={{ ...buttonStyle, background: "#444" }}
        >
          Give Feedback
        </button>
      </div>

      {showForm && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h2>Feedback Form</h2>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
              />

              <input
  type="tel"
  name="mobile"
  placeholder="Mobile Number"
  required
  value={formData.mobile}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // allow only digits
    if (value.length <= 10) {
      setFormData({ ...formData, mobile: value });
    }
  }}
  maxLength={10}
  pattern="[0-9]{10}"
  style={inputStyle}
/>


              <textarea
                name="feedback"
                placeholder="Your feedback"
                required
                value={formData.feedback}
                onChange={handleChange}
                style={{ ...inputStyle, height: "80px" }}
              />

              {/* ✅ BUTTONS */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={buttonStyle}>
                  Submit
                </button>

                
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
// add clear button in above section 

/* ---------- Styles ---------- */

const buttonStyle = {
  padding: "12px 20px",
  fontSize: "18px",
  borderRadius: "10px",
  border: "none",
  background: "#8b5e3c",
  color: "white",
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalBox = {
  background: "white",
  color: "black",
  padding: "25px",
  borderRadius: "12px",
  width: "320px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};
