import React, { useState } from "react";
import Question from "../components/Questions.tsx";

type Props = {
  sections: {
    passage: string;
    questions: {
      stem: string;
      choices: string[];
      selectedChoice?: number;
      sectionIndex: number;
      questionIndex: number;
    }[];
  }[];
  onUpdate: (
    sectionIndex: number,
    questionIndex: number,
    updatedQuestion: any
  ) => void;
};

export default function DisplayView({ sections, onUpdate }: Props) {
  // Track current question across all sections
  const [currentGlobalQuestionIndex, setCurrentGlobalQuestionIndex] = useState(0);

  // Create a flat array of all questions for easier navigation
  const allQuestions = sections.flatMap(section => section.questions);

  // Get the current question and its section
  const currentQuestion = allQuestions[currentGlobalQuestionIndex];
  const currentSectionIndex = currentQuestion?.sectionIndex || 0;

  // Handles updating the question when a choice is selected
  const handleUpdateChoice = (choiceIndex: number) => {
    const questionMeta = allQuestions[currentGlobalQuestionIndex];
    const updatedQuestion = { ...questionMeta, selectedChoice: choiceIndex };
    onUpdate(questionMeta.sectionIndex, questionMeta.questionIndex, updatedQuestion);
  };

  if (!sections || sections.length === 0) {
    return <div className="error-message">No sections available.</div>;
  }

  if (!allQuestions || allQuestions.length === 0) {
    return <div className="error-message">No questions available.</div>;
  }

  return (
      <div>
        <div className="main-layout">
          {/* Passage Section */}
          <div className="passage-column">
            <div className="passage-box">
              <p>{sections[currentSectionIndex].passage}</p>
            </div>
          </div>

          {/* Questions Section */}
          <div className="question-column">
            <Question
              editable={false}
              question={currentQuestion}
              onSelectChoice={(choiceIndex) => handleUpdateChoice(choiceIndex)}
            />
          </div>
        </div>
        <div className="question-nav">
          {allQuestions.map((question, i, arr) => (
            <React.Fragment key={i}>
              <button
                className={`question-bubble ${i === currentGlobalQuestionIndex ? "active" : ""}`}
                onClick={() => setCurrentGlobalQuestionIndex(i)}
              >
                {i + 1}
              </button>
              {/* Add section divider if next question is from a different section */}
              {i < arr.length - 1 && question.sectionIndex !== arr[i + 1].sectionIndex && (
                <span className="section-divider">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
  );
}