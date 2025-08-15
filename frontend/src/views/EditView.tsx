import React, {useEffect, useState} from "react";
import PassageEditor from "../components/PassageEditor";
import QuestionEditor from "../components/QuestionEditor";
import type {Question, Test, Section} from "../Types";
import "../styles/App.css";
import "../styles/EditView.css";
import HomeButton from "../components/HomeButton.tsx";
import QuestionNavigation from "../components/QuestionNavigation.tsx";

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
  const createEmptyQuestion = (): Question => ({
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
  const handleQuestionUpdate = (updatedQuestion: Question) => {
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

const addQuestion = (sectionIndex: number, afterQuestionIndex: number) => {
  console.log("Adding question at section:", sectionIndex, "after question:", afterQuestionIndex);

  // Make sure section index is valid
  if (sectionIndex === undefined || !safeSections[sectionIndex]) {
    console.error(`Section with index ${sectionIndex} doesn't exist`);
    return;
  }

  // Create a new empty question
  const newQuestion: Question = {
    stem: "",
    choices: ["", "", "", "", ""]
  };

  // Create a deep copy of the target section
  const sectionToUpdate = { ...safeSections[sectionIndex] };

  // Make sure questions array exists
  if (!sectionToUpdate.questions) {
    sectionToUpdate.questions = [];
  }

  // Create a copy of the questions array
  const newQuestions = [...sectionToUpdate.questions];

  // Insert the new question after the specified position
  newQuestions.splice(afterQuestionIndex + 1, 0, newQuestion);

  // Update the section with the new questions array
  sectionToUpdate.questions = newQuestions;

  // Update only the specific section
  onUpdateSection(sectionIndex, sectionToUpdate);

  // Navigate to the newly added question
  setCurrentSectionIndex(sectionIndex);
  setCurrentQuestionIndex(afterQuestionIndex + 1);
};



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

      <QuestionNavigation
        test={test}
        currentSectionIndex={currentSectionIndex}
        currentQuestionIndex={currentQuestionIndex}
        onQuestionSelect={(sectionIndex, questionIndex) => {
          setCurrentSectionIndex(sectionIndex);
          setCurrentQuestionIndex(questionIndex);
        }}
        isEditView={true}
        onAddQuestion={addQuestion}
        onAddSection={addSection}
      />

    </div>
  );
}
