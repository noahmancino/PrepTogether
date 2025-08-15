import React, { useState } from "react";
import type {Test, Question} from "../Types"; // Import the Test type

type QuestionNavigationProps = {
  // The test object containing sections and questions
  test: Test;
  // Current section and question indices
  currentSectionIndex: number;
  currentQuestionIndex: number;
  // Callback when a question bubble is clicked
  onQuestionSelect: (sectionIndex: number, questionIndex: number) => void;
  // Optional flags for adding questions/sections (for EditView only)
  isEditView?: boolean;
  // Optional callbacks
  onAddQuestion?: () => void;
  onAddSection?: () => void;
};

export default function QuestionNavigation({
  test,
  currentSectionIndex,
  currentQuestionIndex,
  onQuestionSelect,
  isEditView = false,
  onAddQuestion,
  onAddSection
}: QuestionNavigationProps) {
  // State for the add options dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  // Toggle the dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Calculate the global question index for the current question
  const calculateGlobalIndex = (sectionIdx: number, questionIdx: number): number => {
    let globalIndex = questionIdx;
    for (let i = 0; i < sectionIdx; i++) {
      globalIndex += test.sections[i].questions.length;
    }
    return globalIndex;
  };

  // Generate an array of all questions with their section and question indices
  const allQuestions: {
    question: Question;
    sectionIndex: number;
    questionIndex: number;
    globalIndex: number;
  }[] = [];

  test.sections.forEach((section, sectionIdx) => {
    section.questions.forEach((question, questionIdx) => {
      allQuestions.push({
        question,
        sectionIndex: sectionIdx,
        questionIndex: questionIdx,
        globalIndex: calculateGlobalIndex(sectionIdx, questionIdx)
      });
    });
  });

  // Calculate the current global index
  const currentGlobalIndex = calculateGlobalIndex(currentSectionIndex, currentQuestionIndex);

  return (
    <div className="question-nav">
      {allQuestions.map((item) => (
        <button
          key={`${item.sectionIndex}-${item.questionIndex}`}
          className={`question-bubble 
            ${item.globalIndex === currentGlobalIndex ? "active" : ""} 
            ${item.question.selectedChoice !== undefined ? "answered" : ""}
          `}
          onClick={() => onQuestionSelect(item.sectionIndex, item.questionIndex)}
        >
          {item.globalIndex + 1}
        </button>
      ))}

      {isEditView && (
        <div className="add-options-container">
          <button
            className="question-bubble new-question"
            onClick={toggleDropdown}
            title="Add Question or Section"
          >
            +
          </button>

          {showDropdown && (
            <div className="add-options-dropdown">
              <button onClick={() => {
                onAddQuestion?.();
                setShowDropdown(false);
              }}>
                Add Question
              </button>
              <button onClick={() => {
                onAddSection?.();
                setShowDropdown(false);
              }}>
                Add Section
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}