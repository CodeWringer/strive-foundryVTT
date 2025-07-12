import { VISIBILITY_MODES } from "../../presentation/chat/visibility-modes.mjs";
import DynamicInputDefinition from "../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-definition.mjs";
import DynamicInputDialog from "../../presentation/dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-types.mjs";
import RollData from "./roll-data.mjs";
import RollQueryData from "./roll-query-data.mjs";
import DynamicInputDefinitionDropdown from "../../presentation/dialog/dynamic-input-dialog/input-types/dynamic-input-definition-dropdown.mjs";

/**
 * Defines a schema for rolling dice. 
 * 
 * The intended order of operations is as follows:
 * 1. Query non-inferrable data from the user via `RollSchema.queryRollData`. 
 * 2. Plug the returned data into `RollSchema.getRollData`. 
 * 3. Do the roll via `RollData.roll()`. 
 * 4. And possibly send the result to chat `RollResult.sendToChat()`.
 * 
 * @example
 * ```JS
 *  const rollSchema = new RollSchema();
 *  const queried = await rollSchema.queryRollData(myDocument);
 * 
 *  if (ValidationUtil.isDefined(queried) === false) return; // User canceled. 
 * 
 *  const rollData = await rollSchema.getRollData(myDocument, queried);
 *  const rollResult = await rollData.roll();
 *  await rollResult.sendToChat({
 *    visibilityMode: queried.visbilityMode,
 *    actor: myActor,
 *    primaryTitle: myPrimaryChatTitle,
 *    primaryImage: myPrimaryChatImage,
 *    secondaryTitle: mySecondaryChatTitle,
 *    secondaryImage: mySecondaryChatImage,
 *  });
 * ```
 * 
 * @property {Number} dieFaces The number of faces on a die. 
 * @property {Number} hitThreshold Sets the lower bound of faces that are considered 
 * hits. Any face turning up this number and numbers above, are considered hits. 
 * 
 * @abstract
 */
export class RollSchema {
  /**
   * Internal name of the bonus dice `SumComponent`. 
   * 
   * @type {String}
   * @readonly
   * @static
   */
  static BONUS_DICE_COMPONENT = "bonus";

  /**
   * @type {String}
   * @readonly
   * @protected
   */
  get _nameInputVisibility() { return "inputVisibility"; }

  /**
   * @param {Object} args 
   * @param {Number | undefined} args.dieFaces The number of faces on a die. 
   * * default `6`
   * @param {Number | undefined} args.hitThreshold Sets the lower bound of faces that are considered 
   * hits. Any face turning up this number and numbers above, are considered hits. 
   * * default `5`
   */
  constructor(args = {}) {
    this.dieFaces = args.dieFaces ?? 6;
    this.hitThreshold = args.hitThreshold ?? 5;
  }

  /**
   * Returns the roll data for the given document. 
   * 
   * @param {Any} document 
   * @param {RollQueryData} rollQueryData 
   * 
   * @returns {RollData} 
   * 
   * @abstract
   * @async
   */
  async getRollData(document, rollQueryData) {
    throw new Error("Not implemented");
  }

  /**
   * Prompts the user to enter required non-inferrable data for the roll, 
   * such as the obstacle formula. 
   * 
   * @param {Any} document 
   * 
   * @returns {RollQueryData | undefined} The queried roll data or undefined, 
   * if the user canceled. 
   * 
   * @async
   */
  async queryRollData(document) {
    // Prepare the dialog. 
    // By default, it allows selection of the visibility mode. 
    const dialog = new DynamicInputDialog({
      localizedTitle: game.i18n.localize("system.roll.query"),
      inputDefinitions: [
        new DynamicInputDefinitionDropdown({
          name: this._nameInputVisibility,
          localizedLabel: game.i18n.localize("system.general.messageVisibility.label"),
          required: true,
          defaultValue: VISIBILITY_MODES.asChoices().find(it => it.value === VISIBILITY_MODES.public.name),
          options: VISIBILITY_MODES.asChoices(),
        }),
      ],
    });

    return await this._queryRollData(document, dialog);
  }

  /**
   * Internal abstract method to prompt the user. Is called by `queryRollData`. 
   * 
   * @param {Any} document 
   * @param {DynamicInputDialog} dialog The dialog to extend with required inputs. 
   * 
   * @returns {RollQueryData | undefined} The queried roll data or undefined, 
   * if the user canceled. 
   * 
   * @protected
   * @abstract
   * @async
   */
  async _queryRollData(document, dialog) {
    throw new Error("Not implemented");
  }
}
