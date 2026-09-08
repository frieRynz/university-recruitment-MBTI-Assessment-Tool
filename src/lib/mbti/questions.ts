// MBTI question bank — 12 questions, 7-point Likert scale.
// All questions scored so "agree" points toward the FIRST letter of their dichotomy.

export type Dichotomy = "E_I" | "S_N" | "T_F" | "J_P";

export interface MbtiQuestion {
  id: number;
  dichotomy: Dichotomy;
  text: string;
}

export const LIKERT_OPTIONS: { value: number; label: string }[] = [
  { value: 3, label: "Strongly agree" },
  { value: 2, label: "Agree" },
  { value: 1, label: "Slightly agree" },
  { value: 0, label: "Neutral" },
  { value: -1, label: "Slightly disagree" },
  { value: -2, label: "Disagree" },
  { value: -3, label: "Strongly disagree" },
];

export const QUESTIONS: MbtiQuestion[] = [
  // E-I (Social)
  { id: 1, dichotomy: "E_I", text: "At a party you interact with many, including strangers." },
  { id: 2, dichotomy: "E_I", text: "You are more inclined to be easy to approach." },
  { id: 3, dichotomy: "E_I", text: "At parties you stay late, with increasing energy." },
  // S-N (Vision)
  { id: 4, dichotomy: "S_N", text: "You are more realistic than speculative." },
  { id: 5, dichotomy: "S_N", text: "You prize more in yourself a strong sense of reality than vivid imagination." },
  { id: 6, dichotomy: "S_N", text: "You are more interested in production and distribution than design and research." },
  // T-F (Decision)
  { id: 7, dichotomy: "T_F", text: "You are more impressed by principles than emotion." },
  { id: 8, dichotomy: "T_F", text: "In making decisions you feel more comfortable with standards." },
  { id: 9, dichotomy: "T_F", text: "You want to be complimented for one clear reason." },
  // J-P (Lifestyle)
  { id: 10, dichotomy: "J_P", text: "You want things settled and decided." },
  { id: 11, dichotomy: "J_P", text: "You tend to be more deliberate than spontaneous." },
  { id: 12, dichotomy: "J_P", text: "You prefer to work to fix a schedule." },
];