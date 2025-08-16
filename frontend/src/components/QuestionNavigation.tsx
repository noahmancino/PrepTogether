import React, { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import type { Test, Question, Section } from "../Types.tsx";

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
  // Callbacks for reordering
  onReorderQuestions?: (sectionIndex: number, questions: Question[]) => void;
  onReorderSections?: (sections: Section[]) => void;
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
  // State for the add options dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedQuestion, setDraggedQuestion] = useState<{sectionIndex: number; question: Question} | null>(null);

  let globalIndex = 0;

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

  const handleQuestionReorder = (sectionIdx: number, newQuestions: Question[]) => {
    onReorderQuestions?.(sectionIdx, newQuestions);
    if (draggedQuestion && draggedQuestion.sectionIndex === sectionIdx) {
      const newIndex = newQuestions.indexOf(draggedQuestion.question);
      onQuestionSelect(sectionIdx, newIndex);
    }
  };

  const handleSectionReorder = (newSections: Section[]) => {
    onReorderSections?.(newSections);
    if (draggedQuestion) {
      const newSectionIndex = newSections.findIndex(s => s.questions.includes(draggedQuestion.question));
      const newQuestionIndex = newSections[newSectionIndex].questions.indexOf(draggedQuestion.question);
      onQuestionSelect(newSectionIndex, newQuestionIndex);
    }
  };

  const SectionItem = ({ section, sectionIdx }: { section: Section; sectionIdx: number }) => {
    const controls = useDragControls();
    return (
      <Reorder.Item
        value={section}
        dragListener={test.type !== "RC"}
        dragControls={controls}
        style={{ display: "contents" }}
      >
        {test.type === "RC" && sectionIdx > 0 && (
          <div
            className="section-divider"
            onPointerDown={(e) => controls.start(e)}
          />
        )}

        <Reorder.Group
          axis="x"
          values={section.questions}
          onReorder={(newQs) => handleQuestionReorder(sectionIdx, newQs)}
          style={{ display: "contents" }}
        >
          {section.questions.flatMap((question, questionIdx) => {
            const isActive =
              sectionIdx === currentSectionIndex &&
              questionIdx === currentQuestionIndex;
            const number = globalIndex++;
            const elements = [
              <Reorder.Item
                as="button"
                value={question}
                key={`q-${sectionIdx}-${questionIdx}`}
                className={`question-bubble ${isActive ? "active" : ""} ${
                  question.selectedChoice !== undefined ? "answered" : ""
                }`}
                onClick={() => onQuestionSelect(sectionIdx, questionIdx)}
                onDragStart={() => {
                  setIsDragging(true);
                  setDraggedQuestion({ sectionIndex: sectionIdx, question });
                  onQuestionSelect(sectionIdx, questionIdx);
                }}
                onDragEnd={() => {
                  setIsDragging(false);
                  setDraggedQuestion(null);
                }}
              >
                {number + 1}
              </Reorder.Item>
            ];

            if (isEditView && isActive && !isDragging) {
              elements.push(
                <div className="add-options-container" key={`add-${sectionIdx}-${questionIdx}`}>
                  <button
                    className="question-bubble new-question"
                    onClick={handleAddButtonClick}
                    title={
                      test.type === "LR" ? "Add Section" : "Add Question or Section"
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
              );
            }

            return elements;
          })}
        </Reorder.Group>
      </Reorder.Item>
    );
  };

  return (
    <Reorder.Group
      axis="x"
      values={test.sections}
      onReorder={handleSectionReorder}
      className="question-nav"
    >
      {test.sections.map((section, idx) => (
        <SectionItem key={`s-${idx}`} section={section} sectionIdx={idx} />
      ))}
    </Reorder.Group>
  );
}
