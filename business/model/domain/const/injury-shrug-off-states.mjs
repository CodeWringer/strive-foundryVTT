/**
 * Represents all possible states of an injury shrug off slot. 
 */
export const INJURY_SHRUG_OFF_STATES = {
  /** No shrug-off has been rolled, yet. */
  INDETERMINATE: 0,
  /** The shrug-off roll failed. */
  FAILED: 1,
  /** The shrug-off roll succeeded. */
  SUCCEEDED: 2,
}
