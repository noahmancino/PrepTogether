import { useState, useRef, useEffect } from "react";
import "./styles/App.css";
import type { AppState, Test, Section, CollaborativeSession, Question } from "./Types.tsx";
import HomeView from "./views/HomeView";
import EditView from "./views/EditView";
import DisplayView from "./views/DisplayView";
import { multipleTestsEditingState } from "./sampleStates.tsx";
import { connectSession, type SessionEvent } from "./session/client";

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    ...multipleTestsEditingState,
  });
  const [sessionEvent, setSessionEvent] = useState<SessionEvent | null>(null);
  const [questionPos, setQuestionPos] = useState({ section: 0, question: 0 });

  const sessionSend = useRef<((event: SessionEvent) => void) | null>(null);
  const registerSessionSend = (sendFn: ((event: SessionEvent) => void) | null) => {
    sessionSend.current = sendFn;
  };
  const sendStateUpdate = (patch: unknown) => {
    if (appState.sessionInfo && sessionSend.current) {
      sessionSend.current({ type: 'state_update', patch });
    }
  };

  const activeTest = appState.activeTestId
    ? appState.tests[appState.activeTestId]
    : null;

  useEffect(() => {
    const info = appState.sessionInfo;
    if (!info) {
      registerSessionSend(null);
      return;
    }
    const conn = connectSession(info.sessionId, info.token, (event) => {
      if (event.type === 'view') {
        setAppState((prev) => ({ ...prev, viewMode: event.view }));
      } else if (event.type === 'question_index') {
        setQuestionPos(event.index);
      } else if (event.type === 'state') {
        setAppState((prev) => ({ ...(event.state as AppState), sessionInfo: prev.sessionInfo }));
        setQuestionPos(event.question_index);
        setSessionEvent(event);
      } else {
        setSessionEvent(event);
      }
    });
    registerSessionSend(conn.send);
    return () => {
      conn.close();
      registerSessionSend(null);
    };
  }, [appState.sessionInfo]);

  const sendViewChange = (view: string) => {
    if (appState.sessionInfo && sessionSend.current) {
      sessionSend.current({ type: 'view', view });
    }
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, updatedQuestion: Question) => {
    if (!activeTest) return;
    const updatedSections = [...activeTest.sections];
    updatedSections[sectionIndex].questions[questionIndex] = updatedQuestion;
    const updatedTests = { ...appState.tests, [activeTest.id]: { ...activeTest, sections: updatedSections } };
    setAppState({ ...appState, tests: updatedTests });
    sendStateUpdate({ op: 'updateQuestion', testId: activeTest.id, sectionIndex, questionIndex, question: updatedQuestion });
  };

  const updateTestName = (testId: string, updatedName: string) => {
    const updatedTests = { ...appState.tests, [testId]: { ...appState.tests[testId], name: updatedName } };
    setAppState({ ...appState, tests: updatedTests });
    sendStateUpdate({ op: 'updateTestName', testId, name: updatedName });
  };

  const updateSection = (index: number, updatedSection: Section) => {
    if (!activeTest) return;
    const updatedSections = [...activeTest.sections];
    updatedSections[index] = updatedSection;
    const updatedTests = { ...appState.tests, [activeTest.id]: { ...activeTest, sections: updatedSections } };
    setAppState({ ...appState, tests: updatedTests });
    sendStateUpdate({ op: 'updateSection', testId: activeTest.id, index, section: updatedSection });
  };

  const updateSections = (sections: Section[]) => {
    if (!activeTest) return;
    const updatedTests = { ...appState.tests, [activeTest.id]: { ...activeTest, sections } };
    setAppState({ ...appState, tests: updatedTests });
    sendStateUpdate({ op: 'updateSections', testId: activeTest.id, sections });
  };

  const createTest = (name: string, type: "RC" | "LR") => {
    const newTestId = String(Date.now());
    const newTest: Test = {
      type,
      id: newTestId,
      name,
      sections: [{ passage: "", questions: [] }],
    };
    const newState: AppState = {
      ...appState,
      tests: { ...appState.tests, [newTestId]: newTest },
      activeTestId: newTestId,
      viewMode: "edit",
    };
    setAppState(newState);
    sendStateUpdate({ op: 'createTest', test: newTest, activeTestId: newTestId });
    sendViewChange('edit');
  };

  const viewTest = (testId: string) => {
    setAppState({ ...appState, activeTestId: testId, viewMode: "display" });
    sendStateUpdate({ op: 'viewTest', testId });
    sendViewChange('display');
  };

  const editTest = (testId: string) => {
    setAppState({ ...appState, activeTestId: testId, viewMode: "edit" });
    sendStateUpdate({ op: 'editTest', testId });
    sendViewChange('edit');
  };

  const deleteTest = (testId: string) => {
    const newTests = { ...appState.tests };
    delete newTests[testId];
    setAppState({ ...appState, tests: newTests });
    sendStateUpdate({ op: 'deleteTest', testId });
  };

  const importTests = (tests: Record<string, Test>) => {
    setAppState({ ...appState, tests: { ...appState.tests, ...tests } });
    sendStateUpdate({ op: 'importTests', tests });
  };

  const setSessionInfo = (info: CollaborativeSession) => {
    setAppState({ ...appState, sessionInfo: info });
    sendStateUpdate({ op: 'setSessionInfo', info });
  };

  const resetTestProgress = (testId: string) => {
    const target = appState.tests[testId];
    if (!target) return;
    const resetSections = target.sections.map((section) => ({
      ...section,
      questions: section.questions.map((q) => ({
        ...q,
        selectedChoice: undefined,
        revealedIncorrectChoice: undefined,
        eliminatedChoices: undefined,
      })),
    }));
    const updatedTests = { ...appState.tests, [testId]: { ...target, sections: resetSections } };
    setAppState({ ...appState, tests: updatedTests });
    sendStateUpdate({ op: 'resetTestProgress', testId });
  };

  const goHome = () => {
    setAppState({ ...appState, viewMode: "home", activeTestId: null });
    sendStateUpdate({ op: 'goHome' });
    sendViewChange('home');
  };

  return (
    <div className="app-container">
      {appState.viewMode === "home" && (
        <HomeView
          appState={appState}
          onCreateTest={createTest}
          onViewTest={viewTest}
          onEditTest={editTest}
          onDeleteTest={deleteTest}
          onImportTests={importTests}
          onSetSessionInfo={setSessionInfo}
        />
      )}

      {appState.viewMode === "display" && activeTest && (
        <DisplayView
          test={activeTest}
          onUpdate={(sectionIndex, questionIndex, updatedQuestion) =>
            updateQuestion(sectionIndex, questionIndex, updatedQuestion as Question)
          }
          sessionInfo={appState.sessionInfo}
          onResetTest={resetTestProgress}
          onGoHome={goHome}
          sessionEvent={sessionEvent}
          questionPos={questionPos}
          onQuestionPosChange={(pos) => {
            setQuestionPos(pos);
            sessionSend.current?.({ type: 'question_index', index: pos });
          }}
          sendSessionEvent={(event) => sessionSend.current?.(event)}
        />
      )}

      {appState.viewMode === "edit" && activeTest && (
        <EditView
          test={activeTest}
          onUpdateSection={updateSection}
          onUpdateSections={updateSections}
          onUpdateTestName={updateTestName}
          onGoHome={goHome}
        />
      )}
    </div>
  );
}

