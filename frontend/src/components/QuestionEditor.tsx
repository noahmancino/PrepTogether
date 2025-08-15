import React, {ChangeEvent} from "react";
import type {Question as QuestionType} from "../Types.tsx";
import "../styles/App.css";
import "../styles/DisplayView.css"

type Props = {
  question: QuestionType;
  onUpdate: (updated: QuestionType) => void;

};

export default function QuestionEditor({question, onUpdate}: Props) {
  const updateStem = (e: ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
    onUpdate({...question, stem: e.target.value});
  };

  const updateChoice = (i: number, e: ChangeEvent<HTMLTextAreaElement>) => {
    const updatedChoices = [...question.choices];
    updatedChoices[i] = e.target.value;

    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";

    onUpdate({...question, choices: updatedChoices});
  };

  const handleCorrectChoiceChange = (choiceIndex: number) => {
    onUpdate({...question, correctChoice: choiceIndex});
  };

  return (
    <div className="question-block">
      <div className="question-stem">
        <label>
          <textarea
            className="question-editor-textarea question-stem"
            value={question.stem}
            onChange={updateStem}
          />
        </label>
      </div>
      <div className="question-choices">
        <strong>Choices:</strong>
        {question.choices.map((choice, i) => (
          <label key={i} className="choice-label">
            <textarea
              className={`question-editor-textarea question-choice ${question.correctChoice === i ? "active" : ""}`}
              value={choice}
              onChange={(e) => updateChoice(i, e)}
            />

            <span
              className={`choice-check ${question.correctChoice === i ? "active" : ""}`}
              onClick={() => handleCorrectChoiceChange(i)}
            >
              ✓
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}