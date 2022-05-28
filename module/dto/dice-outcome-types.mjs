/**
 * Represents the kinds of outcome possible for a dice pool roll result. 
 */
export const DiceOutcomeTypes = {
  /**
   * There is no actual outcome. 
   * 
   * This is the case for Ob 0 tests, which commonly serve as a means to provide the Ob for an opposed test. 
   */
  NONE: "NONE",
  /**
   * The test was a complete success. 
   */
  SUCCESS: "SUCCESS",
  /**
   * The test was a complete failure. 
   */
  FAILURE: "FAILURE",
  /**
   * The test was a partial failure. Not enough for a success, but not as bad as a complete failure. 
   */
  PARTIAL: "PARTIAL",
}
