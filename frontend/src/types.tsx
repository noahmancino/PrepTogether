export type Question = {
  stem: string;
  choices: string[];
  selectedChoice?: number;
};

export type Session = {
  passage: string;
  questions: Question[];
};
