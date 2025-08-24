import type { Question as QuestionType } from "../Types.tsx";
import "../styles/App.css";
import "../styles/DisplayView.css";

type Props = {
  question: QuestionType;
  onSelectChoice?: (choiceIndex: number) => void;
  onToggleEliminated?: (choiceIndex: number) => void;
};

export default function QuestionDisplay({
  question,
  onSelectChoice,
  onToggleEliminated
}: Props) {
  return (
    <div className="question-block">
      <div className="question-stem">
        <p>{question.stem}</p>
      </div>
      <div className="question-choices">
        {question.choices.map((choice, i) => {
          const isEliminated = question.eliminatedChoices?.[i] || false;
          const isSelected = question.selectedChoice === i;
          const isIncorrect = question.revealedIncorrectChoice === i;

          return (
            <div key={i} className="choice-container">
              <button
                className={`choice-button${isSelected ? " selected" : ""}${isEliminated ? " eliminated" : ""}${isIncorrect ? " incorrect" : ""}`}
                onClick={() => onSelectChoice?.(i)}
                disabled={!onSelectChoice}
              >
                <strong>{String.fromCharCode(65 + i)}.</strong> {choice}
              </button>

              {onToggleEliminated && (
                <button
                  className={`eliminate-button${isEliminated ? " active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleEliminated(i);
                  }}
                  title={isEliminated ? "Restore answer choice" : "Eliminate answer choice"}
                  aria-label={isEliminated ? "Restore answer choice" : "Eliminate answer choice"}
                >
                  {isEliminated ? "⟳" : "⛔"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
