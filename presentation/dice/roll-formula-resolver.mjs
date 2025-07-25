import AtReferencer from "../../business/referencing/at-referencer.mjs";
import { ValidationUtil } from "../../business/util/validation-utility.mjs";
import { VISIBILITY_MODES } from "../chat/visibility-modes.mjs";
import InputDropDownViewModel from "../component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import InputTextFieldViewModel from "../component/input-textfield/input-textfield-viewmodel.mjs";
import DynamicInputDefinition from "../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";

/**
 * Provides a means to fully resolve roll formulae. 
 * 
 * Prompts the user for input, if necessary. 
 */
export default class RollFormulaResolver {
  /**
   * Returns the name of the input for the visibility mode of the dialog. 
   * 
   * @type {String}
   * @readonly
   */
  get inputNameVisibility() { return "inputVisibility"; }

  /**
   * Fully resolves the formulae of the given formula containers and returns them, the picked 
   * visibility mode and the dialog used for user interaction. 
   * 
   * @param {Array<Object>} formulaContainers Object instances containing rollable formulae. 
   * * These objects **must** expose a function named `resolveFormula`, which returns a `String`, 
   * which represents a roll formula. E. g. `"5D5 + 2"` or e. g. `"@SI + 5D3"`. The user will be 
   * prompted to enter a value for any reference that this method doesn't resolve. 
   * * These objects *should* expose a property named `localizedLabel`, which returns a `String`,
   * which represents the localized label of the roll total. 
   * 
   * @returns {Object} Contains the evaluated and resolved rolls, as well as the picked visibility 
   * mode and the dialog.  
   * * {Array<EvaluatedRoll>} rolls
   * * {VISIBILITY_MODES} visibilityMode
   * * {DynamicInputDialog} dialog
   */
  async evaluateFormulae(formulaContainers) {
    const formulae = this._getFormulae(formulaContainers);

    const unresolvedReferences = this._getUnresolvedReferences(formulae);

    const inputDefinitions = this._getDynamicDialogInputDefinitions(unresolvedReferences, this.inputNameVisibility);

    // Render the dialog and prompt the user to enter values for unresolved references.
    const dialog = await new DynamicInputDialog({
      localizedTitle: game.i18n.localize("system.roll.query"),
      inputDefinitions: inputDefinitions,
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return undefined;

    // Aggregate the now (hopefully) resolved references. 
    const userResolvedReferences = new Map();
    unresolvedReferences.forEach(reference => {
      userResolvedReferences.set(reference, dialog[reference]);
    });

    // Evaluate the rolls. 
    const rolls = await this._evaluateAndResolveRolls(formulae, userResolvedReferences);

    return {
      rolls: rolls,
      visibilityMode: VISIBILITY_MODES[dialog[this.inputNameVisibility].value],
      dialog: dialog,
    };
  }

  /**
   * Resolves and then returns the given formulae. 
   * 
   * @param {Array<Formula>} formulae The as yet not fully resolved formulae. 
   * @param {Map<String, String>} userResolvedReferences The user defined values for the 
   * unresolved references. 
   * 
   * @returns {Array<EvaluatedRoll>} An array of fully resolved roll formulae, as well 
   * as their evaluated results. 
   * 
   * @async
   * @private
   */
  async _evaluateAndResolveRolls(formulae, userResolvedReferences) {
    const rgxDiceAndWhitespace = new RegExp("(?<m>(?<dice>\\d+)\\s+(?<d>[dD]))");

    const rolls = [];
    for (const formula of formulae) {
      // Resolve and evaluate the roll formula. 
      let resolvedFormula = this._resolveReferences(formula.formula, userResolvedReferences);

      let hasMatches = false;
      do {
        let match = resolvedFormula.match(rgxDiceAndWhitespace);
        if (ValidationUtil.isDefined(match)) {
          resolvedFormula = `${resolvedFormula.substring(0, match.index)}${match.groups.dice}${match.groups.d}${resolvedFormula.substring(match.index + match.groups.m.length)}`;
          hasMatches = true;
        } else {
          hasMatches = false;
        }
      } while (hasMatches);

      const formulaRollResult = new Roll(resolvedFormula);
      await formulaRollResult.evaluate({ async: true });

      // Get an array of each dice term. 
      const diceResults = [];
      for (const term of formulaRollResult.terms) {
        if (term.values !== undefined) {
          for (const value of term.values) {
            diceResults.push(new EvaluatedDieResult({
              value: value,
              isDiceResult: true,
            }));
          }
        } else {
          diceResults.push(new EvaluatedDieResult({
            value: term.total,
            isDiceResult: false,
          }));
        }
      }

      rolls.push(new EvaluatedRoll({
        formula: formula.formula,
        rollTotal: formulaRollResult.total,
        diceResults: diceResults,
        localizedLabel: formula.localizedLabel,
        iconClass: formula.iconClass,
      }));
    }
    return rolls;
  }

  /**
   * Returns an array of collected formulae and their localized label. 
   * 
   * @param {Array<Object>} formulaContainers An array of objects that implement a `resolveFormula` method. 
   * 
   * @returns {Array<Formula>} An array of collected formulae and their localized label. 
   * 
   * @private
   */
  _getFormulae(formulaContainers) {
    const formulae = [];
    for (const formulaContainer of formulaContainers) {
      // This formula may still contain unresolved references.
      const formula = formulaContainer.resolveFormula();
      formulae.push(new Formula({
        formula: formula,
        localizedLabel: formulaContainer.localizedLabel,
        iconClass: formulaContainer.iconClass,
      }));
    }
    return formulae;
  }

  /**
   * Returns a fully resolved formula, based on the given unresolved formula and the 
   * user input (provided the user entered plain dice formulae and 
   * values and no new '@'-references). 
   * 
   * @param {String} formula The formula that may yet contain '@'-references. 
   * @param {Map<String, String>} userResolvedReferences A map of the unresolved references 
   * and the formula or value the user entered for them. 
   * 
   * @returns {String} A fully resolved formula. 
   * 
   * @private
   */
  _resolveReferences(formula, userResolvedReferences) {
    let resolvedFormula = formula;
    for (const [key, value] of userResolvedReferences) {
      // First round of replacements - this ensures dice formulae are nice and flush, 
      // as otherwise FoundryVTT's dice roller complains. What that means is that 
      // instead of '@SI D4', FoundryVTT requires e. g. '3D4'. White-space between 
      // the number of dice and the 'D' cause an error. 
      resolvedFormula = resolvedFormula.replace(new RegExp(`@${key}\\s*(?=[dD][0-9]+)`, "gi"), value);
      
      // Second round of replacements - this time, the replacement is simple. Assuming 
      // that all 'XDY' statements have been handled, now any other statements, e. g. 
      // '@SI + 3' can be handled. 
      resolvedFormula = resolvedFormula.replace(new RegExp(`@${key}`, "gi"), value);
    }
    return resolvedFormula;
  }

  /**
   * Returns the array of `DynamicInputDefinition`s for use in the dialog. 
   * 
   * Inserts a text field for every given unresolved reference, with the same name, 
   * as the reference. So one can query its value from the dialog in the following way:
   * `dialog[unresolvedReferences[0]]`. 
   * 
   * @param {Array<String>} unresolvedReferences An array of unresolved references. 
   * @param {String} inputNameVisibility Name of the visibility drop down.
   * 
   * @returns {Array<DynamicInputDefinition>} An array of dynamic input definitions. 
   * 
   * @private
   */
  _getDynamicDialogInputDefinitions(unresolvedReferences, inputNameVisibility) {
    const inputDefinitions = [
      new DynamicInputDefinition({
        name: "promptUnresolvedReferences",
        localizedLabel: game.i18n.localize("system.damageDefinition.unresolvedReferences"),
      }),
      new DynamicInputDefinition({
        name: inputNameVisibility,
        localizedLabel: game.i18n.localize("system.general.messageVisibility.label"),
        template: InputDropDownViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputDropDownViewModel({
          id: id,
          parent: parent,
          options: VISIBILITY_MODES.asChoices(),
          value: VISIBILITY_MODES.asChoices().find(it => it.value === VISIBILITY_MODES.public.name),
          ...overrides,
        }),
      }),
    ];

    // Insert dynamic input text fields for every unresolved reference. 
    // These are inserted backwards so they're presented to the user in the same 
    // order that they were found in the formulae. 
    for (let i = unresolvedReferences.length - 1; i >= 0; i--) {
      const unresolvedReference = unresolvedReferences[i];
      inputDefinitions.splice(1, 0, new DynamicInputDefinition({
        name: unresolvedReference,
        localizedLabel: unresolvedReference,
        template: InputTextFieldViewModel.TEMPLATE,
        viewModelFactory: (id, parent, overrides) => new InputTextFieldViewModel({
          id: id,
          parent: parent,
          value: "0",
          ...overrides,
        }),
        required: true,
        validationFunc: (value) => {
          return ValidationUtil.isNotBlankOrUndefined(value) && parseInt(value) !== NaN;
        },
      }));
    }

    return inputDefinitions;
  }

  /**
   * Returns any as yet unresolved '@'-references returned by the formula view models. 
   * 
   * @param {Array<Formula>} formulae An array of formulae. 
   * 
   * @returns {Array<String>} An array of unresolved '@'-references. Returns only 
   * unique entries. Duplicates are culled. The '@'-character is truncated. 
   * 
   * @private
   */
  _getUnresolvedReferences(formulae) {
    const unresolvedReferences = [];
    for (const formula of formulae) {
      // Determine if the string contains any as yet unresolved @-references. 
      const unresolvedReferencesOfFormula = formula.formula.match(AtReferencer.REGEX_PATTERN_AT_REFERENCE);
      if (unresolvedReferencesOfFormula !== undefined && unresolvedReferencesOfFormula !== null) {
        // There are unresolved references. 
        
        unresolvedReferencesOfFormula.forEach(unresolvedReferenceOfFormula => {
          const lowerCaseUnresolvedReference = unresolvedReferenceOfFormula.toLowerCase();
          const referenceWithoutAt = lowerCaseUnresolvedReference.substring(1);

          if (unresolvedReferences.find(it => it == referenceWithoutAt) === undefined) {
            // Include the same unresolved reference only once. 
            unresolvedReferences.push(referenceWithoutAt);
          }
        });
      }
    }
    return unresolvedReferences;
  }
}

/**
 * Represents a formula. 
 * 
 * @property {String} formula A formula. 
 * @property {String | undefined} localizedLabel A corresponding localized text. 
 * @property {String | undefined} iconClass An icon representation. 
 */
export class Formula {
  /**
   * 
   * @param {Object} args 
   * @param {String} args.formula A formula. 
   * @param {String | undefined} args.localizedLabel A corresponding localized text. 
   * @param {String | undefined} args.iconClass An icon representation. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["formula"]);

    this.formula = args.formula;
    this.localizedLabel = args.localizedLabel;
    this.iconClass = args.iconClass;
  }
}

/**
 * Represents a fully resolved and evaluated single die result. 
 * 
 * @property {String} value The value. If a die roll was involved, this is the face it yielded. 
 * Otherwise, this may be any other number that is part of the sum. 
 * @property {Boolean} isDiceResult Is `true`, if the value is the result of a die roll. 
 */
export class EvaluatedDieResult {
  /**
   * @param {Object} args 
   * @param {String} args.value The value. If a die roll was involved, this is the face it yielded. 
   * Otherwise, this may be any other number that is part of the sum. 
   * @param {Boolean} args.isDiceResult Is `true`, if the value is the result of a die roll. 
   */
  constructor(args = {}) {
    this.value = args.value;
    this.isDiceResult = args.isDiceResult;
  }
}

/**
 * Represents a fully resolved and evaluated roll. 
 * 
 * @property {String} formula The original, unresolved formula. 
 * @property {String} rollTotal The sum of the roll. 
 * @property {Array<EvaluatedDieResult>} diceResults Each individual dice result. 
 * @property {String | undefined} localizedLabel A localized text for display of the result sum. 
 * @property {String | undefined} iconClass An icon representation. 
 */
export class EvaluatedRoll {
  /**
   * @param {Object} args 
   * @param {String} args.formula The original, unresolved formula. 
   * @param {String} args.rollTotal The sum of the roll. 
   * @param {Array<EvaluatedDieResult>} args.diceResults Each individual dice result. 
   * @param {String | undefined} args.localizedLabel A localized text for display of the result sum. 
   * @param {String | undefined} args.iconClass An icon representation. 
   */
  constructor(args = {}) {
    this.formula = args.formula;
    this.rollTotal = args.rollTotal;
    this.diceResults = args.diceResults;
    this.localizedLabel = args.localizedLabel;
    this.iconClass = args.iconClass;
  }
}
