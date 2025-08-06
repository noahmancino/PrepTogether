import PassageEditor from "../components/PassageEditor";
import Question from "../components/Questions";
import type { Section, Question as QuestionType } from "../Types.tsx";

type Props = {
  sections: Section[];
  onUpdateSection: (sectionIndex: number, updatedSection: Section) => void;
};

export default function EditView({ sections, onUpdateSection }: Props) {
  const updateQuestion = (sectionIndex: number, questionIndex: number, updatedQuestion: QuestionType) => {
    const section = sections[sectionIndex];
    const updatedQuestions = [...section.questions];
    updatedQuestions[questionIndex] = updatedQuestion;
    onUpdateSection(sectionIndex, { ...section, questions: updatedQuestions });
  };

  const updatePassage = (sectionIndex: number, passage: string) => {
    const section = sections[sectionIndex];
    onUpdateSection(sectionIndex, { ...section, passage });
  };

  return (
    <div className="view-container">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="section-container">
          <div className="passage-column">
            <PassageEditor
              value={section.passage}
              onChange={(text) => updatePassage(sectionIndex, text)}
            />
          </div>
          <div className="questions-column">
            {section.questions.map((q, questionIndex) => (
              <Question
                key={`${sectionIndex}-${questionIndex}`}
                editable={true}
                question={q}
                onUpdate={(updatedQuestion) =>
                  updateQuestion(sectionIndex, questionIndex, updatedQuestion)
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}