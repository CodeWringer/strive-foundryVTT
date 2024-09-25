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
 * @property {String} sourceCollectionId ID of the containing collection. 
 * @property {Array<DamageAndType>} damage A list of raw damage formulae. 
 * These formulae may contain variables that may need to be manually fed some 
 * values. 
 * E. g. `["6D + @strength", "5 - @SI"]`
 * @property {Array<DamageFinding>} expertises A list only of all embedded Expertises 
 * that have at least one damage formula defined. Will not contain Expertises that 
 * have no damage formula. 
 * @property {TransientSkill | Expertise | undefined} document 
 */
export class DamageFinding {
  /**
   * Returns a regex to dissect a `"xDy"` or `"xdy"` string, e. g. `"3D6"` or 
   * `"3d6"`. 
   * 
   * @type {RegExp}
   * @readonly
   */
  get rgxDice() { return new RegExp(/(?<count>\d+)(?<d>[dD])(?<faces>\d*)/g); }

  /**
   * @param {Object} args 
   * @param {String} args.name Name of the skill or Expertise. 
   * @param {String} args.id ID of the skill or Expertise. 
   * @param {String} args.sourceCollectionId ID of the containing collection. 
   * @param {Array<DamageAndType>} args.damage A list of raw damage formulae. 
   * These formulae may contain variables that may need to be manually fed some 
   * values. 
   * E. g. `["6D + @strength", "5 - @SI"]`
   * @param {Array<DamageFinding>} args.expertises A list only of all embedded Expertises 
   * that have at least one damage formula defined. Will not contain Expertises that 
   * have no damage formula. 
   * @param {TransientSkill | Expertise | undefined} args.document 
   */
  constructor(args = {}) {
    this.name = args.name;
    this.id = args.id;

    this.sourceCollectionId = args.sourceCollectionId;
    
    this.damage = args.damage;
    this.expertises = args.expertises;
    this.document = args.document;
  }

  /**
   * Returns the concatenated and localized formula, for display. 
   * 
   * @returns {String} 
   */
  getFullFormula() {
    return this.damage.map(it => 
      it.damage
    ).join(" + ");
  }

  /**
   * Returns the concatenated and localized formula, for display. 
   * 
   * @returns {String} 
   */
  getFullFormulaForDisplay() {
    return this.damage.map(it => 
      `${it.damage} ${game.i18n.localize(it.damageType.localizableName)}`
    ).join(" + ");
  }

  /**
   * 
   * @returns {String}
   */
  getFullResolvedFormula() {
    let fullFormula = this.getFullFormula();

    if (isDefined(this.document)) {
      const resolvedReferences = new AtReferencer().resolveReferences(fullFormula, this.document);
      for (const key of resolvedReferences.keys()) {
        const replacementObject = resolvedReferences.get(key);
        let replacementValue = 0;

        if (isDefined(replacementObject)) {
          replacementValue = replacementObject.modifiedLevel ?? replacementObject;
        }

        fullFormula = fullFormula.replace(new RegExp(key, "g"), replacementValue);
      }
    }

    return fullFormula;
  }

  getMinDamage() {
    const formula = this.getFullResolvedFormula();

    if (formula.length > 0) {
      const formulaWithoutDice = this._getFormulaWithoutDice(formula, "min");
      return this._evaluate(formulaWithoutDice);
    }

    return 0;
  }

  getMeanDamage() {
    const formula = this.getFullResolvedFormula();

    if (formula.length > 0) {
      const formulaWithoutDice = this._getFormulaWithoutDice(formula, "mean");
      return this._evaluate(formulaWithoutDice);
    }

    return 0;
  }

  getMaxDamage() {
    const formula = this.getFullResolvedFormula();

    if (formula.length > 0) {
      const formulaWithoutDice = this._getFormulaWithoutDice(formula, "max");
      return this._evaluate(formulaWithoutDice);
    }

    return 0;
  }

  _getFormulaWithoutDice(formula, replacementType) {
    const matches = formula.matchAll(this.rgxDice);

    let formulaWithoutDice = "";
    let lastIndex = 0;
    for (const match of matches) {
      let n = 0;
      if (replacementType === "min") {
        n = parseInt(match.groups.count);
      } else if (replacementType === "mean") {
        n = parseInt(match.groups.count) * (parseInt(match.groups.faces) / 2);
      } else if (replacementType === "max") {
        n = parseInt(match.groups.count) * parseInt(match.groups.faces);
      }

      formulaWithoutDice = `${formulaWithoutDice}${formula.substring(lastIndex, match.index)}${n}`;
      lastIndex = match.index + match[0].length;
    }
    return `${formulaWithoutDice}${formula.substring(lastIndex)}`;
  }
  
  /**
   * 
   * @param {String} formula 
   * 
   * @returns {Number}
   * 
   * @private
   */
  _evaluate(formula) {
    return eval(formula);
  }
}
