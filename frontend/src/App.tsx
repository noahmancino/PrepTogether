import React, { useState, useEffect, ChangeEvent } from "react";

type Question = {
  stem: string;
  choices: string[];
  selectedChoice?: number;
};

type Session = {
  passage: string;
  questions: Question[];
};

export default function App() {
  const [session, setSession] = useState<Session>({
    passage: "",
    questions: [
      {
        stem: "What is the main point of the passage?",
        choices: ["A", "B", "C", "D", "E"],
      },
      {
        stem: "Which of the following most strengthens the argument?",
        choices: ["A", "B", "C", "D", "E"],
      },
    ],
  });

  // Load from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem("lsat-session");
    if (saved) {
      setSession(JSON.parse(saved));
    }
  }, []);

  // Autosave to localStorage
  useEffect(() => {
    localStorage.setItem("lsat-session", JSON.stringify(session));
  }, [session]);

  const updateChoice = (qIndex: number, choiceIndex: number) => {
    setSession((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex] = {
        ...newQuestions[qIndex],
        selectedChoice: choiceIndex,
      };
      return { ...prev, questions: newQuestions };
    });
  };

  const handlePassageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setSession((prev) => ({ ...prev, passage: e.target.value }));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lsat-session.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setSession(data);
      } catch {
        alert("Invalid session file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h1>LSAT Tutor Tool</h1>

      <h2>Passage</h2>
      <textarea
        style={{ width: "100%", height: "120px" }}
        value={session.passage}
        onChange={handlePassageChange}
      />

      <h2>Questions</h2>
      {session.questions.map((q, qIndex) => (
        <div key={qIndex} style={{ marginBottom: "1.5rem" }}>
          <p><strong>{qIndex + 1}.</strong> {q.stem}</p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {q.choices.map((choice, cIndex) => (
              <button
                key={cIndex}
                style={{
                  padding: "0.5rem 1rem",
                  background:
                    q.selectedChoice === cIndex ? "#4ade80" : "#e5e7eb",
                  border: "1px solid #ccc",
                  borderRadius: "0.25rem",
                }}
                onClick={() => updateChoice(qIndex, cIndex)}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <button onClick={handleExport}>Save to File</button>
        <label>
          Load from File:
          <input
            type="file"
            accept=".json"
            style={{ marginLeft: "0.5rem" }}
            onChange={handleImport}
          />
        </label>
      </div>
    </div>
  );
}
