import PassageEditor from "../components/PassageEditor";
import Question from "../components/Questions";
import type { Session, Question as QuestionType } from "../types";

type Props = {
  session: Session;
  setSession: (s: Session) => void;
};

export default function EditView({ session, setSession }: Props) {
  const updateQuestion = (i: number, updated: QuestionType) => {
    const updatedQuestions = [...session.questions];
    updatedQuestions[i] = updated;
    setSession({ ...session, questions: updatedQuestions });
  };

  return (
    <div className="view-container">
      <div className="passage-column">
        <PassageEditor value={session.passage} onChange={(text) => setSession({ ...session, passage: text })} />
      </div>
      <div className="questions-column">
        {session.questions.map((q, i) => (
          <Question
            key={i}
            editable={true}
            question={q}
            onUpdate={(updated) => updateQuestion(i, updated)}
          />
        ))}
      </div>
    </div>
  );
}
