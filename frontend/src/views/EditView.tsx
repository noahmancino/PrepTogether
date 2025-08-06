import { useState } from "react";

type QuestionProps = {
  stem: string;
  choices: string[];
  selectedChoice?: number;
  sectionIndex: number;
  questionIndex: number;
};

type Props = {
  passage: string;
  questions: QuestionProps[];
  onUpdate: (
    sectionIndex: number,
    questionIndex: number,
    updatedQuestion: any
  ) => void;
  onAddQuestion: () => void; // Function to handle adding a new question
  onPassageUpdate: (updatedPassage: string) => void; // Function to handle passage updates
};

export default function EditView({
  passage,
  questions,
  onUpdate,
  onAddQuestion,
  onPassageUpdate,
}: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Handles updating the question when changes are made
  const handleUpdateQuestion = (updatedField: string, value: any) => {
    const questionMeta = questions[currentQuestionIndex];
    const updatedQuestion = { ...questionMeta, [updatedField]: value };
    onUpdate(questionMeta.sectionIndex, questionMeta.questionIndex, updatedQuestion);
  };

  return (
    <div className="main-layout">
      {/* Editable Passage Section */}
      <div className="passage-column">
        <div className="passage-box">
          <textarea
            className="passage-textarea"
            value={passage}
            onChange={(e) => onPassageUpdate(e.target.value)}
            placeholder="Edit the passage here..."
          />
        </div>
      </div>

      {/* Editable Questions Section */}
      <div className="question-column">
        {questions.length > 0 ? (
          <div className="editable-question">
            <textarea
              className="question-stem-textarea"
              value={questions[currentQuestionIndex].stem}
              onChange={(e) =>
                handleUpdateQuestion("stem", e.target.value)
              }
              placeholder="Edit the question stem here..."
            />
            <div className="choices-section">
              {questions[currentQuestionIndex].choices.map((choice, choiceIndex) => (
                <textarea
                  key={choiceIndex}
                  className="choice-textarea"
                  value={choice}
                  onChange={(e) =>
                    handleUpdateQuestion("choices", [
                      ...questions[currentQuestionIndex].choices.slice(0, choiceIndex),
                      e.target.value,
                      ...questions[currentQuestionIndex].choices.slice(choiceIndex + 1),
                    ])
                  }
                  placeholder={`Choice ${choiceIndex + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="error-message">No questions available. Use the new question button to add one!</div>
        )}
      </div>

      {/* Navigation Area */}
      <div className="question-nav">
        {questions.map((_question, i) => (
          <button
            key={i}
            className={`question-bubble ${i === currentQuestionIndex ? "active" : ""}`}
            onClick={() => setCurrentQuestionIndex(i)}
          >
            {i + 1}
          </button>
        ))}

        {/* New Question Button */}
        <button
          className="question-bubble new-question"
          onClick={onAddQuestion}
        >
          +
        </button>
      </div>
    </div>
  );
}