import type { Dichotomy } from "./questions";
import { getDecisionStyle } from "./styles";

// Pure, side-effect-free scoring engine (grading spec §6.2).
// Answers: Map of question id -> Likert score in [-3..+3].
// "Agree" points toward the FIRST letter of each dichotomy; no reverse-scoring.

export type TraitScores = Record<Dichotomy, number>;
export type ClarityScores = Record<Dichotomy, number>;

export interface ScoringOutput {
  trait_scores: TraitScores;
  mbti_type: string;
  decision_style: string;
  decision_style_description: string;
  clarity_scores: ClarityScores;
  letters: {
    socialRatingScore: "E" | "I";
    visionRatingScore: "S" | "N";
    decisionRatingScore: "T" | "F";
    lifestyleRatingScore: "P" | "J";
  };
}

const MAX_TOTAL = 9; // 3 questions x 3 points

/** Sum one dichotomy's three question scores. Range: -9..+9. */
export function sumTrait(scores: number[]): number {
  if (scores.length !== 3) throw new Error("Each dichotomy must have exactly 3 question scores");
  return scores.reduce((a, b) => a + b, 0);
}

/** clarity(trait) = abs(trait_total) / 9, rounded to 2 decimals for display. */
export function clarity(total: number): number {
  return Math.round((Math.abs(total) / MAX_TOTAL) * 100) / 100;
}

/**
 * Score a complete 12-question response set.
 * @param answers object: { "E_I": [q1,q2,q3], "S_N": [...], "T_F": [...], "J_P": [...] }
 */
export function scoreMbti(answers: Record<Dichotomy, number[]>): ScoringOutput {
  const trait_scores: TraitScores = {
    E_I: sumTrait(answers.E_I),
    S_N: sumTrait(answers.S_N),
    T_F: sumTrait(answers.T_F),
    J_P: sumTrait(answers.J_P),
  };

  // Tie (0) defaults to the FIRST letter of each dichotomy.
  const social = trait_scores.E_I >= 0 ? "E" : "I";
  const vision = trait_scores.S_N >= 0 ? "S" : "N";
  const decision = trait_scores.T_F >= 0 ? "T" : "F";
  const lifestyle = trait_scores.J_P >= 0 ? "J" : "P";

  const mbti_type = `${social}${vision}${decision}${lifestyle}`;
  const styleEntry = getDecisionStyle(mbti_type);

  const clarity_scores: ClarityScores = {
    E_I: clarity(trait_scores.E_I),
    S_N: clarity(trait_scores.S_N),
    T_F: clarity(trait_scores.T_F),
    J_P: clarity(trait_scores.J_P),
  };

  return {
    trait_scores,
    mbti_type,
    decision_style: styleEntry.style,
    decision_style_description: styleEntry.description,
    clarity_scores,
    letters: {
      socialRatingScore: social as "E" | "I",
      visionRatingScore: vision as "S" | "N",
      decisionRatingScore: decision as "T" | "F",
      lifestyleRatingScore: lifestyle as "P" | "J",
    },
  };
}