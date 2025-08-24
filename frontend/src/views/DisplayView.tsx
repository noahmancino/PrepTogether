import { useState, useEffect, useRef } from "react";
import Question from "../components/Questions.tsx";
import "../styles/App.css";
import "../styles/DisplayView.css";
import HomeButton from "../components/HomeButton.tsx";
import type { Test, CollaborativeSession } from "../Types.tsx";
import QuestionNavigation from "../components/QuestionNavigation.tsx";
import ShowAnswerButton from "../components/ShowAnswerButton.tsx";
import { connectSession, type SessionConnection, type SessionEvent } from "../session/client";

type HighlightType = "yellow" | "eraser" | "none";

type Props = {
  test: Test;
  sessionInfo: CollaborativeSession | null;
  onUpdate: (
    sectionIndex: number,
    questionIndex: number,
    updatedQuestion: unknown
  ) => void;
  onResetTest: (testId: string) => void;
  onGoHome: () => void;
  registerSessionSend: (send: ((event: SessionEvent) => void) | null) => void;
};

export default function DisplayView({ test, sessionInfo, onUpdate, onResetTest, onGoHome, registerSessionSend }: Props) {
  // Track current question across all sections
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const toggleEliminatedChoice = (
    sectionIndex: number,
    questionIndex: number,
    choiceIndex: number
  ) => {
    const question = test.sections[sectionIndex].questions[questionIndex];
    const currentEliminated =
      question.eliminatedChoices ||
      new Array(question.choices.length).fill(false);
    const newEliminated = [...currentEliminated];
    newEliminated[choiceIndex] = !newEliminated[choiceIndex];

    onUpdate(sectionIndex, questionIndex, {
      ...question,
      eliminatedChoices: newEliminated,
    });
  };

  const setCurrentQuestionEliminated = (newEliminated: boolean[]) => {
    const question = test.sections[currentSectionIndex].questions[currentQuestionIndex];
    onUpdate(currentSectionIndex, currentQuestionIndex, {
      ...question,
      eliminatedChoices: newEliminated,
    });
  };



  const safeSections = test.sections || [];
  const currentSection = safeSections[currentSectionIndex] || { passage: "", questions: [] };
  const currentQuestion = currentSection.questions[currentQuestionIndex]


  // Timer state
  const [timer, setTimer] = useState(0);

  // Highlighter state
  const [activeHighlighter, setActiveHighlighter] = useState<HighlightType>("none");

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

    // Submission overlay state
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // Cleanup state when leaving display view

  // without this, the useEffect happens twice on demount and you can't leave the view. Not really sure why!
  const hasReset = useRef(false);

  useEffect(() => {
    return () => {
      if (!hasReset.current) {
        onResetTest(test.id);
        hasReset.current = true;
      }
    };
  }, []);


  // Timer effect - host controls timer and broadcasts updates
  useEffect(() => {
    if (sessionInfo) {
      if (sessionInfo.role === 'tutor') {
        const timerInterval = setInterval(() => {
          setTimer((prev) => {
            const next = prev + 1;
            sessionRef.current?.send({ type: 'timer', remaining: next });
            return next;
          });
        }, 1000);
        return () => clearInterval(timerInterval);
      }
      // participants rely on host updates
      return;
    }
    const timerInterval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [sessionInfo]);

  // Format timer as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Updated state to track highlighted ranges more efficiently
  const [passageHighlights, setPassageHighlights] = useState<{
    id: string;
    startIndex: number;
    endIndex: number;
    type: string;
  }[]>([]);

  const sessionRef = useRef<SessionConnection | null>(null);

  // establish websocket connection when participating in a session
  useEffect(() => {
    if (!sessionInfo) {
      registerSessionSend(null);
      return;
    }
    const conn = connectSession(sessionInfo.sessionId, sessionInfo.token, (event) => {
      if (event.type === 'timer') {
        setTimer(event.remaining);
      } else if (event.type === 'highlight') {
        setPassageHighlights((prev) => [...prev, event.highlight]);
      } else if (event.type === 'search') {
        setSearchTerm(event.term);
      }
    });
    sessionRef.current = conn;
    registerSessionSend(conn.send);
    return () => {
      conn.close();
      registerSessionSend(null);
    };
  }, [sessionInfo]);

  const handlePassageHighlight = () => {
    if (activeHighlighter === "none") return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectionText = selection.toString().trim();
    if (!selectionText) return;

    // Get the original passage text
    const passageText = currentSection.passage;

    // Find the selected text in the passage
    const selStartOffset = passageText.indexOf(selectionText);
    const selEndOffset = selStartOffset + selectionText.length;

    // If we can't find the exact text, return without highlighting
    if (selStartOffset === -1) {
      console.warn("Could not find selected text in passage");
      return;
    }

    if (activeHighlighter === "eraser") {
      // Process each highlight that overlaps with the selection
      setPassageHighlights((prevHighlights: typeof passageHighlights) => {
        const newHighlights: typeof passageHighlights = [];

        for (const highlight of prevHighlights) {
          // Case 1: No overlap - keep the highlight unchanged
          if (highlight.endIndex <= selStartOffset || highlight.startIndex >= selEndOffset) {
            newHighlights.push(highlight);
            continue;
          }

          // Case 2: Selection completely covers the highlight - remove it entirely
          if (selStartOffset <= highlight.startIndex && selEndOffset >= highlight.endIndex) {
            // Skip this highlight (don't add to newHighlights)
            continue;
          }

          // Case 3: Selection cuts through the middle of the highlight - split it
          if (selStartOffset > highlight.startIndex && selEndOffset < highlight.endIndex) {
            // Create first segment (before the erased part)
            newHighlights.push({
              id: `highlight-${Date.now()}-1`,
              startIndex: highlight.startIndex,
              endIndex: selStartOffset,
              type: 'yellow'
            });

            // Create second segment (after the erased part)
            newHighlights.push({
              id: `highlight-${Date.now()}-2`,
              startIndex: selEndOffset,
              endIndex: highlight.endIndex,
              type: 'yellow'
            });

            continue;
          }

          // Case 4: Selection overlaps with the start of the highlight
          if (selEndOffset < highlight.endIndex) {
            newHighlights.push({
              id: `highlight-${Date.now()}`,
              startIndex: selEndOffset,
              endIndex: highlight.endIndex,
              type: 'yellow'
            });
            continue;
          }

          // Case 5: Selection overlaps with the end of the highlight
          if (selStartOffset > highlight.startIndex) {
            newHighlights.push({
              id: `highlight-${Date.now()}`,
              startIndex: highlight.startIndex,
              endIndex: selStartOffset,
              type: 'yellow'
            });
          }
        }

        return newHighlights;
      });
    } else if (activeHighlighter === "yellow") {
      // Check for overlapping highlights first
      const overlappingHighlights = passageHighlights.filter(h =>
        (h.startIndex < selEndOffset && h.endIndex > selStartOffset)
      );

      if (overlappingHighlights.length > 0) {
        // If there are overlapping highlights, merge them
        const minStart = Math.min(
          selStartOffset,
          ...overlappingHighlights.map(h => h.startIndex)
        );

        const maxEnd = Math.max(
          selEndOffset,
          ...overlappingHighlights.map(h => h.endIndex)
        );

        // Remove the overlapping highlights
        const nonOverlapping = passageHighlights.filter(h =>
          !(h.startIndex < selEndOffset && h.endIndex > selStartOffset)
        );

        // Add the merged highlight
        const merged = {
          id: `highlight-${Date.now()}`,
          startIndex: minStart,
          endIndex: maxEnd,
          type: 'yellow'
        };
        setPassageHighlights([
          ...nonOverlapping,
          merged
        ]);
        sessionRef.current?.send({ type: 'highlight', highlight: merged });
      } else {
        // No overlaps, just add the new highlight
        const newHighlight = {
          id: `highlight-${Date.now()}`,
          startIndex: selStartOffset,
          endIndex: selEndOffset,
          type: 'yellow'
        };
        setPassageHighlights([
          ...passageHighlights,
          newHighlight
        ]);
        sessionRef.current?.send({ type: 'highlight', highlight: newHighlight });
      }
    }

    // Clear the selection
    window.getSelection()?.removeAllRanges();
  };

  const renderPassageWithHighlights = () => {
    const passage = currentSection.passage;

    // Create an array to track highlighting for each character position
    const highlightMap = new Array(passage.length).fill(null);

    // Apply manual highlights first
    passageHighlights.forEach(highlight => {
      for (let i = highlight.startIndex; i < highlight.endIndex; i++) {
        if (i >= 0 && i < highlightMap.length) {
          highlightMap[i] = highlight.type;
        }
      }
    });

    // Process the passage with highlighting information
    let result = '';
    let currentType = null;
    let spanOpen = false;

    // Helper to close any open span
    const closeSpan = () => {
      if (spanOpen) {
        result += '</span>';
        spanOpen = false;
      }
    };

    // First pass: Apply manual highlights
    for (let i = 0; i < passage.length; i++) {
      const highlightType = highlightMap[i];

      // If highlight type changes, close previous span and open new one
      if (highlightType !== currentType) {
        closeSpan();

        if (highlightType) {
          result += `<span class="${highlightType}-highlight">`;
          spanOpen = true;
        }

        currentType = highlightType;
      }

      // Add the character
      result += passage[i];
    }

    // Close any open span at the end
    closeSpan();

    // Second pass: Apply search highlighting (higher priority)
    if (searchTerm && searchTerm.length >= 3) {
      try {
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(`(${escapedSearchTerm})`, 'gi');

        // Modified approach to ensure search highlights appear regardless of underlying highlights
        const processedResult = [];

        // Extract parts between spans and inside spans separately
        let lastIndex = 0;
        let insideSpan = false;

        // Helper function to apply search highlighting to a text segment
        const highlightSearchTerms = (text: string) => {
          return text.replace(searchRegex, (match: string) =>
            `<span class="search-highlight">${match}</span>`
          );
        };

        // Process the HTML string
        for (let i = 0; i < result.length; i++) {
          if (result.substring(i, i + 6) === '<span ') {
            // Found start of a span
            if (!insideSpan) {
              // Process text before span
              const textBeforeSpan = result.substring(lastIndex, i);
              processedResult.push(highlightSearchTerms(textBeforeSpan));

              // Extract span class
              const classMatch = result.substring(i).match(/class="([^"]+)"/);
              if (classMatch) {
                // span class captured if needed in future
              }

              insideSpan = true;

              // Find the end of the span opening tag
              const spanTagEnd = result.indexOf('>', i);
              if (spanTagEnd !== -1) {
                processedResult.push(result.substring(i, spanTagEnd + 1));
                lastIndex = spanTagEnd + 1;
                i = spanTagEnd;
              }
            }
          } else if (result.substring(i, i + 7) === '</span>') {
            // Found end of a span
            if (insideSpan) {
              // Process the content inside the span
              const spanText = result.substring(lastIndex, i);
              processedResult.push(highlightSearchTerms(spanText));
              processedResult.push('</span>');

              insideSpan = false;
              lastIndex = i + 7;
              i = lastIndex - 1;
            }
          }
        }

        // Process any remaining text
        if (lastIndex < result.length) {
          processedResult.push(highlightSearchTerms(result.substring(lastIndex)));
        }

        result = processedResult.join('');
      } catch (e) {
        console.error("Search regex error:", e);
      }
    }

    return { __html: result };
  };


const handlePrevQuestion = () => {
  if (currentQuestionIndex == 0 && currentSectionIndex == 0) {
    return;
  }
  if (currentQuestionIndex > 0) {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  } else {
    const currentSection = safeSections[currentSectionIndex - 1] || { questions: [] };
    setCurrentSectionIndex(currentSectionIndex - 1);
    setCurrentQuestionIndex(currentSection.questions.length - 1);
  }

    // Reset the search term when changing questions
    setSearchTerm("");

};

// Function to go to the next question
const handleNextQuestion = () => {
  if (currentQuestionIndex == currentSection.questions.length - 1 && currentSectionIndex == safeSections.length - 1) {
    return;
  }
  if (currentQuestionIndex < currentSection.questions.length - 1) {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  } else {
    setCurrentSectionIndex(currentSectionIndex + 1);
    setCurrentQuestionIndex(0);
  }
};

const handleUpdateChoice = (choiceIndex: number) => {
  if (!currentQuestion) return;
  const currentEliminated =
    currentQuestion.eliminatedChoices ||
    new Array(currentQuestion.choices.length).fill(false);

  let newEliminated = currentEliminated;
  if (currentEliminated[choiceIndex]) {
    newEliminated = [...currentEliminated];
    newEliminated[choiceIndex] = false;
  }

  const updatedQuestion = {
    ...currentQuestion,
    selectedChoice: choiceIndex,
    revealedIncorrectChoice: undefined,
    eliminatedChoices: newEliminated,
  };

  onUpdate(currentSectionIndex, currentQuestionIndex, updatedQuestion);
};

  const handleSubmitTest = () => {
    let correct = 0;
    let total = 0;

    test.sections.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        total += 1;
        const isCorrect = question.selectedChoice === question.correctChoice && question.correctChoice !== undefined;
        if (isCorrect) correct += 1;

        let newEliminated: boolean[];
        if (question.correctChoice !== undefined) {
          newEliminated = question.choices.map((_, i) => i !== question.correctChoice);
        } else {
          newEliminated = new Array(question.choices.length).fill(true);
        }

        const updatedQuestion = {
          ...question,
          eliminatedChoices: newEliminated,
          revealedIncorrectChoice:
            question.selectedChoice !== undefined && !isCorrect
              ? question.selectedChoice
              : question.revealedIncorrectChoice,
        };

        onUpdate(sectionIndex, questionIndex, updatedQuestion);
      });
    });

    setScore({ correct, total });
    setShowResults(true);
  };

  return (
    <div>
      <div className="tools-container">
        <div style={{display: 'flex'}}>
        <div className="display-home-button">
          <HomeButton onGoHome={onGoHome} />
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search in passage..."
            value={searchTerm}
            onChange={(e) => {
              const val = e.target.value;
              setSearchTerm(val);
              sessionRef.current?.send({ type: 'search', term: val });
            }}
          />
        </div>
        </div>

        <div className="highlight-tools">
          <button
            className={`highlight-btn yellow ${activeHighlighter === 'yellow' ? 'active' : ''}`}
            onClick={() => setActiveHighlighter(activeHighlighter === 'yellow' ? 'none' : 'yellow')}
            title="Yellow Highlighter"
          >
            <span className="highlight-icon yellow-icon">Y</span>
          </button>

          <button
            className={`highlight-btn eraser ${activeHighlighter === 'eraser' ? 'active' : ''}`}
            onClick={() => setActiveHighlighter(activeHighlighter === 'eraser' ? 'none' : 'eraser')}
            title="Eraser"
          >
            <span className="highlight-icon">E</span>
          </button>
        </div>

        <div className="timer-controls">
          <div className="timer">{formatTime(timer)}</div>

          {currentQuestion && (
              <>
              <ShowAnswerButton
                question={currentQuestion}
                onSelectChoice={(choiceIndex) => {
                  if (!currentQuestion) return;
                  const cq = safeSections[currentSectionIndex].questions[currentQuestionIndex];

                  const previousSelection = cq.selectedChoice;
                  const wasIncorrect =
                    previousSelection !== undefined &&
                    previousSelection !== cq.correctChoice;

                  const updatedQuestion = {
                    ...cq,
                    selectedChoice: choiceIndex,
                    revealedIncorrectChoice: wasIncorrect
                      ? previousSelection
                      : currentQuestion.revealedIncorrectChoice,
                  };

                  onUpdate(
                    currentSectionIndex,
                    currentQuestionIndex,
                    updatedQuestion
                  );
                }}
                onSetEliminated={(newEliminated) =>
                  setCurrentQuestionEliminated(newEliminated)
                }
              />
              <button onClick={handleSubmitTest}>
                Submit Test
              </button>
              </>
            )}

          </div>
        </div>

      <div className="main-layout">
        <div className="passage-column">
          <div
            className="passage-box"
            onMouseUp={handlePassageHighlight}
          >
            <p dangerouslySetInnerHTML={renderPassageWithHighlights()}></p>
          </div>
        </div>

        <div className="question-column">
          <Question
            editable={false}
            question={currentQuestion}
            onSelectChoice={handleUpdateChoice}
            onToggleEliminated={(i: number) => toggleEliminatedChoice(currentSectionIndex, currentQuestionIndex, i)}
          />
        </div>
      </div>

      <QuestionNavigation
        test={test}
        currentSectionIndex={currentSectionIndex}
        currentQuestionIndex={currentQuestionIndex}
        onQuestionSelect={(sectionIndex, questionIndex) => {
          setCurrentSectionIndex(sectionIndex);
          setCurrentQuestionIndex(questionIndex);
        }}
      />

      <div className="bottom-navigation">
        <button
          onClick={handlePrevQuestion}
          disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
        >
          <span className="arrow-icon">←</span>
          Back
        </button>
        <button
          onClick={handleNextQuestion}
          disabled={currentSectionIndex === safeSections.length - 1 && currentQuestionIndex === currentSection.questions.length - 1}
        >
          Next
          <span className="arrow-icon">→</span>
        </button>
      </div>

      {showResults && (
        <div className="results-overlay">
          <div className="display-home-button">
            <HomeButton onGoHome={onGoHome} />
          </div>
          <div className="score-text">{`${score.correct}/${score.total}`}</div>
          <button
            className="show-answer-button"
            onClick={() => setShowResults(false)}
          >
            Back to Test
          </button>
        </div>
      )}
    </div>
  );
}
