import React, { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
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
  const [isDragging, setIsDragging] = useState(false);

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

  let questionCounter = 0;

  return (
    <Reorder.Group
      axis="x"
      className="question-nav"
      values={test.sections}
      onReorder={(newSections: Section[]) => onReorderSections?.(newSections)}
    >
      {test.sections.map((section, sectionIdx) => {
        const sectionControls = useDragControls();
        return (
          <Reorder.Item
            key={sectionIdx}
            value={section}
            dragListener={false}
            dragControls={sectionControls}
            style={{ display: "flex" }}
          >
            {test.type === "RC" && sectionIdx > 0 && (
              <div
                className="section-divider"
                onPointerDown={e => sectionControls.start(e)}
              />
            )}
            <Reorder.Group
              axis="x"
              values={section.questions}
              onReorder={(newQs: Question[]) => onReorderQuestions?.(sectionIdx, newQs)}
              style={{ display: "flex", gap: "0.5rem" }}
            >
              {section.questions.map((question, questionIdx) => {
                const isActive =
                  sectionIdx === currentSectionIndex &&
                  questionIdx === currentQuestionIndex;
                const number = ++questionCounter;
                return (
                  <React.Fragment key={`${sectionIdx}-${questionIdx}`}>
                    <Reorder.Item
                      value={question}
                      as="button"
                      dragListener={isEditView}
                      className={`question-bubble ${isActive ? "active" : ""} ${
                        question.selectedChoice !== undefined ? "answered" : ""
                      }`}
                      onDragStart={() => {
                        setIsDragging(true);
                        onQuestionSelect(sectionIdx, questionIdx);
                      }}
                      onDragEnd={() => setIsDragging(false)}
                      onClick={() => onQuestionSelect(sectionIdx, questionIdx)}
                    >
                      {number}
                    </Reorder.Item>
                    {isEditView && isActive && !isDragging && (
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
            </Reorder.Group>
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
}
