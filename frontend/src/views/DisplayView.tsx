import { useState } from "react";
import Question from "../components/Questions.tsx";

type Props = {
  passage: string;
  questions: {
    stem: string;
    choices: string[];
    selectedChoice?: number;
    sectionIndex: number;
    questionIndex: number;
  }[];
  onUpdate: (
    sectionIndex: number,
    questionIndex: number,
    updatedQuestion: any
  ) => void;
};

export default function DisplayView({ passage, questions, onUpdate }: Props) {
  // State to track the currently active question
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Handles updating the question when a choice is selected
  const handleUpdateChoice = (choiceIndex: number) => {
    const questionMeta = questions[currentQuestionIndex];
    const updatedQuestion = { ...questionMeta, selectedChoice: choiceIndex };
    onUpdate(questionMeta.sectionIndex, questionMeta.questionIndex, updatedQuestion);
  };

  // Guard for no questions available
  if (!questions || questions.length === 0) {
    return <div className="error-message">No questions available.</div>;
  }

  return (
    <div className="main-layout">
      {/* Passage Section */}
      <div className="passage-column">
        <div className="passage-box">
          <p>{passage}</p>
        </div>
      </div>

      {/* Questions Section */}
      <div className="question-column">
        <Question
          editable={false}
          question={questions[currentQuestionIndex]}
          onSelectChoice={(choiceIndex) => handleUpdateChoice(choiceIndex)}
        />
      </div>
      {/* Navigation Area */}
      <div className="question-nav">
          {questions.map((_question, i) => (
            <button
              key={i}
              className={`question-bubble ${i === currentQuestionIndex ? "active" : ""}`}
              onClick={() => setCurrentQuestionIndex(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
    </div>
  );
}