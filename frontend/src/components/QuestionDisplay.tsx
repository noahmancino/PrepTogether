// components/QuestionEditor.tsx
import type { ChangeEvent } from "react";

type Question = {
  stem: string;
  choices: string[];
  selectedChoice?: number;
};

type Props = {
  question: Question;
  qIndex: number;
  onUpdate: (updatedQuestion: Question) => void;
};

export default function QuestionEditor({ question, qIndex, onUpdate }: Props) {
  const handleStemChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...question, stem: e.target.value });
  };

  const handleChoiceChange = (i: number, e: ChangeEvent<HTMLTextAreaElement>) => {
    const updatedChoices = [...question.choices];
    updatedChoices[i] = e.target.value;
    onUpdate({ ...question, choices: updatedChoices });
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h4>Question {qIndex + 1}</h4>
      <label>
        <strong>Stem:</strong>
        <textarea
          style={{ width: "100%", height: "80px", marginTop: "0.25rem" }}
          value={question.stem}
          onChange={handleStemChange}
        />
      </label>

      <div style={{ marginTop: "1rem" }}>
        <strong>Choices:</strong>
        {question.choices.map((choice, i) => (
          <div key={i} style={{ marginBottom: "0.75rem" }}>
            <label>
              <strong>{String.fromCharCode(65 + i)}.</strong>
              <textarea
                style={{ width: "100%", height: "60px", marginTop: "0.25rem" }}
                value={choice}
                onChange={(e) => handleChoiceChange(i, e)}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
