
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./AITutor.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export default function AITutor() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [subject, setSubject] = useState("Science");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askTutor(event) {
    event.preventDefault();

    if (!question.trim() || loading) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch(
        `${API_URL}/ai-tutor/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
            language,
            subject,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Answer nahi mil saka."
        );
      }

      setAnswer(data.answer);
    } catch (err) {
      setError(
        err.message ||
          "Backend se connection nahi ho paaya."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ai-tutor-page">
      <section className="ai-tutor-hero">
        <span className="ai-tutor-badge">
          AI POWERED LEARNING
        </span>

        <h1>AI Tutor</h1>

        <p>
          Apni bhasha mein sawaal poochho aur
          aasaan examples ke saath seekho.
        </p>
      </section>

      <section className="ai-tutor-card">
        <form onSubmit={askTutor}>
          <label htmlFor="tutor-language">
            Choose Language
          </label>

          <select
            id="tutor-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
            <option value="Hinglish">Hinglish</option>
          </select>

          <label htmlFor="tutor-subject">
            Choose Subject
          </label>

          <select
            id="tutor-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="Science">Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English">English</option>
            <option value="Social Studies">
              Social Studies
            </option>
            <option value="General Knowledge">
              General Knowledge
            </option>
          </select>

          <label htmlFor="tutor-question">
            What do you want to learn?
          </label>

          <textarea
            id="tutor-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: Photosynthesis kya hai?"
            rows={5}
            maxLength={2000}
            required
          />

          <div className="ai-tutor-form-footer">
            <span>{question.length}/2000</span>

            <button
              type="submit"
              disabled={loading || !question.trim()}
            >
              {loading ? "Thinking..." : "Ask AI Tutor"}
            </button>
          </div>
        </form>

        {loading && (
          <p className="ai-tutor-loading" role="status">
            AI Tutor tumhare sawaal ka jawab taiyar
            kar raha hai...
          </p>
        )}

        {error && (
          <div className="ai-tutor-error" role="alert">
            {error}
          </div>
        )}

        {answer && (
          <article className="ai-tutor-answer">
            <h2>Learning Answer</h2>

            <div className="ai-tutor-answer-content">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>

            <button
              type="button"
              className="ai-tutor-reset"
              onClick={() => {
                setQuestion("");
                setAnswer("");
                setError("");
              }}
            >
              Ask Another Question
            </button>
          </article>
        )}
      </section>
    </main>
  );
}
