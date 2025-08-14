import { useState } from "react";
import "./App.css";
import type { AppState, Test, Section } from "./Types.tsx";
import HomeView from "./views/HomeView";
import EditView from "./views/EditView";
import DisplayView from "./views/DisplayView";
import {multipleTestsEditingState} from "./sampleStates.tsx";



// Main App component
export default function App() {
  // Initialize the application's state
  const [appState, setAppState] = useState<AppState>({
    ...multipleTestsEditingState
  });

  // Get the currently active test based on activeTestId
  const activeTest = appState.activeTestId
    ? appState.tests[appState.activeTestId]
    : null;

  // Update a specific question inside a section
  const updateQuestion = (sectionIndex: number, questionIndex: number, updatedQuestion: any) => {
    if (!activeTest) return;

    // Spread operator to deep-copy sections and questions
    const updatedSections = [...activeTest.sections];
    updatedSections[sectionIndex].questions[questionIndex] = updatedQuestion;

    // Update the tests object in the global app state
    const updatedTests = { ...appState.tests, [activeTest.id]: { ...activeTest, sections: updatedSections } };
    setAppState({ ...appState, tests: updatedTests });
  };

  return (
    <div className="app-container">
      {/* Home View */}
      {appState.viewMode === "home" && (
        <HomeView
          appState={appState}
          setAppState={(newAppState) => setAppState(newAppState)}
        />
      )}

  {/* Display View */}
  {appState.viewMode === "display" && activeTest && (
    <DisplayView
      sections={activeTest.sections.map((section, sectionIndex) => ({
        passage: section.passage,
        questions: section.questions.map((question, questionIndex) => ({
          ...question,
          sectionIndex,
          questionIndex,
        }))
      }))}
      onUpdate={(sectionIndex, questionIndex, updatedQuestion) =>
        updateQuestion(sectionIndex, questionIndex, updatedQuestion)
      }
    />
  )}

      {/* Edit View */}
      {appState.viewMode === "edit" && activeTest && (
        <EditView
          sections={activeTest.sections}
          onUpdateSection={(index, updatedSection) => {
            const updatedSections = [...activeTest.sections];
            updatedSections[index] = updatedSection;
            const updatedTests = { ...appState.tests, [activeTest.id]: { ...activeTest, sections: updatedSections } };
            setAppState({ ...appState, tests: updatedTests });
          }}
        />
      )}
    </div>
  );
}