import "../styles/DisplayView.css";
import type { Question } from "../Types.tsx";

type Props = {
  question: Question;
  onSelectChoice: (choiceIndex: number) => void;
  onSetEliminated: (newEliminated: boolean[]) => void;
};

export default function ShowAnswerButton({
  question,
  onSelectChoice,
  onSetEliminated,
}: Props) {
  const handleShowAnswer = () => {
    if (question.correctChoice !== undefined) {
      // If there's a correct answer defined
      // Create a new array where all choices are eliminated except the correct one
      const newEliminated = question.choices.map((_, index) =>
        index !== question.correctChoice // Eliminate all except correct
      );

      // Set the new eliminated state directly
      onSetEliminated(newEliminated);

      // Select the correct answer
      onSelectChoice(question.correctChoice);
    } else {
      // If no correct answer defined, eliminate all choices
      const newEliminated = new Array(question.choices.length).fill(true);
      onSetEliminated(newEliminated);
    }
  };

  return (
    <button
      onClick={handleShowAnswer}
      title="Show the correct answer"
    >
      Show Answer
    </button>
  );
}