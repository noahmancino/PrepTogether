import React, {useEffect, useState} from "react";
import PassageEditor from "../components/PassageEditor";
import QuestionEditor from "../components/QuestionEditor";
import type {Question as QuestionType, Test, Section} from "../Types";
import "../styles/App.css";
import "../styles/EditView.css";
import HomeButton from "../components/HomeButton.tsx";


type Props = {
  test: Test;
  onUpdateSection: (index: number, updatedSection: Section) => void;
  setAppState: (state: (prevState: any) => any) => void;
  onUpdateTestName: (id:string, name:string) => void;
};

export default function EditView({ test, onUpdateSection, setAppState, onUpdateTestName }: Props) {
  // Current section and question being edited
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [testState, setTestState] = useState<Test>(test);

  // Ensure we always have at least one section with one question
  useEffect(() => {
    if (test.sections.length === 0) {
      const newSection = { passage: "", questions: [createEmptyQuestion()] };
      onUpdateSection(0, newSection);
    } else if (test.sections[0] && (!test.sections[0].questions || test.sections[0].questions.length === 0)) {
      const newSection = { ...test.sections[0], questions: [createEmptyQuestion()] };
      onUpdateSection(0, newSection);
    }
  }, [test.sections, onUpdateSection]);

  // Create an empty question with 5 choices
  const createEmptyQuestion = (): QuestionType => ({
    stem: "",
    choices: ["", "", "", "", ""]
  });

  // Safe navigation - ensure sections exist
  const safeSections = test.sections || [];
  const currentSection = safeSections[currentSectionIndex] || { passage: "", questions: [] };
  const currentQuestion =
    currentSection.questions &&
    currentSection.questions.length > 0 &&
    currentSection.questions[currentQuestionIndex]
      ? currentSection.questions[currentQuestionIndex]
      : createEmptyQuestion();

  // Handle updating a question
  const handleQuestionUpdate = (updatedQuestion: QuestionType) => {
    const updatedQuestions = [...currentSection.questions];
    updatedQuestions[currentQuestionIndex] = updatedQuestion;

    const updatedSection = {
      ...currentSection,
      questions: updatedQuestions
    };

    onUpdateSection(currentSectionIndex, updatedSection);
  };

  // Handle updating the passage
  const handlePassageUpdate = (updatedPassage: string) => {
    const updatedSection = {
      ...currentSection,
      passage: updatedPassage
    };

    onUpdateSection(currentSectionIndex, updatedSection);
  };

  const handleTitleUpdate = (updatedTitle: string) => {
    console.log(updatedTitle);
    setTestState({...test, name: updatedTitle});
    onUpdateTestName(test.id, updatedTitle);
  };

  // Add a new question to the current section
  const addQuestion = () => {
    const updatedQuestions = [...currentSection.questions, createEmptyQuestion()];
    const updatedSection = {
      ...currentSection,
      questions: updatedQuestions
    };

    onUpdateSection(currentSectionIndex, updatedSection);
    setCurrentQuestionIndex(updatedQuestions.length - 1);
    setShowAddOptions(false);
  };

  const getTotalQuestionIndex = (sectionIndex: number, questionIndex: number) => {
    for (let i = 0; i < sectionIndex; i++) {
      const section = safeSections[i];
      if (section.questions) {
        questionIndex += section.questions.length;
      }
    }
    return questionIndex;
  }

  // Add a new section
  const addSection = () => {
    const newSection = {
      passage: "",
      questions: [createEmptyQuestion()]
    };

    // Add the new section to the end
    const newSectionIndex = safeSections.length;
    onUpdateSection(newSectionIndex, newSection);

    // Switch to the new section
    setCurrentSectionIndex(newSectionIndex);
    setCurrentQuestionIndex(0);
    setShowAddOptions(false);
  };

  return (
    <div style={{ display: "block" }}>
      <div className="edit-home-button">
        <HomeButton setAppState={setAppState} />
      </div>
      <input
        className="heading-input"
        contentEditable={true}
        type="text"
        value={testState.name}
        onChange={(e) => handleTitleUpdate(e.target.value)}
      >
      </input>
      <div className="main-layout">
        {/* Passage Column */}
        <div className="passage-column">
          <PassageEditor
            value={currentSection.passage || ""}
            onChange={handlePassageUpdate}
          />
        </div>

        {/* Questions Column */}
        <div className="question-column">
          {/* Question Content */}
          <div className="question-content">
            <QuestionEditor
              question={currentQuestion}
              onUpdate={handleQuestionUpdate}
            />
          </div>
        </div>

      </div>
      {/* Question Navigation at the bottom */}
      <div className="question-nav">
        {safeSections.map((section, sectionIdx) => (
          <React.Fragment key={sectionIdx}>
            {section.questions && section.questions.map((question, questionIdx) => (
              <button
                key={`${sectionIdx}-${questionIdx}`}
                className={`question-bubble ${
                  sectionIdx === currentSectionIndex &&
                  questionIdx === currentQuestionIndex
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setCurrentSectionIndex(sectionIdx);
                  setCurrentQuestionIndex(questionIdx);
                }}
              >
                {getTotalQuestionIndex(sectionIdx, questionIdx) + 1}
              </button>
            ))}

            {/* Section divider */}
            {sectionIdx < safeSections.length - 1 && (
              <span className="section-divider">|</span>
            )}
          </React.Fragment>
        ))}

        {/* Add new question/section button */}
        <div className="add-options-container">
          <button
            className="question-bubble new-question"
            onClick={() => setShowAddOptions(!showAddOptions)}
            title="Add new content"
          >
            +
          </button>

          {showAddOptions && (
            <div className="add-options-dropdown">
              <button
                onClick={addQuestion}
              >
                New Question
              </button>
              <button
                onClick={addSection}
              >
                New Section
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
  );
}
