import { useState } from "react";
import type { Session } from "../Types.tsx";

type Props = {
  savedTests: Record<string, Session>;
  onCreateNew: () => void;
  onLoadTest: (test: Session, mode: "edit" | "display") => void;
};

export default function HomeView({ savedTests, onCreateNew, onLoadTest }: Props) {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const handleModePick = (mode: "edit" | "display") => {
    if (!selectedTest) return;
    const test = savedTests[selectedTest];
    if (test) onLoadTest(test, mode);
  };

  const testNames = Object.keys(savedTests);

  return (
    <div className="home-container">
      <h1>LSAT Session Tool</h1>
      <button onClick={onCreateNew}>+ Create New Test</button>

      {testNames.length > 0 && (
        <div className="dropdown">
          <p>Select existing test:</p>
          <select
            value={selectedTest || ""}
            onChange={(e) => setSelectedTest(e.target.value)}
          >
            <option value="" disabled>
              -- Choose a test --
            </option>
            {testNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {selectedTest && (
            <div style={{ marginTop: "1rem" }}>
              <button onClick={() => handleModePick("edit")}>Edit</button>
              <button onClick={() => handleModePick("display")}>Display</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
