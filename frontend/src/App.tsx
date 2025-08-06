import { useState } from "react";
import "./App.css";
import type { AppState, Test, Section } from "./Types.tsx";
import HomeView from "./views/HomeView";
import EditView from "./views/EditView";
import DisplayView from "./views/DisplayView";

// Sample test definition with sample data
const sampleTest: Test = {
  id: "1",
  name: "Sample Test",
  sections: [
    {
      passage: `The rise of remote work has significantly altered the landscape of urban economies...`,
      questions: [
        {
          stem: "Which of the following most accurately expresses the main point of the passage?",
          choices: [
            "The shift to remote work has led to a permanent decrease in demand for commercial real estate in urban areas.",
            "Urban economies are being reshaped due to the growing prevalence of remote work arrangements.",
            "Companies are saving money by closing offices and encouraging employees to work from home.",
            "Public transportation systems have become less relevant in the age of remote work.",
            "Remote work has had no significant impact on urban retail or transit patterns.",
          ],
          selectedChoice: undefined,
        },
      ],
    },
  ],
};

// Main App component
export default function App() {
  // Initialize the application's state
  const [appState, setAppState] = useState<AppState>({
    tests: {
      [sampleTest.id]: sampleTest,
    },
    activeTestId: null, // No test is selected by default
    viewMode: "home", // Default view is "home"
    sessionInfo: null,
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
          passage={activeTest.sections[0]?.passage || ""}
          questions={activeTest.sections.flatMap((section, sectionIndex) =>
            section.questions.map((question, questionIndex) => ({
              ...question,
              sectionIndex,
              questionIndex,
            }))
          )}
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