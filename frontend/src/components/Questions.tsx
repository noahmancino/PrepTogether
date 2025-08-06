import QuestionDisplay from "./QuestionDisplay";
import QuestionEditor from "./QuestionEditor";
import type { Question as QuestionType } from "../Types.tsx";

type Props = {
  editable: boolean;
  question: QuestionType;
  onUpdate?: (updated: QuestionType) => void;
  onSelectChoice?: (choiceIndex: number) => void;
};

export default function Question({
  editable,
  question,
  onUpdate,
  onSelectChoice,
}: Props) {
  return editable ? (
    <QuestionEditor
      question={question}
      onUpdate={onUpdate!}
    />
  ) : (
    <QuestionDisplay
      question={question}
      onSelectChoice={onSelectChoice}
    />
  );
}
