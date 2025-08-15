import React, { useState } from "react";
import type {Test, Question} from "../Types.tsx";

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
  // Updated callbacks with position information
  onAddQuestion?: (sectionIndex: number, afterQuestionIndex: number) => void;
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
      // For LR, directly add a new section
      onAddSection?.();
    } else {
      // For RC, toggle the dropdown
      setShowDropdown(prev => !prev);
    }
  };

  // Handle adding a question after the current position
  const handleAddQuestion = () => {
    // Pass the current section and question indices to add question after the current one
    onAddQuestion?.(currentSectionIndex, currentQuestionIndex);
    setShowDropdown(false);
  };

  return (
    <div className="question-nav">
      {allQuestions.map((item, idx) => {
        // Determine if this is the current active question
        const isActiveQuestion = item.globalIndex === currentGlobalIndex;

        return (
          <React.Fragment key={`${item.sectionIndex}-${item.questionIndex}`}>
            {/* Show section dividers only for RC tests and if this is the first question in a section (except the first section) */}
            {test.type === "RC" && item.isFirstInSection && item.sectionIndex > 0 && (
              <div className="section-divider" />
            )}

            <button
              className={`question-bubble 
                ${isActiveQuestion ? "active" : ""} 
                ${item.question.selectedChoice !== undefined ? "answered" : ""}
              `}
              onClick={() => onQuestionSelect(item.sectionIndex, item.questionIndex)}
            >
              {item.globalIndex + 1}
            </button>

            {/* Show add button after the active question if in edit mode */}
            {isEditView && isActiveQuestion && (
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
                    <button onClick={handleAddQuestion}>
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
          </React.Fragment>
        );
      })}
    </div>
  );
}