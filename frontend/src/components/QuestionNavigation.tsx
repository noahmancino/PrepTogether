import React, { useState } from "react";
import type { Test, Question, Section } from "../Types.tsx";

type QuestionNavigationProps = {
  test: Test;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  onQuestionSelect: (sectionIndex: number, questionIndex: number) => void;
  isEditView?: boolean;
  onAddQuestion?: (sectionIndex: number, afterQuestionIndex: number) => void;
  onAddSection?: () => void;
  onReorderQuestions?: (sectionIndex: number, newQuestions: Question[]) => void;
  onReorderSections?: (newSections: Section[]) => void;
};

export default function QuestionNavigation({
  test,
  currentSectionIndex,
  currentQuestionIndex,
  onQuestionSelect,
  isEditView = false,
  onAddQuestion,
  onAddSection,
  onReorderQuestions,
  onReorderSections
}: QuestionNavigationProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleAddButtonClick = () => {
    if (test.type === "LR") {
      onAddSection?.();
    } else {
      setShowDropdown(prev => !prev);
    }
  };

  const handleAddQuestion = () => {
    onAddQuestion?.(currentSectionIndex, currentQuestionIndex);
    setShowDropdown(false);
  };

  const handleMoveQuestion = (direction: number) => {
    const section = test.sections[currentSectionIndex];
    if (!section) return;
    const newIndex = currentQuestionIndex + direction;
    if (newIndex < 0 || newIndex >= section.questions.length) return;
    const newQuestions = [...section.questions];
    const [moved] = newQuestions.splice(currentQuestionIndex, 1);
    newQuestions.splice(newIndex, 0, moved);
    onReorderQuestions?.(currentSectionIndex, newQuestions);
    onQuestionSelect(currentSectionIndex, newIndex);
  };

  const handleMoveSection = (direction: number) => {
    const newIndex = currentSectionIndex + direction;
    if (newIndex < 0 || newIndex >= test.sections.length) return;
    const newSections = [...test.sections];
    const [moved] = newSections.splice(currentSectionIndex, 1);
    newSections.splice(newIndex, 0, moved);
    onReorderSections?.(newSections);
    onQuestionSelect(newIndex, currentQuestionIndex);
  };

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

  const currentGlobalIndex =
    allQuestions.find(
      q =>
        q.sectionIndex === currentSectionIndex &&
        q.questionIndex === currentQuestionIndex
    )?.globalIndex || 0;

  return (
    <div className="question-nav-wrapper">
      <div className="question-nav">
        {allQuestions.map(item => {
          const isActive = item.globalIndex === currentGlobalIndex;

          return (
            <React.Fragment
              key={`${item.sectionIndex}-${item.questionIndex}`}
            >
              {test.type === "RC" && item.isFirstInSection && item.sectionIndex > 0 && (
                <div className="section-divider" />
              )}

              <button
                className={`question-bubble ${
                  isActive ? "active" : ""
                } ${
                  item.question.selectedChoice !== undefined ? "answered" : ""
                }`}
                onClick={() =>
                  onQuestionSelect(item.sectionIndex, item.questionIndex)
                }
              >
                {item.globalIndex + 1}
              </button>

              {isEditView && isActive && (
                <div className="add-options-container">
                  <button
                    className="question-bubble new-question"
                    onClick={handleAddButtonClick}
                    title={
                      test.type === "LR"
                        ? "Add Section"
                        : "Add Question or Section"
                    }
                  >
                    +
                  </button>

                  {showDropdown && test.type === "RC" && (
                    <div className="add-options-dropdown">
                      <button onClick={handleAddQuestion}>Add Question</button>
                      <button
                        onClick={() => {
                          onAddSection?.();
                          setShowDropdown(false);
                        }}
                      >
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

      {isEditView && (
        <div className="reorder-controls">
          <button
            className="question-bubble move-button"
            onClick={() => handleMoveQuestion(-1)}
            title="Move question left"
          >
            ←
          </button>
          <button
            className="question-bubble move-button"
            onClick={() => handleMoveQuestion(1)}
            title="Move question right"
          >
            →
          </button>
          <button
            className="question-bubble move-button"
            onClick={() => handleMoveSection(-1)}
            title="Move section left"
          >
            ⇐
          </button>
          <button
            className="question-bubble move-button"
            onClick={() => handleMoveSection(1)}
            title="Move section right"
          >
            ⇒
          </button>
        </div>
      )}
    </div>
  );
}

