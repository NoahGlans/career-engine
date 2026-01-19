import React, { useEffect, useState } from "react";
import { getCoverLetterFeedback } from "../services/aiService";

export default function AiFeedbackModal({
  open,
  onClose,
  coverLetterText,
  resumeText,
  jobText,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!open) return;

    async function loadFeedback() {
      setLoading(true);
      setError(null);
      setFeedback(null);

      try {
        const result = await getCoverLetterFeedback({
          resumeText,
          jobText,
          coverLetterText,
        });
        setFeedback(result);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadFeedback();
  }, [open, coverLetterText, resumeText, jobText]);

  if (!open) return null;

  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal large">
        <div className="ai-modal-header">
          <h2>AI Cover Letter Feedback</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="ai-modal-body split">
          {/* Left pane: Cover Letter */}
          <div className="cover-letter-pane">
            <h3>Cover Letter</h3>
            <pre>{coverLetterText || "No cover letter available."}</pre>
          </div>

          {/* Right pane: AI Feedback */}
          <div className="feedback-pane">
            {loading && <p>Analyzing cover letter...</p>}
            {error && <p className="error">{error}</p>}

            {feedback && (
              <>
                {feedback.overview && (
                  <>
                    <h3>Overview</h3>
                    <p>{feedback.overview}</p>
                  </>
                )}
                {feedback.strengths?.length > 0 && (
                  <>
                    <h3>Strengths</h3>
                    <ul>{feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </>
                )}
                {feedback.gaps?.length > 0 && (
                  <>
                    <h3>Gaps</h3>
                    <ul>{feedback.gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
                  </>
                )}
                {feedback.suggestions?.length > 0 && (
                  <>
                    <h3>Suggestions</h3>
                    <ul>{feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </>
                )}
                {feedback.tone_feedback && (
                  <>
                    <h3>Tone Feedback</h3>
                    <p>{feedback.tone_feedback}</p>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="ai-modal-footer">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
