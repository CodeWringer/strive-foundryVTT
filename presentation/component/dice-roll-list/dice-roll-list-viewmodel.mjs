import { REGEX_PATTERN_PROPERTY_PATHS } from "../../../business/document/transient-document.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import { SOUNDS_CONSTANTS } from "../../audio/sounds.mjs";
import * as ChatUtil from "../../chat/chat-utility.mjs";
import { VISIBILITY_MODES } from "../../chat/visibility-modes.mjs";
import DynamicInputDefinition from "../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import ChoiceAdapter from "../input-choice/choice-adapter.mjs";

/**
 * A button that allows performing a dice roll and then sending the result to the chat. 
 * 
 * @extends ViewModel
 * 
 * @property {Array<ViewModel>} formulaViewModels View model instances of formula list items. 
 * * These view models **must** expose a function named `resolveFormula`, which returns a `String`, 
 * that represents a fully resolved and rollable formula. E. g. `"5D5 + 2"`. 
 * * Read-only. 
 * @property {String} formulaListItemTemplate Template of the formula list item. 
 * @property {String} chatMessageTemplate Template of the results chat message. 
 * @property {String | undefined} chatTitle Title to display above the chat message. 
 */
export default class DiceRollListViewModel extends ViewModel {
  static get TEMPLATE() { return TEMPLATES.DICE_ROLL_LIST; }
  
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
  */
 static registerHandlebarsPartial() {
    Handlebars.registerPartial('diceRollList', `{{> "${DiceRollListViewModel.TEMPLATE}"}}`);
  }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Array<ViewModel>} args.formulaViewModels View model instances of formula list items. 
   * * These view models **must** expose a function named `resolveFormula`, which returns a `String`, 
   * which represents a roll formula. E. g. `"5D5 + 2"` or e. g. `"@SI + 5D3"`. 
   * * These view models *should* expose a property named `localizedLabel`, which returns a `String`,
   * which represents the localized label of the roll total. 
   * @param {String} args.formulaListItemTemplate Template of the formula list item. 
   * @param {String} args.chatMessageTemplate Template of the results chat message. 
   * @param {String | undefined} args.chatTitle Title to display above the chat message. 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["formulaViewModels", "formulaListItemTemplate", "chatMessageTemplate"]);

    this.formulaViewModels = args.formulaViewModels;
    this.formulaListItemTemplate = args.formulaListItemTemplate;
    this.chatMessageTemplate = args.chatMessageTemplate;
    this.chatTitle = args.chatTitle;

    const thiz = this;
    
    this.vmBtnRoll = new ButtonViewModel({
      id: "vmBtnRoll",
      parent: thiz,
      isEditable: thiz.isEditable,
      localizableTitle: "ambersteel.roll.doRoll",
      onClick: async (html, isOwner, isEditable) => {

        const formulae = this._getFormulae(thiz.formulaViewModels);

        const unresolvedReferences = this._getUnresolvedReferences(formulae);

        const inputNameVisibility = "inputVisibility";

        const inputDefinitions = this._getDynamicDialogInputDefinitions(unresolvedReferences, inputNameVisibility);

        // Render the dialog and prompt the user to enter unresolved references.
        const dialog = await new DynamicInputDialog({
          localizedTitle: game.i18n.localize("ambersteel.roll.query"),
          inputDefinitions: inputDefinitions,
        }).renderAndAwait(true);

        if (dialog.confirmed !== true) return;

        // Aggregate the now resolved references. 
        const userResolvedReferences = new Map();
        unresolvedReferences.forEach(reference => {
          userResolvedReferences.set(reference, dialog[reference]);
        });

        // Evaluate the rolls. 
        const rolls = await this._evaluateAndResolveRolls(formulae, userResolvedReferences);

        // Render the results. 
        const renderedContent = await renderTemplate(thiz.chatMessageTemplate, {
          title: thiz.chatTitle,
          rolls: rolls,
        });
        const visibilityMode = VISIBILITY_MODES.asArray.find(it => it.name === dialog[inputNameVisibility]);

        return ChatUtil.sendToChat({
          renderedContent: renderedContent,
          sound: SOUNDS_CONSTANTS.DICE_ROLL,
          visibilityMode: visibilityMode,
        });
      },
    });
  }

  /**
   * Returns any as yet unresolved '@'-references returned by the formula view models. 
   * 
   * @param {Array<FormulaAndLabel>} formulae An array of formulae. 
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
      const unresolvedReferencesOfFormula = formula.formula.match(REGEX_PATTERN_PROPERTY_PATHS);
      if (unresolvedReferencesOfFormula !== undefined && unresolvedReferencesOfFormula !== null) {
        // There are unresolved references. 
        unresolvedReferencesOfFormula.forEach(unresolvedReferenceOfFormula => {
          const lowerCaseUnresolvedReference = unresolvedReferenceOfFormula.toLowerCase();
          if (unresolvedReferences.find(it => it == lowerCaseUnresolvedReference) === undefined) {
            // Include the same unresolved reference only once. 
            const referenceWithoutAt = lowerCaseUnresolvedReference.substring(1);
            unresolvedReferences.push(referenceWithoutAt);
          }
        });
      }
    }
    return unresolvedReferences;
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
        type: DYNAMIC_INPUT_TYPES.LABEL,
        name: "promptUnresolvedReferences",
        localizableLabel: "ambersteel.damageDefinition.unresolvedReferences",
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
        name: inputNameVisibility,
        localizableLabel: "ambersteel.general.messageVisibility.label",
        required: true,
        defaultValue: (VISIBILITY_MODES.asArray[0]),
        specificArgs: {
          options: VISIBILITY_MODES.asChoices,
          adapter: new ChoiceAdapter({
            toChoiceOption: (obj) => { return VISIBILITY_MODES.asChoices.find(it => it.value === obj.name); },
            fromChoiceOption: (choice) => { return VISIBILITY_MODES.asArray.find(it => it.name === choice.value); }
          }),
        }
      }),
    ];

    // Insert dynamic input text fields for every unresolved reference. 
    // These are inserted backwards so they're presented to the user in the same 
    // order that they were found in the formulae. 
    for (let i = unresolvedReferences.length - 1; i >= 0; i--) {
      const unresolvedReference = unresolvedReferences[i];
      inputDefinitions.splice(1, 0, new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
        name: unresolvedReference,
        localizableLabel: unresolvedReference,
        required: true,
        defaultValue: "",
        specificArgs: {
          placeholder: "ambersteel.damageDefinition.infoPlainFormulae"
        }
      }));
    }

    return inputDefinitions;
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
   */
  _resolveReferences(formula, userResolvedReferences) {
    let resolvedFormula = formula;
    for (const [key, value] of userResolvedReferences) {
      const regExpReplace = new RegExp(`@${key}`, "gi");
      resolvedFormula = resolvedFormula.replace(regExpReplace, value);
    }
    return resolvedFormula;
  }

  /**
   * Returns an array of collected formulae and their localized label. 
   * 
   * @param {Array<Object>} formulaContainers An array of objects that implement a `resolveFormula` method. 
   * 
   * @returns {Array<FormulaAndLabel>} An array of collected formulae and their localized label. 
   * 
   * @private
   */
  _getFormulae(formulaContainers) {
    const formulae = [];
    for (const formulaContainer of formulaContainers) {
      // This formula may still contain unresolved references.
      const formula = formulaContainer.resolveFormula();
      formulae.push(new FormulaAndLabel({
        formula: formula,
        localizedLabel: formulaContainer.localizedLabel
      }));
    }
    return formulae;
  }

  /**
   * Resolves and then returns the given formulae. 
   * 
   * @param {Array<FormulaAndLabel>} formulae 
   * @param {Map<String, String>} userResolvedReferences 
   * 
   * @returns {Array<Object>}
   * 
   * @async
   * @private
   */
  async _evaluateAndResolveRolls(formulae, userResolvedReferences) {
    const rolls = [];
    for (const formula of formulae) {
      // Resolve and evaluate the roll formula. 
      const resolvedFormula = this._resolveReferences(formula.formula, userResolvedReferences);
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
      }));
    }
    return rolls;
  }
}

/**
 * Represents a formula and a localized label. 
 * 
 * @property {String} formula A formula. 
 * @property {String} localizedLabel A corresponding localized text. 
 */
class FormulaAndLabel {
  /**
   * 
   * @param {Object} args 
   * @param {String} args.formula A formula. 
   * @param {String} args.localizedLabel A corresponding localized text. 
   */
  constructor(args = {}) {
    this.formula = args.formula;
    this.localizedLabel = args.localizedLabel;
  }
}

/**
 * Represents a fully resolved and evaluated single die result. 
 * 
 * @property {String} value The value. If a die roll was involved, this is the face it yielded. 
 * Otherwise, this may be any other number that is part of the sum. 
 * @property {Boolean} isDiceResult Is `true`, if the value is the result of a die roll. 
 */
class EvaluatedDieResult {
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
 * @property {String} localizedLabel A localized text for display of the result sum. 
 */
class EvaluatedRoll {
  /**
   * @param {Object} args 
   * @param {String} args.formula The original, unresolved formula. 
   * @param {String} args.rollTotal The sum of the roll. 
   * @param {Array<EvaluatedDieResult>} args.diceResults Each individual dice result. 
   * @param {String} args.localizedLabel A localized text for display of the result sum. 
   */
  constructor(args = {}) {
    this.formula = args.formula;
    this.rollTotal = args.rollTotal;
    this.diceResults = args.diceResults;
    this.localizedLabel = args.localizedLabel;
  }
}
