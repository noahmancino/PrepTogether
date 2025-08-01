import Question from "../components/Questions.tsx";
import type { Session } from "../types";

type Props = {
  session: Session;
  setSession: (s: Session) => void;
};

export default function DisplayView({ session, setSession }: Props) {
  const updateChoice = (i: number, choiceIndex: number) => {
    const updated = [...session.questions];
    updated[i] = { ...updated[i], selectedChoice: choiceIndex };
    setSession({ ...session, questions: updated });
  };

  return (
    <div className="view-container">
      <div className="passage-column">
        <p>{session.passage}</p>
      </div>
      <div className="questions-column">
        {session.questions.map((q, i) => (
          <Question
            key={i}
            editable={false}
            question={q}
            onSelectChoice={(choiceIndex) => updateChoice(i, choiceIndex)}
          />
        ))}
      </div>
    </div>
  );
}
