import AtReferencer from "../referencing/at-referencer.mjs";
import Ruleset from "../ruleset/ruleset.mjs";
import { isDefined, validateOrThrow } from "../util/validation-utility.mjs";
import { CSS_CLASS_NEGATIVE, CSS_CLASS_POSITIVE } from "./dice-pool.mjs";

/**
 * Provides a means to fully resolve roll formulae. 
 * 
 * @property {String} formula A roll formula. 
 * * E. g. `"5D5 + 2"` or `"@SI + 5D3"` or `"@SI D + 3"`
 */
export default class RollFormulaResolver {
  /**
   * Returns a regexp that can be used to identify a die expression, including malformation 
   * and superfluous white-space. 
   * 
   * @readonly
   * @static
   * @type {RegExp}
   */
  static REGEX_DIRTY_DIE = new RegExp("(?<match>(?<dice>\\d+)\\s*(?<d>[dD])\\s*(?<face>\\d*))", "g");

  /**
   * Returns a regexp that can be used to identify a single well-formed die expression. 
   * 
   * @readonly
   * @static
   * @type {RegExp}
   */
  static REGEX_CLEAN_DIE = new RegExp("\\d+[dD]\\d+", "g");

  /**
   * @param {Object} args 
   * @param {String} args.formula A roll formula. 
   * * E. g. `"5D5 + 2"` or `"@SI + 5D3"` or `"@SI D + 3"`
   */
  constructor(args = {}) {
    validateOrThrow(args, ["formula"]);

    this.formula = args.formula + "";
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

    const matches = atFreeFormula.matchAll(RollFormulaResolver.REGEX_DIRTY_DIE);
    let snippets = [];
    let previousMatch = undefined;
    for (const match of matches) {
      const diceFaceCount = match.groups.face.length > 0 ? match.groups.face : "6";
      const composedDiceStatement = `${match.groups.dice}D${diceFaceCount}`;

      if (isDefined(previousMatch)) {
        const snippet = atFreeFormula.substring(previousMatch.index + previousMatch.groups.match.length, match.index).trim();
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
    if (isDefined(previousMatch)) {
      const snippet = atFreeFormula.substring(previousMatch.index + previousMatch.groups.match.length).trim();
      if (snippet.length > 0) {
        snippets.push(snippet);
      }
    } else {
      snippets.push(atFreeFormula);
    }

    return snippets.join(" ");
  }

  /**
   * Resolves and then evaluates the formula and returns the rolled results. 
   * 
   * @returns {EvaluatedRollFormula}
   * 
   * @async
   */
  async evaluate() {
    const resolvedFormula = this.resolve();
    const evaluated = await new Roll(resolvedFormula).evaluate();

    // Determine new terms wherein d6 groups are replaced with positive counts. 
    const terms = [];
    const positiveEvaluationTerms = [];
    for (const term of evaluated.terms) {
      if (isDefined(term.faces) && term.faces == 6) {
        const d6Group = new D6Group({
          values: term.values,
          total: term.total,
        });
        terms.push(d6Group);
        positiveEvaluationTerms.push(d6Group.positives.length);
      } else {
        terms.push(term.total);
        positiveEvaluationTerms.push(term.total);
      }
    }

    const positivesFormula = positiveEvaluationTerms.join("");
    const evalutedWithPositives = await new Roll(positivesFormula).evaluate();

    return new EvaluatedRollFormula({
      formula: resolvedFormula,
      terms: terms,
      rawTotal: evaluated.total,
      positiveTotal: evalutedWithPositives.total,
    });
  }
}

/**
 * Represents a group of rolled D6. 
 * 
 * @property {Array<Number>} values 
 * @property {Number} total 
 * @property {Array<Number>} positives 
 * @property {Array<Number>} negatives 
 */
export class D6Group {
  /**
   * @param {Object} args 
   * @param {Array<Number>} args.values 
   * @param {Number} args.total 
   */
  constructor(args = {}) {
    this.values = args.values;
    this.total = args.total;
    
    const ruleset = new Ruleset();
    this.positives = args.values.filter(it => ruleset.isPositive(it));
    this.negatives = args.values.filter(it => ruleset.isNegative(it));
  }
}

export class EvaluatedRollFormula {
  /**
   * @param {Object} args 
   * @param {String} args.formula The formula. 
   * * E. g. `"2D6 + 3 + 4D6"`
   * @param {String | D6Group} args.terms The expression terms, in order. 
   * @param {Number} args.rawTotal The raw total of all rolled dice, without 
   * regard for positives or negatives. 
   * * E. g. `[2, 5] + 3 + [1, 6, 2, 3] = 22`
   * @param {Number} args.positiveTotal The total when only taking the number of 
   * positives into account. 
   * * E. g. `[2, 5] + 3 + [1, 6, 2, 3] = 5`
   */
  constructor(args = {}) {
    this.formula = args.formula;
    this.terms = args.terms;
    this.rawTotal = args.rawTotal;
    this.positiveTotal = args.positiveTotal;
  }

  /**
   * @returns {String} 
   * 
   * @async
   */
  async renderForDisplay() {
    let result = '<div class="flex flex-row flex-middle flex-wrap">';
    
    for (const term of this.terms) {
      if (isDefined(term.positives)) {
        // It's a d6 group. 
        let diceRolls = "";
        for (const positive of term.positives) {
          diceRolls = `${diceRolls}<li class="roll die d6 ${CSS_CLASS_POSITIVE}">${positive}</li>`
        }
        for (const negative of term.negatives) {
          diceRolls = `${diceRolls}<li class="roll die d6 ${CSS_CLASS_NEGATIVE}">${negative}</li>`
        }
        result = `${result}<ol class="dice-rolls">${diceRolls}</ol>`;

      } else {
        result = `${result}${term}`;
      }
    }

    return `${result}</div>`;
  }
}
