import { useState } from "react";

export default function AIAssistant({ allBooks }) {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  async function getRecommendations() {
    if (!mood.trim()) return;

    setLoading(true);
    setResults([]);

    const apiKey = import.meta.env.VITE_OPENAI_KEY;

    const body = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            You are a book recommendation engine.
            ONLY recommend books from this list:

            ${JSON.stringify(allBooks)}

            Your response MUST ONLY be this JSON:
            [
              { "id": "book-id-here", "reason": "why this book fits the mood" }
            ]

            No extra text. No formatting. Only valid JSON.
          `
        },
        { role: "user", content: `User mood: ${mood}` }
      ]
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    console.log("RAW AI RESPONSE:", data.choices?.[0]?.message?.content);

    try {
      const text = data.choices[0].message.content;
      const parsed = JSON.parse(text); // parse JSON safely
      setResults(parsed);
    } catch (err) {
      console.error("JSON Parse failed:", err);
      setResults([]);
    }

    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="ai-btn">
         Ask AI
      </button>

      {open && (
        <div className="ai-popup">
          <div className="ai-box">
            <h2>AI Book Assistant</h2>

            <textarea
              placeholder="Describe your mood, interest, vibe..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />

            <button onClick={getRecommendations} className="ai-search-btn">
              {loading ? "Thinking..." : "Get Recommendations"}
            </button>

            <button className="ai-close" onClick={() => setOpen(false)}>
              ✖
            </button>

            <div className="ai-results">
              {results.length === 0 && !loading && (
                <p>No results yet. Try describing your mood!</p>
              )}

              {results.map((r) => {
                const book = allBooks.find((b) => b.id === r.id);
                if (!book) return null;

                return (
                  <div key={book.id} className="ai-result-card">
                    <img src={book.cover} alt={book.title} />
                    <div>
                      <h3>{book.title}</h3>
                      <p>{r.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
