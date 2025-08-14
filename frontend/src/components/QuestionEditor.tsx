import type { ChangeEvent } from "react";
import type { Question as QuestionType } from "../Types.tsx";
import "../styles/App.css"

type Props = {
  question: QuestionType;
  onUpdate: (updated: QuestionType) => void;
};

export default function QuestionEditor({ question, onUpdate }: Props) {
  const updateStem = (e: ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
    onUpdate({ ...question, stem: e.target.value });
  };

  const updateChoice = (i: number, e: ChangeEvent<HTMLTextAreaElement>) => {
    const updatedChoices = [...question.choices];
    updatedChoices[i] = e.target.value;

    // Auto-grow height up to max
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";

    onUpdate({ ...question, choices: updatedChoices });
  };

  return (
    <div className="question-block">
      <div className="question-stem">
        <label>
          <textarea
            className="question-editor-textarea question-stem"
            value={question.stem}
            onChange={(e) => updateStem(e)}
          />
        </label>
      </div>
      <div className="question-choices">
        <strong>Choices:</strong>
        {question.choices.map((choice, i) => (
          <label key={i} style={{ display: "block", marginTop: "0.5rem" }}>
            <strong>{String.fromCharCode(65 + i)}.</strong>
            <textarea
              className="question-editor-textarea question-choice"
              value={choice}
              onChange={(e) => updateChoice(i, e)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
