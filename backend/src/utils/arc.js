export const ARC_CONFIG = {
  SHORT:  { maxTurns: 6  },
  MEDIUM: { maxTurns: 12 },
  EPIC:   { maxTurns: 20 },
};

export const VOTE_THRESHOLD = 0.6;

/**
 * Derive stage boundaries for a given maxTurns value.
 * Returns { SETUP, RISING, CLIMAX, RESOLUTION } where each value
 * is the LAST turn number belonging to that stage (1-indexed).
 */
export function getStageBoundaries(maxTurns) {
  const setup      = Math.round(maxTurns * 0.25);
  const rising     = Math.round(maxTurns * 0.65);
  const climax     = Math.round(maxTurns * 0.85); 
  const resolution = maxTurns;                    

  return { SETUP: setup, RISING: rising, CLIMAX: climax, RESOLUTION: resolution };
}

/**
 * Derive the current arc stage from a turn count.
 * turnCount is 1-indexed (the turn that was just written).
 */
export function deriveStage(turnCount, maxTurns) {
  const b = getStageBoundaries(maxTurns);
  if (turnCount <= b.SETUP)  return "SETUP";
  if (turnCount <= b.RISING) return "RISING";
  if (turnCount <= b.CLIMAX) return "CLIMAX";
  return "RESOLUTION";
}

/**
 * Derive maxTurns from the ArcSize enum value.
 */
export function getMaxTurns(arcSize) {
  return ARC_CONFIG[arcSize]?.maxTurns ?? ARC_CONFIG.SHORT.maxTurns;
}