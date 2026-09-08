import { describe, it, expect } from "vitest";
import { scoreMbti, sumTrait, clarity } from "@/lib/mbti/scoring";
import { QUESTIONS } from "@/lib/mbti/questions";
import { DECISION_STYLES } from "@/lib/mbti/styles";

// Grading spec §6.4 worked example — must match EXACTLY.
describe("MBTI scoring engine", () => {
  it("produces the worked-example output", () => {
    // Input: E-I=[+3,+2,+2], S-N=[+1,+2,+1], T-F=[0,+1,0], J-P=[-3,-2,-2]
    const result = scoreMbti({
      E_I: [3, 2, 2],
      S_N: [1, 2, 1],
      T_F: [0, 1, 0],
      J_P: [-3, -2, -2],
    });

    expect(result.trait_scores).toEqual({ E_I: 7, S_N: 4, T_F: 1, J_P: -7 });
    expect(result.mbti_type).toBe("ESTP");
    expect(result.decision_style).toBe("The Dealmaker");
    expect(result.clarity_scores).toEqual({ E_I: 0.78, S_N: 0.44, T_F: 0.11, J_P: 0.78 });
    expect(result.letters).toEqual({
      socialRatingScore: "E",
      visionRatingScore: "S",
      decisionRatingScore: "T",
      lifestyleRatingScore: "P",
    });
  });

  it("defaults ties (0) to the first letter of each dichotomy", () => {
    const result = scoreMbti({ E_I: [0, 0, 0], S_N: [0, 0, 0], T_F: [0, 0, 0], J_P: [0, 0, 0] });
    expect(result.mbti_type).toBe("ESTJ");
    expect(result.clarity_scores).toEqual({ E_I: 0, S_N: 0, T_F: 0, J_P: 0 });
  });

  it("handles extreme disagreement toward second letters", () => {
    const result = scoreMbti({ E_I: [-3, -3, -3], S_N: [-3, -3, -3], T_F: [-3, -3, -3], J_P: [-3, -3, -3] });
    expect(result.mbti_type).toBe("INFP");
    expect(result.decision_style).toBe("The Advocate");
    expect(result.clarity_scores).toEqual({ E_I: 1, S_N: 1, T_F: 1, J_P: 1 });
  });

  it("rejects wrong-length inputs", () => {
    expect(() => scoreMbti({ E_I: [1, 1], S_N: [0, 0, 0], T_F: [0, 0, 0], J_P: [0, 0, 0] })).toThrow();
  });

  it("sums traits within -9..+9", () => {
    expect(sumTrait([3, 3, 3])).toBe(9);
    expect(sumTrait([-3, -3, -3])).toBe(-9);
  });

  it("computes clarity in 0..1", () => {
    expect(clarity(0)).toBe(0);
    expect(clarity(9)).toBe(1);
    expect(clarity(1)).toBe(0.11);
    expect(clarity(4)).toBe(0.44);
  });

  it("has exactly 12 questions, 3 per dichotomy", () => {
    expect(QUESTIONS.length).toBe(12);
    for (const d of ["E_I", "S_N", "T_F", "J_P"] as const) {
      expect(QUESTIONS.filter((q) => q.dichotomy === d).length).toBe(3);
    }
  });

  it("has all 16 styles defined", () => {
    expect(Object.keys(DECISION_STYLES).length).toBe(16);
  });
});