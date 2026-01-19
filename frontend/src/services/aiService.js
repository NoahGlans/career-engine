const API_URL = process.env.REACT_APP_API_URL + "/api/ai";

export async function getCoverLetterFeedback({
  resumeText,
  jobText,
  coverLetterText,
}) {
  const res = await fetch(
    `${API_URL}/feedback`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume: resumeText,
        job: jobText,
        cover_letter: coverLetterText,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "AI request failed");
  }

  const data = await res.json();

  return typeof data.feedback === "string"
    ? JSON.parse(data.feedback)
    : data.feedback;
}
