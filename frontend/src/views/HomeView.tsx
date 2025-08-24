import type { AppState, Test } from "../Types.tsx";
import { useRef, useState } from "react";
import "../styles/App.css";
import "../styles/HomeView.css";

type Props = {
  appState: AppState;
  setAppState: (newState: AppState) => void;
};

export default function HomeView({ appState, setAppState }: Props) {
  const [mainDropdownOpen, setMainDropdownOpen] = useState(true);
  const [openTestId, setOpenTestId] = useState<string | null>(null);
  const [testCreationOpen, setTestCreationOpen] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [newTestType, setNewTestType] = useState<"RC" | "LR">("RC");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleTestCreation = () => {
    setMainDropdownOpen(false);
    setOpenTestId(null);
    setTestCreationOpen(!testCreationOpen);
  };

  const toggleMainDropdown = () => {
    setMainDropdownOpen(!mainDropdownOpen);
    setOpenTestId(null);
    setTestCreationOpen(false);
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTestName.trim()) {
      createTest(newTestName, newTestType);
    }
  };


  // Creates a new test and switches to Edit mode
  const createTest = (name: string, type: "RC" | "LR") => {
    const newTestId = String(Date.now());
    const newTest: Test = {
      type: type,
      id: newTestId,
      name: name,
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

  const deleteTest = (testId: string) => {
    const newTests = {...appState.tests};
    delete newTests[testId];
    setAppState({
      ...appState,
      tests: newTests,
    });
  }

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

  // Downloads a test as a JSON file
  const downloadTest = (testId: string) => {
    const test = appState.tests[testId];
    const exportTest = {
      id: test.id,
      name: test.name,
      type: test.type,
      sections: test.sections.map((section) => ({
        passage: section.passage,
        questions: section.questions.map((q) => ({
          stem: q.stem,
          choices: q.choices,
          correctChoice: q.correctChoice,
        })),
      })),
    };

    const blob = new Blob([JSON.stringify(exportTest, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${test.name.replace(/\s+/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const testsArray: Test[] = Array.isArray(parsed) ? parsed : [parsed];
        const newTests: Record<string, Test> = {};
        testsArray.forEach((t) => {
          let id = t.id || String(Date.now() + Math.random());
          if (appState.tests[id]) {
            id = `${id}-${Date.now()}`;
          }
          newTests[id] = {
            id,
            name: t.name || "Untitled",
            type: t.type,
            sections: (t.sections || []).map((section) => ({
              passage: section.passage || "",
              questions: (section.questions || []).map((q) => ({
                stem: q.stem || "",
                choices: q.choices || [],
                correctChoice: q.correctChoice,
              })),
            })),
          };
        });
        setAppState({
          ...appState,
          tests: { ...appState.tests, ...newTests },
        });
      } catch (err) {
        console.error("Failed to upload tests", err);
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be uploaded again if needed
    e.target.value = "";
  };

  return (
    <div className="home-view">
      <h1>Welcome to the Test Manager</h1>
      <div className="actions">
        {/* Create New Test Button - now toggles the creation form */}
        <button className="create-test-btn" onClick={toggleTestCreation}>
          <span className="icon">➕</span>
          New Test
        </button>

        <button className="upload-test-btn" onClick={handleUploadClick}>
          <span className="icon">📤</span>
          Upload
        </button>

        {/* Toggle Dropdown Button (appears as "+") */}
        <button
          className="toggle-dropdown-btn"
          onClick={toggleMainDropdown}
          aria-label="Toggle Dropdown"
        >
          {mainDropdownOpen ? "−" : "＋"}
        </button>
      </div>

      {/* Test Creation Dropdown */}
      <div className={`test-creation-dropdown ${testCreationOpen ? "open" : "closed"}`}>
        <form onSubmit={handleTestSubmit} className="test-creation-form">
          <div className="form-group">
            <label htmlFor="test-name">Test Name:</label>
            <input
              type="text"
              id="test-name"
              value={newTestName}
              onChange={(e) => setNewTestName(e.target.value)}
              placeholder="Enter test name"
              required
            />
          </div>

          <div className="form-group">
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="test-type"
                  value="RC"
                  checked={newTestType === "RC"}
                  onChange={() => setNewTestType("RC")}
                />
                RC
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="test-type"
                  value="LR"
                  checked={newTestType === "LR"}
                  onChange={() => setNewTestType("LR")}
                />
                LR
              </label>
            </div>
          </div>

          <button type="submit" className="submit-test-btn">Create Test</button>
          <button className="cancel-test-btn" onClick={toggleTestCreation}>Cancel</button>
        </form>
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
                Take Test
              </div>
              <div
                className="test-option"
                onClick={() => editTest(test.id)}
              >
                Edit Test
              </div>
              <div
                className="test-option"
                onClick={() => downloadTest(test.id)}
              >
                Download Test
              </div>
              <div
                className="test-option"
                onClick={() => deleteTest(test.id)}
              >
                Delete Test
              </div>
            </div>
          </div>
        ))}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="application/json,text/plain"
        onChange={handleFileUpload}
      />
    </div>
  );
}