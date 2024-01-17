import AtReferencer from "../referencing/at-referencer.mjs";
import { isDefined, validateOrThrow } from "../util/validation-utility.mjs";

/**
 * Provides a means to fully resolve roll formulae. 
 * 
 * @property {String} formula A roll formula. 
 * * E. g. `"5D5 + 2"` or `"@SI + 5D3"` or `"@SI D + 3"`
 */
export default class RollFormulaResolver {
  /**
   * Returns a regexp that can be used to identify the white space between the letter "d" 
   * and following numbers. 
   * 
   * @readonly
   * @static
   * @type {RegExp}
   */
  static REGEX_DIE_WHITE_SPACE = new RegExp("(?<dice>\\d+)\\s*(?<d>[dD])\\s*(?<face>\\d*)", "g");

  /**
   * @param {Object} args 
   * @param {String} args.formula A roll formula. 
   * * E. g. `"5D5 + 2"` or `"@SI + 5D3"` or `"@SI D + 3"`
   */
  constructor(args = {}) {
    validateOrThrow(args, ["formula"]);

    this.formula = args.formula;
  }

  /**
   * Resolves the formula, to a format FoundryVTT's dice roller can evaluate 
   * and returns it. 
   * 
   * All `@`-references will be replaced with `"0"`, so make sure to resolve 
   * references beforehand! 
   * 
   * @returns {String} The resolved formula. 
   * * E. g. `"@SI D + 3"` -> `"0D6 + 3"`
   * or `"2d - 1"` -> `"2D6 - 1"`
   */
  resolve() {
    const atReferences = new AtReferencer().getReferencesIn(this.formula);
    let atFreeFormula = this.formula;

    for (const atReference of atReferences) {
      atFreeFormula = atFreeFormula.replace(atReference, "0");
    }

    const matches = atFreeFormula.matchAll(RollFormulaResolver.REGEX_DIE_WHITE_SPACE);
    let snippets = [];
    let previousMatch = undefined;
    for (const match of matches) {
      const diceFaceCount = match.groups.face.length > 0 ? match.groups.face : "6";
      const composedDiceStatement = `${match.groups.dice}${match.groups.d}${diceFaceCount}`;

      if (isDefined(previousMatch)) {
        const snippet = atFreeFormula.substring(previousMatch.index + previousMatch.length, match.index).trim();
        if (snippet.length > 0) {
          snippets.push(snippet);
        }
      } else {
        const snippet = atFreeFormula.substring(0, match.index).trim();
        if (snippet.length > 0) {
          snippets.push(snippet);
        }
      }
      snippets.push(composedDiceStatement);

      previousMatch = match;
    }
    const snippet = atFreeFormula.substring(previousMatch.index + previousMatch.length).trim();
    if (snippet.length > 0) {
      snippets.push(snippet);
    }

    return snippets.join(" ");
  }
}
