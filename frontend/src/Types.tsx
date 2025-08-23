export type AppState = {
  tests: Record<string, Test>;
  activeTestId: string | null;
  viewMode: "home" | "edit" | "display";
  sessionInfo: CollaborativeSession | null;
};

export type Question = {
  stem: string;
  choices: string[];
  selectedChoice?: number;
  correctChoice?: number;
  revealedIncorrectChoice?: number;
  eliminatedChoices?: boolean[];
};

export type Section = {
  passage: string;
  questions: Question[];
};

export type CollaborativeSession = {
  sessionId: string;
  /** Token returned from backend for websocket authentication */
  token: string;
  role: "tutor" | "student";
  connectedUsers: string[];
  lastSynced: number;
  sharedTestId: string;
  /** Optional state used when the user is not the host */
  sessionState?: any;
};

export type Test = {
  id: string;
  name: string;
  sections: Section[];
  type: "RC" | "LR";
};
