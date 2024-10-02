import Expertise from "../../../business/document/item/skill/expertise.mjs";
import TransientSkill from "../../../business/document/item/skill/transient-skill.mjs";
import AtReferencer from "../../../business/referencing/at-referencer.mjs";
import DamageAndType from "../../../business/ruleset/skill/damage-and-type.mjs";
import { isDefined } from "../../../business/util/validation-utility.mjs";

/**
 * Represents a skill or Expertise which has at least one damage formula defined. 
 * 
 * @property {String} name Name of the skill or Expertise. 
 * @property {String} id ID of the skill or Expertise. 
 * @property {Array<DamageAndType>} damage A list of raw damage formulae. 
 * These formulae may contain variables that may need to be manually fed some 
 * values. 
 * E. g. `["6D + @strength", "5 - @SI"]`
 * @property {TransientSkill | Expertise | undefined} document 
 */
export class DamageFinding {
  /**
   * Returns a regex to dissect a `"xDy"` or `"xdy"` string, e. g. `"3D6"` or 
   * `"3d6"`. 
   * 
   * @static
   * @type {RegExp}
   * @readonly
   */
  static get RGX_DICE() { return new RegExp(/(?<count>\d+)\s*(?<d>[dD])(?<faces>\d*)/g); }

  /**
   * @param {Object} args 
   * @param {String} args.name Name of the skill or Expertise. 
   * @param {String} args.id ID of the skill or Expertise. 
   * @param {Array<DamageAndType>} args.damage A list of raw damage formulae. 
   * These formulae may contain variables that may need to be manually fed some 
   * values. 
   * E. g. `["6D + @strength", "5 - @SI"]`
   * @param {TransientSkill | Expertise | undefined} args.document 
   */
  constructor(args = {}) {
    this.name = args.name;
    this.id = args.id;

    this.damage = args.damage;
    this.document = args.document;
  }

  /**
   * Returns the concatenated formulae. 
   * 
   * @returns {String} 
   */
  getJoinedFormulae() {
    return this.damage.map(it =>
      it.damage
    ).join(" + ");
  }

  /**
   * Returns the concatenated and localized formulae, for display. 
   * 
   * @returns {String} 
   */
  getJoinedFormulaeForDisplay() {
    return this.damage.map(it =>
      `${it.damage} ${game.i18n.localize(it.damageType.localizableName)}`
    ).join(" + ");
  }

  /**
   * Resolves and evaluates the formula
   * 
   * @returns {Array<EvaluatedDamage>}
   */
  evaluate() {
    const result = [];

    // May contain variables. E. g. `"1D8 + @strength + @SI"`
    const formula = this.getJoinedFormulae();
    // Will, in the end, no longer contain any variables. E. g. `"1 + 5 + 0"`
    let resolvedFormula = formula;

    if (isDefined(this.document)) {
      // Resolve variables using the document. 
      const resolvedReferences = new AtReferencer().resolveReferences(formula, this.document);
      for (const key of resolvedReferences.keys()) {
        const replacementObject = resolvedReferences.get(key);

        if (isDefined(replacementObject)) {
          const replacementValue = (replacementObject.modifiedLevel ?? replacementObject.value) ?? replacementObject;
          resolvedFormula = resolvedFormula.replace(new RegExp(key, "g"), replacementValue);
        }
      }
    }

    // The next step is to ensure any as yet unresolved variables receive a value, 
    // if there are any. 
    const references = new AtReferencer().getReferencesIn(resolvedFormula);
    if (references.length > 0) {
      // Resolve variables by inserting values. 
      for (let replacementValue = 0; replacementValue <= 10; replacementValue++) {
        let resolvedFormulaIterated = resolvedFormula;
        references.forEach(reference => {
          // Iteratively, this will replace variables. E. g.:
          // `"1D8 + @strength + @SI"` -> `"1D8 + 0 + @SI"`
          // `"1D8 + 0 + @SI"` -> `"1D8 + 0 + 0"`
          resolvedFormulaIterated = resolvedFormulaIterated.replace(new RegExp(reference, "g"), replacementValue);
        });

        // All variables have been resolved. All that is left is to insert values 
        // for the dice. 
        result.push(
          this._replaceDiceAndEvaluate(resolvedFormulaIterated),
        );
      }
    } else {
      // All variables have been resolved. All that is left is to insert values 
      // for the dice. 
      result.push(
        this._replaceDiceAndEvaluate(resolvedFormula),
      );
    }

    return result;
  }

  /**
   * Replaces all dice-type variables from the given formula, based on the given 
   * replacement type and returns the resulting formula. 
   * 
   * For example, with `replacementType = DICE_REPLACEMENT_TYPES.MIN`, for 
   * `"1D8 + 3D4"`, would return `"1 + 3"`. 
   * 
   * @param {String} formula 
   * @param {DICE_REPLACEMENT_TYPES} replacementType 
   * 
   * @returns {String}
   * 
   * @private
   */
  _replaceDice(formula, replacementType) {
    const matches = formula.matchAll(DamageFinding.RGX_DICE);

    let formulaWithoutDice = "";
    let lastIndex = 0;
    for (const match of matches) {
      let n = 0;
      if (replacementType === DICE_REPLACEMENT_TYPES.MIN) {
        n = parseInt(match.groups.count);
      } else if (replacementType === DICE_REPLACEMENT_TYPES.MEAN) {
        n = parseInt(match.groups.count) * (parseInt(match.groups.faces) / 2);
      } else if (replacementType === DICE_REPLACEMENT_TYPES.MAX) {
        n = parseInt(match.groups.count) * parseInt(match.groups.faces);
      }

      formulaWithoutDice = `${formulaWithoutDice}${formula.substring(lastIndex, match.index)}${n}`;
      lastIndex = match.index + match[0].length;
    }
    return `${formulaWithoutDice}${formula.substring(lastIndex)}`;
  }

  /**
   * Attempts to evaluate the given formula and if possible, returns the number 
   * that results from it. 
   * 
   * @param {String} formula 
   * 
   * @returns {Number | String}
   * 
   * @private
   */
  _tryEvaluate(formula) {
    try {
      return eval(formula);
    } catch (error) {
      console.log(error);
      return "";
    }
  }
  
  /**
   * Evaluates the given formula and returns the result. 
   * 
   * @param {String} formula 
   * 
   * @returns {EvaluatedDamage}
   * 
   * @private
   */
  _replaceDiceAndEvaluate(formula) {
    const minFormula = this._replaceDice(formula, DICE_REPLACEMENT_TYPES.MIN);
    const meanFormula = this._replaceDice(formula, DICE_REPLACEMENT_TYPES.MEAN);
    const maxFormula = this._replaceDice(formula, DICE_REPLACEMENT_TYPES.MAX);

    const min = this._tryEvaluate(minFormula);
    const mean = this._tryEvaluate(meanFormula);
    const max = this._tryEvaluate(maxFormula);
    
    return new EvaluatedDamage({
      formula: formula,
      min: min,
      mean: mean,
      max: max,
      hasVariableDamage: (min != mean && min != max && mean != max),
    });
  }
}

/**
 * @constant
 * @private
 */
const DICE_REPLACEMENT_TYPES = {
  MIN: "MIN",
  MEAN: "MEAN",
  MAX: "MAX",
}

/**
 * @property {String} formula 
 * @property {Number} min 
 * @property {Number} mean 
 * @property {Number} max 
 * @property {Boolean} hasVariableDamage If `true`, then the damage formula contains 
 * at least one variable. E. g. `"1D8"` or `@SI D6` 
 */
export class EvaluatedDamage {
  /**
   * @param {Object} args 
   * @param {String} args.formula 
   * @param {Number} args.min 
   * @param {Number} args.mean 
   * @param {Number} args.max 
   * @param {Boolean} args.hasVariableDamage If `true`, then the damage formula contains 
   * at least one variable. E. g. `"1D8"` or `@SI D6` 
   */
  constructor(args = {}) {
    this.formula = args.formula;
    this.min = args.min;
    this.mean = args.mean;
    this.max = args.max;
    this.hasVariableDamage = args.hasVariableDamage;
  }
}
