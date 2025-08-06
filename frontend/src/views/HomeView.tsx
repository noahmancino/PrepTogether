import type { AppState, Test } from "../Types.tsx";
import "../App.css";
import { useState } from "react";

type Props = {
  appState: AppState;
  setAppState: (newState: AppState) => void;
};

export default function HomeView({ appState, setAppState }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  // Opens an existing test and switches to Display mode
  const openTest = (testId: string) => {
    setAppState({
      ...appState,
      activeTestId: testId,
      viewMode: "display", // Switch to display mode
    });
  };

  // Toggles the dropdown state
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
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
          onClick={toggleDropdown}
          aria-label="Toggle Dropdown"
        >
          {dropdownOpen ? "-" : "+"} {/* Symbol toggles between + and - */}
        </button>
      </div>

      {/* Dropdown Menu */}
      <div className={`test-dropdown ${dropdownOpen ? "open" : "closed"}`}>
        {Object.values(appState.tests).map((test) => (
          <div
            key={test.id}
            className="test-item"
            onClick={() => openTest(test.id)}
          >
            {test.name}
          </div>
        ))}
      </div>
    </div>
  );
}