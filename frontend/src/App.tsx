import { useState, useEffect } from "react";
import QuestionDisplay from "./components/QuestionDisplay";
import PassageEditor from "./components/PassageEditor";
import SessionControls from "./components/SessionControls";
import './App.css'

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
  passage: `The rise of remote work has significantly altered the landscape of urban economies. 
  Many companies now offer flexible schedules or fully remote positions, leading to decreased demand 
  for commercial office space. This shift has also impacted public transit systems, downtown retail, 
  and residential patterns.`,
  questions: [
    {
      stem: "Which of the following most accurately expresses the main point of the passage?",
      choices: [
        "The shift to remote work has led to a permanent decrease in demand for commercial real estate in urban areas.",
        "Urban economies are being reshaped due to the growing prevalence of remote work arrangements.",
        "Companies are saving money by closing offices and encouraging employees to work from home.",
        "Public transportation systems have become less relevant in the age of remote work.",
        "Remote work has had no significant impact on urban retail or transit patterns."
      ],
    },
    {
      stem: "Which of the following, if true, would most strengthen the author's argument?",
      choices: [
        "A survey found that over 60% of workers prefer to work remotely at least three days a week.",
        "Some cities have seen a small rebound in office leasing during the past six months.",
        "Remote work has existed in various forms since the early 2000s.",
        "Many remote workers report lower levels of work-life balance.",
        "Office occupancy rates remain unchanged in suburban business parks."
      ],
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

  const updatePassage = (text: string) => {
    setSession((prev) => ({ ...prev, passage: text }));
  };

  const importSession = (data: Session) => {
    setSession(data);
  };

  return (
    <div className={"app-container"}>
      <h1>PrepTogether</h1>

      <h2>Passage</h2>
      <PassageEditor value={session.passage} onChange={updatePassage} />

      <h2>Questions</h2>
      {session.questions.map((q, qIndex) => (
        <QuestionDisplay
          key={qIndex}
          question={q}
          qIndex={qIndex}
          onSelectChoice={(choiceIndex) => updateChoice(qIndex, choiceIndex)}
        />
      ))}

      <SessionControls session={session} onImport={importSession} />
    </div>
  );
}
