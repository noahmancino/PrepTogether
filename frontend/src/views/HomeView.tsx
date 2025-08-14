import type { AppState, Test } from "../Types.tsx";
import "../App.css";
import { useState } from "react";

type Props = {
  appState: AppState;
  setAppState: (newState: AppState) => void;
};

export default function HomeView({ appState, setAppState }: Props) {
  const [mainDropdownOpen, setMainDropdownOpen] = useState(false);
  const [openTestId, setOpenTestId] = useState<string | null>(null);

  // Creates a new test and switches to Edit mode
  const createTest = () => {
    const newTestId = String(Date.now());
    const newTest: Test = {
      id: newTestId,
      name: `New Test ${Object.keys(appState.tests).length + 1}`,
      sections: [
        {
          passage: "",
          questions: [],
        },
      ],
    };

    setAppState({
      ...appState,
      tests: {
        ...appState.tests,
        [newTestId]: newTest,
      },
      activeTestId: newTestId,
      viewMode: "edit", // Switch to edit mode
    });
  };

  // Opens an existing test for viewing
  const viewTest = (testId: string) => {
    setAppState({
      ...appState,
      activeTestId: testId,
      viewMode: "display", // Switch to display mode
    });
  };

  // Opens an existing test for editing
  const editTest = (testId: string) => {
    setAppState({
      ...appState,
      activeTestId: testId,
      viewMode: "edit", // Switch to edit mode
    });
  };

  // Toggles the main dropdown state
  const toggleMainDropdown = () => {
    setMainDropdownOpen(!mainDropdownOpen);
    // Close any open test dropdown when toggling the main dropdown
    setOpenTestId(null);
  };

  // Toggles a specific test's dropdown
  const toggleTestDropdown = (testId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from bubbling up

    // If this test dropdown is already open, close it
    if (openTestId === testId) {
      setOpenTestId(null);
    } else {
      // Otherwise, open this test dropdown and close any other
      setOpenTestId(testId);
    }
  };

  return (
    <div className="home-view">
      <h1>Welcome to the Test Manager</h1>
      <div className="actions">
        {/* Create New Test Button */}
        <button className="create-test-btn" onClick={createTest}>
          Create New Test
        </button>

        {/* Toggle Dropdown Button (appears as "+") */}
        <button
          className="toggle-dropdown-btn"
          onClick={toggleMainDropdown}
          aria-label="Toggle Dropdown"
        >
          {mainDropdownOpen ? "-" : "+"} {/* Symbol toggles between + and - */}
        </button>
      </div>

      {/* Main Dropdown Menu */}
      <div className={`test-dropdown ${mainDropdownOpen ? "open" : "closed"}`}>
        {Object.values(appState.tests).map((test) => (
          <div key={test.id} className="test-item-container">
            <div
              className="test-item"
              onClick={(e) => toggleTestDropdown(test.id, e)}
            >
              {test.name}
            </div>

            {/* Always render the options dropdown, but control visibility with CSS */}
            <div className={`test-options-dropdown ${openTestId === test.id ? 'open' : ''}`}>
              <div
                className="test-option"
                onClick={() => viewTest(test.id)}
              >
                View
              </div>
              <div
                className="test-option"
                onClick={() => editTest(test.id)}
              >
                Take
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}