import type { ChangeEvent } from "react";
import type { Question as QuestionType } from "../types";

type Props = {
  question: QuestionType;
  onUpdate: (updated: QuestionType) => void;
};

export default function QuestionEditor({ question, onUpdate }: Props) {
  const updateStem = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...question, stem: e.target.value });
  };

  const updateChoice = (i: number, e: ChangeEvent<HTMLTextAreaElement>) => {
    const updatedChoices = [...question.choices];
    updatedChoices[i] = e.target.value;
    onUpdate({ ...question, choices: updatedChoices });
  };

  return (
    <div className="question-block">
      <div className="question-stem">
        <label>
          <textarea
            className="stem-textarea"
            value={question.stem}
            onChange={updateStem}
          />
        </label>
      </div>
      <div className="question-choices">
        <strong>Choices:</strong>
        {question.choices.map((choice, i) => (
          <label key={i} style={{ display: "block", marginTop: "0.5rem" }}>
            <strong>{String.fromCharCode(65 + i)}.</strong>
            <textarea
              className="choice-textarea"
              value={choice}
              onChange={(e) => updateChoice(i, e)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
