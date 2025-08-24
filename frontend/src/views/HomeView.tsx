import type { AppState, Test, CollaborativeSession } from "../Types.tsx";
import { useRef, useState } from "react";
import { createSession, endSession } from "../session/client";
import "../styles/App.css";
import "../styles/HomeView.css";

type Props = {
  appState: AppState;
  onCreateTest: (name: string, type: "RC" | "LR") => void;
  onViewTest: (testId: string) => void;
  onEditTest: (testId: string) => void;
  onDeleteTest: (testId: string) => void;
  onImportTests: (tests: Record<string, Test>) => void;
  onSetSessionInfo: (info: CollaborativeSession | null) => void;
};

export default function HomeView({ appState, onCreateTest, onViewTest, onEditTest, onDeleteTest, onImportTests, onSetSessionInfo }: Props) {
  const [mainDropdownOpen, setMainDropdownOpen] = useState(true);
  const [openTestId, setOpenTestId] = useState<string | null>(null);
  const [testCreationOpen, setTestCreationOpen] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [newTestType, setNewTestType] = useState<"RC" | "LR">("RC");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sessionActive = !!appState.sessionInfo;
  const [copySuccess, setCopySuccess] = useState(false);

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
    onCreateTest(name, type);
  };


  // Opens an existing test for viewing
  const viewTest = (testId: string) => {
    onViewTest(testId);
  };

  // Opens an existing test for editing
  const editTest = (testId: string) => {
    onEditTest(testId);
  };

  const deleteTest = (testId: string) => {
    onDeleteTest(testId);
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
        onImportTests(newTests);
      } catch (err) {
        console.error("Failed to upload tests", err);
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be uploaded again if needed
    e.target.value = "";
  };

  const handleCreateSession = async () => {
    try {
      const data = await createSession(appState);
      onSetSessionInfo({
        sessionId: data.session_id,
        token: data.host_token,
        role: 'tutor',
        connectedUsers: [],
        lastSynced: Date.now(),
        sharedTestId: appState.activeTestId || '',
      });
    } catch (err) {
      console.error('Failed to create session', err);
    }
  };

  const handleEndSession = async () => {
    const token = appState.sessionInfo?.token;
    const sessionId = appState.sessionInfo?.sessionId;
    onSetSessionInfo(null);
    if (!token || !sessionId) return;
    await endSession(sessionId, token)
  }

  const handleCopyLink = () => {
    const sessionId = appState.sessionInfo?.sessionId;
    if (!sessionId) return;
    const url = `${window.location.origin}?session=${sessionId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };


  return (
    <div className="home-view">
      <h1>Welcome to the Test Manager</h1>
      <div className="actions">
        {sessionActive && (
          <>
            <button className="action-btn copy-link-btn" onClick={handleCopyLink}>
              <span className="icon">⧉</span>
              {copySuccess ? "Copied!" : "Copy Session Link"}
            </button>
            <button className="action-btn end-session-btn" onClick={handleEndSession}>
              <span className="icon">■</span>
              End Session
            </button>
          </>
        )}

        {!sessionActive && (
          <button className="action-btn upload-test-btn" onClick={handleUploadClick}>
            <span className="icon">↑</span>
            Upload Tests
          </button>
        )}

        {!sessionActive && (
          <>
            <button className="action-btn start-session-btn" onClick={handleCreateSession}>
              <span className="icon">▶</span>
              Start Session
            </button>
            <button className="action-btn create-test-btn" onClick={toggleTestCreation}>
              <span className="icon">✎</span>
              Create New Test
            </button>
          </>
        )}

        <button
          className="action-btn toggle-dropdown-btn"
          onClick={toggleMainDropdown}
          aria-label="Toggle Dropdown"
        >
          {mainDropdownOpen ? "−" : "+"}
        </button>
      </div>

      {/* Test Creation Dropdown */}
      {!sessionActive && (
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
      )}



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
              {!sessionActive && (
                <div
                  className="test-option"
                  onClick={() => editTest(test.id)}
                >
                  Edit Test
                </div>
              )}
              <div
                className="test-option"
                onClick={() => downloadTest(test.id)}
              >
                Download Test
              </div>
              {!sessionActive && (
                <div
                  className="test-option"
                  onClick={() => deleteTest(test.id)}
                >
                  Delete Test
                </div>
              )}
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