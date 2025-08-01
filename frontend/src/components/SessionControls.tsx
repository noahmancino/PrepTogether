import React, { ChangeEvent } from "react";

type Question = {
  stem: string;
  choices: string[];
  selectedChoice?: number;
};

type Session = {
  passage: string;
  questions: Question[];
};

type Props = {
  session: Session;
  onImport: (data: Session) => void;
};

export default function SessionControls({ session, onImport }: Props) {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lsat-session.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        onImport(data);
      } catch {
        alert("Invalid session file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
      <button onClick={handleExport}>Save to File</button>
      <label>
        Load from File:
        <input
          type="file"
          accept=".json"
          style={{ marginLeft: "0.5rem" }}
          onChange={handleImport}
        />
      </label>
    </div>
  );
}
