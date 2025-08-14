import React, { useState, useEffect } from "react";
import Question from "../components/Questions.tsx";
import "../styles/App.css";
import "../styles/DisplayView.css"

type HighlightType = "yellow" | "eraser" | "none";

type Props = {
  sections: {
    passage: string;
    questions: {
      stem: string;
      choices: string[];
      selectedChoice?: number;
      sectionIndex: number;
      questionIndex: number;
    }[];
  }[];
  onUpdate: (
    sectionIndex: number,
    questionIndex: number,
    updatedQuestion: any
  ) => void;
};

export default function DisplayView({ sections, onUpdate }: Props) {
  // Track current question across all sections
  const [currentGlobalQuestionIndex, setCurrentGlobalQuestionIndex] = useState(0);


  // Timer state
  const [timer, setTimer] = useState(0);

  // Highlighter state
  const [activeHighlighter, setActiveHighlighter] = useState<HighlightType>("none");

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Create a flat array of all questions for easier navigation
  const allQuestions = sections.flatMap(section => section.questions);

  // Get the current question and its section
  const currentQuestion = allQuestions[currentGlobalQuestionIndex];
  const currentSectionIndex = currentQuestion?.sectionIndex || 0;

  // Timer effect - start when component mounts
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

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
  type: 'yellow'; // Changed from 'yellow' | 'blue'
}[]>([]);

// TODO: fix bug where partially highlighted words don't get a search highlight
const handlePassageHighlight = () => {
  if (activeHighlighter === "none") return;

  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return;

  const selectionText = selection.toString().trim();
  if (!selectionText) return;

  // Get the original passage text
  const passageText = sections[currentSectionIndex].passage;

  // Find the selected text in the passage
  let selStartOffset = passageText.indexOf(selectionText);
  let selEndOffset = selStartOffset + selectionText.length;

  // If we can't find the exact text, return without highlighting
  if (selStartOffset === -1) {
    console.warn("Could not find selected text in passage");
    return;
  }

  if (activeHighlighter === "eraser") {
    // Process each highlight that overlaps with the selection
    setPassageHighlights(prevHighlights => {
      const newHighlights = [];

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
          continue;
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
      setPassageHighlights([
        ...nonOverlapping,
        {
          id: `highlight-${Date.now()}`,
          startIndex: minStart,
          endIndex: maxEnd,
          type: 'yellow'
        }
      ]);
    } else {
      // No overlaps, just add the new highlight
      setPassageHighlights([
        ...passageHighlights,
        {
          id: `highlight-${Date.now()}`,
          startIndex: selStartOffset,
          endIndex: selEndOffset,
          type: 'yellow'
        }
      ]);
    }
  }

  // Clear the selection
  window.getSelection()?.removeAllRanges();
};

// Fix the renderPassageWithHighlights function to properly handle search terms within highlights
const renderPassageWithHighlights = () => {
  let passage = sections[currentSectionIndex].passage;

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
      let spanContent = '';
      let spanClass = '';

      // Helper function to apply search highlighting to a text segment
      const highlightSearchTerms = (text) => {
        return text.replace(searchRegex, match =>
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
              spanClass = classMatch[1];
            }

            insideSpan = true;
            spanContent = '';

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
  if (currentGlobalQuestionIndex > 0) {
    setCurrentGlobalQuestionIndex(currentGlobalQuestionIndex - 1);

    // Reset the search term when changing questions
    setSearchTerm("");

    // Optionally, you may want to save any in-progress work on the current question
    // before navigating away - add that logic here if needed
  }
};

// Function to go to the next question
const handleNextQuestion = () => {
  if (currentGlobalQuestionIndex < allQuestions.length - 1) {
    setCurrentGlobalQuestionIndex(currentGlobalQuestionIndex + 1);

    // Reset the search term when changing questions
    setSearchTerm("");

    // Optionally, you may want to save any in-progress work on the current question
    // before navigating away - add that logic here if needed
  }
};



  // Handle updating the question when a choice is selected
  const handleUpdateChoice = (choiceIndex: number) => {
    const questionMeta = allQuestions[currentGlobalQuestionIndex];
    const updatedQuestion = { ...questionMeta, selectedChoice: choiceIndex };
    onUpdate(questionMeta.sectionIndex, questionMeta.questionIndex, updatedQuestion);
  };

  if (!sections || sections.length === 0) {
    return <div className="error-message">No sections available.</div>;
  }

  if (!allQuestions || allQuestions.length === 0) {
    return <div className="error-message">No questions available.</div>;
  }

  return (
    <div>
      {/* Toolbar - with functionality restricted to passage */}
      <div className="tools-container">
        {/* Search Bar - only searches in passage */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search in passage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Highlighter Tools - only for passage */}
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

        {/* Timer */}
        <div className="timer">
          {formatTime(timer)}
        </div>
      </div>

      {/* Original layout - kept intact */}
      <div className="main-layout">
        {/* Passage Section with highlighting capabilities */}
        <div className="passage-column">
          <div
            className="passage-box"
            onMouseUp={handlePassageHighlight}
          >
            <p dangerouslySetInnerHTML={renderPassageWithHighlights()}></p>
          </div>
        </div>

        {/* Questions Section - completely unchanged */}
        <div className="question-column">
          <Question
            editable={false}
            question={currentQuestion}
            onSelectChoice={handleUpdateChoice}
          />
        </div>
      </div>

      <div className="question-nav">
        {allQuestions.map((question, i, arr) => (
          <React.Fragment key={i}>
            <button
              className={`question-bubble ${i === currentGlobalQuestionIndex ? "active" : ""}`}
              onClick={() => setCurrentGlobalQuestionIndex(i)}
            >
              {i + 1}
            </button>
            {/* Add section divider if next question is from a different section */}
            {i < arr.length - 1 && question.sectionIndex !== arr[i + 1].sectionIndex && (
              <span className="section-divider">|</span>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bottom-navigation">
        <button
          onClick={handlePrevQuestion}
          disabled={currentGlobalQuestionIndex === 0}
        >
          <span className="arrow-icon">←</span>
          Back
        </button>
        <button
          onClick={handleNextQuestion}
          disabled={currentGlobalQuestionIndex === allQuestions.length - 1}
        >
          Next
          <span className="arrow-icon">→</span>
        </button>
      </div>

    </div>
  );
}
