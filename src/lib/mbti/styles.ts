// MBTI type -> Executive Decision-Making Style lookup (grading spec §6.3)
export const DECISION_STYLES: Record<string, { style: string; description: string }> = {
  ENTJ: { style: "The Commander", description: "Strategic, decisive macro-planner; systemic efficiency, aggressive execution" },
  ESTJ: { style: "The Executive", description: "Operational; rules, factual data, bottom-line efficiency" },
  INTJ: { style: "The Architect", description: "Long-range strategist; objective, vision-focused, low emotional noise" },
  ISTJ: { style: "The Logistician", description: "Risk-averse; audits past data/evidence before systematic implementation" },
  ENTP: { style: "The Innovator", description: "Idea-driven strategist; challenges status quo, comfortable with ambiguity" },
  ENFJ: { style: "The Mobilizer", description: "People-centered strategic leader; drives change through influence/vision" },
  ESTP: { style: "The Dealmaker", description: "Fast, pragmatic, action-first; thrives on immediate results and risk" },
  ESFJ: { style: "The Coordinator", description: "Operational leader prioritizing team harmony, process, stakeholder buy-in" },
  INFJ: { style: "The Visionary", description: "Long-range idealist; values-driven strategic planning" },
  INFP: { style: "The Advocate", description: "Values-driven, low structure preference; decisions filtered through ethics/meaning" },
  INTP: { style: "The Analyst", description: "Abstract, systems-focused; prioritizes logical consistency over speed" },
  ISFJ: { style: "The Steward", description: "Detail-oriented, loyal to established process; protects continuity" },
  ISFP: { style: "The Adapter", description: "Flexible, values-driven, low structure preference; decides case-by-case" },
  ESFP: { style: "The Motivator", description: "High-energy, people-first, present-focused; decides through engagement" },
  ENFP: { style: "The Catalyst", description: "Enthusiastic, possibility-driven; sparks initiatives, delegates follow-through" },
  ISTP: { style: "The Troubleshooter", description: "Hands-on, data-driven problem solver; decides via direct observation/testing" },
};

export function getDecisionStyle(mbtiType: string): { style: string; description: string } {
  const entry = DECISION_STYLES[mbtiType];
  if (!entry) throw new Error(`Unknown MBTI type: ${mbtiType}`);
  return entry;
}