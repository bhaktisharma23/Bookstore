import { useNavigate } from "react-router-dom";

export default function ThankYouPage() {
  const navigate = useNavigate();

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
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        🎉 Thank you for shopping with us!
      </h1>
      <button
        onClick={() => navigate("/nextpage")}
        style={{
          padding: "12px 20px",
          fontSize: "18px",
          borderRadius: "10px",
          border: "none",
          background: "#8b5e3c",
          color: "white",
          cursor: "pointer",
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
}
