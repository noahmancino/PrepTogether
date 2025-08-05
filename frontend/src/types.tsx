export type AppState = {
  tests: Record<string, Test>
}

export type Question = {
  stem: string;
  choices: string[];
  selectedChoice?: number;
};

export type Section = {
  passage: string;
  questions: Question[];
};

export type CollaborativeSession = {
  sessionId: string;
  role: "tutor" | "student";
  connectedUsers: string[];
  lastSynced: number;
  sharedTestId: string;
};

export type Test = {
  id: string;
  name: string;
  sections: Section[];
  // eventually: lrSections, lgSections
};
