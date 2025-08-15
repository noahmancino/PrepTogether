import React, { useState } from "react";
import type {Test, Question} from "../Types.tsx"; // Import the Test type

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

  // Generate an array of all questions with their section and question indices
  const allQuestions: {
    question: Question;
    sectionIndex: number;
    questionIndex: number;
    globalIndex: number;
    isFirstInSection: boolean;
  }[] = [];

  let globalIndex = 0;
  test.sections.forEach((section, sectionIdx) => {
    section.questions.forEach((question, questionIdx) => {
      allQuestions.push({
        question,
        sectionIndex: sectionIdx,
        questionIndex: questionIdx,
        globalIndex: globalIndex++,
        isFirstInSection: questionIdx === 0
      });
    });
  });

  // Calculate the current global index
  const currentGlobalIndex = allQuestions.find(
    q => q.sectionIndex === currentSectionIndex && q.questionIndex === currentQuestionIndex
  )?.globalIndex || 0;

  // Handle add button click based on test type
  const handleAddButtonClick = () => {
    if (test.type === "LR") {
      // For LC, directly add a new section
      onAddSection?.();
    } else {
      // For RC, toggle the dropdown
      toggleDropdown();
    }
  };

  return (
    <div className="question-nav">
      {allQuestions.map((item, idx) => (
        <React.Fragment key={`${item.sectionIndex}-${item.questionIndex}`}>
          {/* Show section dividers only for RC tests and if this is the first question in a section (except the first section) */}
          {test.type === "RC" && item.isFirstInSection && item.sectionIndex > 0 && (
            <div className="section-divider" />
          )}
          <button
            className={`question-bubble 
              ${item.globalIndex === currentGlobalIndex ? "active" : ""} 
              ${item.question.selectedChoice !== undefined ? "answered" : ""}
            `}
            onClick={() => onQuestionSelect(item.sectionIndex, item.questionIndex)}
          >
            {item.globalIndex + 1}
          </button>
        </React.Fragment>
      ))}

      {isEditView && (
        <div className="add-options-container">
          <button
            className="question-bubble new-question"
            onClick={handleAddButtonClick}
            title={test.type === "LR" ? "Add Section" : "Add Question or Section"}
          >
            +
          </button>

          {/* Show dropdown only for RC test type */}
          {showDropdown && test.type === "RC" && (
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
