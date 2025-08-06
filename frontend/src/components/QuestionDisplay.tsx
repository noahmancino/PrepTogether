import type { Question as QuestionType } from "../Types.tsx";

type Props = {
  question: QuestionType;
  onSelectChoice?: (choiceIndex: number) => void;
};

export default function QuestionDisplay({ question, onSelectChoice }: Props) {
  return (
    <div className="question-block">
      <div className="question-stem">
        <p>{question.stem}</p>
      </div>
      <div className="question-choices">
        {question.choices.map((choice, i) => (
          <button
            key={i}
            className={`choice-button${question.selectedChoice === i ? " selected" : ""}`}
            onClick={() => onSelectChoice?.(i)}
            disabled={!onSelectChoice}
          >
            <strong>{String.fromCharCode(65 + i)}.</strong> {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
