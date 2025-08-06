import type { AppState, Test } from "../Types.tsx";
import "../App.css";
import { useState } from "react";

type Props = {
  appState: AppState;
  setAppState: (newState: AppState) => void;
};

export default function HomeView({ appState, setAppState }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
      viewMode: "edit",
    });
  };

  const openTest = (testId: string) => {
    setAppState({
      ...appState,
      activeTestId: testId,
      viewMode: "display",
    });
  };

  return (
    <div className="home-view">
      <h1>Welcome to the Test Manager</h1>
      <div className="actions">
        <button onClick={createTest}>Create New Test</button>
        <button onClick={() => setDropdownOpen(!dropdownOpen)}>
          {dropdownOpen ? "Close" : "+"}
        </button>
      </div>
      {dropdownOpen && (
        <div className="test-dropdown">
          {Object.values(appState.tests).map((test) => (
            <button
              key={test.id}
              className="test-item"
              onClick={() => openTest(test.id)}
            >
              {test.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}