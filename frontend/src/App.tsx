import { useState, useEffect } from "react";
import PassageEditor from "./components/PassageEditor";
import QuestionDisplay from "./components/QuestionDisplay";
import QuestionEditor from "./components/QuestionEditor";
import SessionControls from "./components/SessionControls";
import "./App.css";

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
    passage: `The rise of remote work has significantly altered the landscape of urban economies...`,
    questions: [
      {
        stem: "Which of the following most accurately expresses the main point of the passage?",
        choices: [
          "The shift to remote work has led to a permanent decrease in demand for commercial real estate in urban areas.",
          "Urban economies are being reshaped due to the growing prevalence of remote work arrangements.",
          "Companies are saving money by closing offices and encouraging employees to work from home.",
          "Public transportation systems have become less relevant in the age of remote work.",
          "Remote work has had no significant impact on urban retail or transit patterns.",
        ],
      },
      {
        stem: "Which of the following, if true, would most strengthen the author's argument?",
        choices: [
          "A survey found that over 60% of workers prefer to work remotely at least three days a week.",
          "Some cities have seen a small rebound in office leasing during the past six months.",
          "Remote work has existed in various forms since the early 2000s.\n\n\n",
          "Many remote workers report lower levels of work-life balance.",
          "Office occupancy rates remain unchanged in suburban business parks.",
        ],
      },
    ],
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [mode, setMode] = useState<"display" | "edit">("display");

  const addNewQuestion = () => {
    setSession((prev) => {
      const updatedQuestions = [
        ...prev.questions,
        {
          stem: "",
          choices: ["", "", "", "", ""],
        },
      ];

      // Safely compute the new index from the updated array length
      const newIndex = updatedQuestions.length - 1;
      setCurrentQuestionIndex(newIndex);

      return { ...prev, questions: updatedQuestions };
    });
  };


  useEffect(() => {
    const saved = localStorage.getItem("lsat-session");
    if (saved) setSession(JSON.parse(saved));
  }, []);

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

  const updateQuestion = (index: number, updated: Question) => {
    const newQuestions = [...session.questions];
    newQuestions[index] = updated;
    setSession((prev) => ({ ...prev, questions: newQuestions }));
  };

  const importSession = (data: Session) => {
    setSession(data);
    setCurrentQuestionIndex(0);
  };

  const goToPrev = () =>
    setCurrentQuestionIndex((i) => Math.max(i - 1, 0));

  const goToNext = () =>
    setCurrentQuestionIndex((i) =>
      Math.min(i + 1, session.questions.length - 1)
    );

  const currentQuestion = session.questions[currentQuestionIndex];

  return (
    <div className="app-container">
      <div className="mode-toggle">
        <button
          onClick={() => setMode("display")}
          disabled={mode === "display"}
        >
          Display Mode
        </button>
        <button
          onClick={() => setMode("edit")}
          disabled={mode === "edit"}
        >
          Edit Mode
        </button>
      </div>

      <div className="main-layout">
        <div className="passage-column">
          <h2>Passage</h2>
          {mode === "edit" ? (
            <PassageEditor value={session.passage} onChange={updatePassage} />
          ) : (
              <div className="passage-box">
              {session.passage}
              </div>
          )}
        </div>

        <div className="question-column">
          <h2>Question {currentQuestionIndex + 1}</h2>
          {mode === "edit" ? (
            <QuestionEditor
              question={currentQuestion}
              qIndex={currentQuestionIndex}
              onUpdate={(q) => updateQuestion(currentQuestionIndex, q)}
            />
          ) : (
            <QuestionDisplay
              question={currentQuestion}
              qIndex={currentQuestionIndex} // TODO: fix qIndex
              onSelectChoice={(choiceIndex) =>
                updateChoice(currentQuestionIndex, choiceIndex)
              }
            />
          )}
        </div>

      </div>
      <div className="question-nav">
        {session.questions.map((q, index) => {
          const isActive = index === currentQuestionIndex;
          const isAnswered = q.selectedChoice !== undefined;
          return (
            <div
              key={index}
              className={
                "question-bubble" +
                (isActive ? " active" : "") +
                (isAnswered ? " answered" : "")
              }
              onClick={() => setCurrentQuestionIndex(index)}
              title={`Question ${index + 1}`}
            >
              {index + 1}
            </div>
          );
        })}

        {mode === "edit" && (
          <div
            className="question-bubble new-question"
            onClick={addNewQuestion}
            title="Add new question"
          >
            +
          </div>
        )}
      </div>

        {mode === "display" && (
          <button onClick={() => alert("Submit not implemented yet.")}>
            Submit
          </button>
        )}

      <SessionControls session={session} onImport={importSession} />
    </div>
  );
}
