import { StringUtil } from "../../../../common/util/string-utility.mjs";
import { ValidationUtil } from "../../../../common/util/validation-utility.mjs";
import DynamicComponent from "../../../../presentation/application/component/dynamic-component/dynamic-component.mjs";
import InputDropDownViewModel from "../../../../presentation/application/component/input-choice/input-dropdown/input-dropdown-viewmodel.mjs";
import RowViewModel from "../../../../presentation/application/component/row/row-viewmodel.mjs";
import ConfirmableModalDialog from "../../../../presentation/application/dialog/confirmable-modal-dialog/confirmable-modal-dialog.mjs";
import Document from "../../document/document.mjs";
import { VISIBILITY_MODES } from "../const/visibility-modes.mjs";
import RollData from "./roll-data.mjs"
import RollQueryData from "./roll-query-data.mjs"

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
 *  const queried = await rollSchema.queryRollData();
 * 
 *  if (!ValidationUtil.isDefined(queried)) return; // User canceled. 
 * 
 *  const rollData = await rollSchema.getRollData(queried);
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
 * @abstract Inheritors **must** implement:
 * * `getRollData()`
 * * `getAvailableDiceComponents()`
 * * `getAvailableDiceComponentExplanation()`
 * * `_queryRollData()`
 */
export class RollSchema {
  /**
   * Internal name of the modify dice `SumComponent`. 
   * 
   * @type {String}
   * @readonly
   * @static
   */
  static MODIFY_DICE_COMPONENT = "modify";

  /**
   * @type {String}
   * @readonly
   * @protected
   */
  get _nameInputVisibility() { return "inputVisibility"; }

  /**
   * @param {Object} args 
   * @param {Document} args.document
   * @param {Number | undefined} args.dieFaces The number of faces on a die. 
   * * default `6`
   * @param {Number | undefined} args.hitThreshold Sets the lower bound of faces that are considered 
   * hits. Any face turning up this number and numbers above, are considered hits. 
   * * default `5`
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["document"]);

    this.document = args.document;
    this.dieFaces = args.dieFaces ?? 6;
    this.hitThreshold = args.hitThreshold ?? 5;
  }

  /**
   * Returns the roll data for the document. 
   * 
   * @param {RollQueryData} rollQueryData 
   * 
   * @returns {Promise<RollData>} 
   * 
   * @abstract
   * @async
   */
  async getRollData(rollQueryData) {
    throw new Error("Not implemented");
  }

  /**
   * Prompts the user to enter required non-inferrable data for the roll, 
   * such as the obstacle formula. 
   * 
   * @returns {Promise<RollQueryData | undefined>} The queried roll data or undefined, 
   * if the user canceled. 
   * 
   * @async
   */
  async queryRollData() {
    // Prepare the dialog. 
    // By default, it allows selection of the visibility mode. 
    const dialog = new ConfirmableModalDialog({
      title: StringUtil.getLoca("system.general.roll.query"),
      easyDismissal: true,
      sections: [
        new DynamicComponent({
          template: RowViewModel.TEMPLATE,
          cssClass: "grid-2col",
          viewModelFactory: (parent) => new RowViewModel({
            parent: parent,
            sections: [
              new DynamicComponent({
                html: `<p>${StringUtil.getLoca("system.general.messageVisibility.visibility")}</p>`
              }),
              new DynamicComponent({
                template: InputDropDownViewModel.TEMPLATE,
                viewModelFactory: (parent) => new InputDropDownViewModel({
                  id: "visibility",
                  parent: parent,
                  value: VISIBILITY_MODES.asChoices().find(it => it.value === VISIBILITY_MODES.public.name),
                  options: VISIBILITY_MODES.asChoices(),
                }),
              }),
            ],
          }),
        }),
      ],
    });

    return await this._queryRollData(dialog);
  }

  /**
   * Returns a sum of dice components representing all possible combinations 
   * a user may choose from when rolling. 
   * 
   * @returns {Array<Sum>}
   */
  getAvailableDiceComponents() {
    throw new Error("Not implemented");
  }

  /**
   * Returns an explanation of how the dice availabilites came to be. 
   * 
   * @returns {String}
   */
  getAvailableDiceComponentExplanation() {
    throw new Error("Not implemented");
  }

  /**
   * Internal abstract method to prompt the user. Is called by `queryRollData`. 
   * 
   * @param {DynamicInputDialog} dialog The dialog to extend with required inputs. 
   * 
   * @returns {Promise<RollQueryData | undefined>} The queried roll data or undefined, 
   * if the user canceled. 
   * 
   * @protected
   * @abstract
   * @async
   */
  async _queryRollData(dialog) {
    throw new Error("Not implemented");
  }
}
