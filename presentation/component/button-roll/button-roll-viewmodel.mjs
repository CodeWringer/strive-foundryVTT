import { ROLL_TYPES } from "../../../business/dice/roll-types.mjs";
import { SOUNDS_CONSTANTS } from "../../audio/sounds.mjs";
import { TEMPLATES } from "../../templatePreloader.mjs";
import * as ChatUtil from "../../chat/chat-utility.mjs";
import * as DiceUtil from "../../../business/dice/dice-utility.mjs";
import * as PropUtil from "../../../business/util/property-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import RollDialog from "../../dialog/roll-dialog/roll-dialog.mjs";
import VisibilitySingleChoiceDialog from "../../dialog/visibility-single-choice-dialog/visibility-single-choice-dialog.mjs";

/**
 * A button that allows performing a dice roll and then sending the result to the chat. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {String} propertyPath Property path identifying a property that contains a roll-formula. 
 * @property {RollType} rollType Determines the kind of roll to try and make. 
 * @property {String} primaryChatTitle Primary title to display above the roll result in the chat message. 
 * @property {String} primaryChatImage Primary image to display above the roll result in the chat message. 
 * @property {String} secondaryChatTitle Primary title to display above the roll result in the chat message. 
 * @property {String} secondaryChatImage Primary image to display above the roll result in the chat message. 
 * @property {Actor | undefined} actor Actor associated with the roll result. 
 * @property {DicePoolResult | Object | undefined} lastRollResult The last rolled result. Or undefined, if no roll has been made, yet. 
 */
export default class ButtonRollViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_ROLL; }

  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonRoll', `{{> "${ButtonRollViewModel.TEMPLATE}"}}`);
  }

  /**
   * @type {String}
   * @private
   */
  _propertyPath = undefined;
  /**
   * @type {String}
   * @readonly
   */
  get propertyPath() { return this._propertyPath; }

  /**
   * @type {RollType}
   * @private
   */
  _rollType = 0;
  /**
   * The internal name of a `RollType`. 
   * 
   * @type {String}
   * @readonly
   */
  get rollType() { return this._rollType; }

  /**
   * @type {Actor | undefined}
   * @private
   */
  _actor = undefined;
  /**
   * @type {Actor | undefined}
   * @readonly
   */
  get actor() { return this._actor; }

  /**
   * @type {DicePoolResult | Object | undefined}
   * @private
   */
  _lastRollResult = undefined;
  /**
   * Returns the last rolled result. Or returns undefined, if no roll has been made, yet. 
   * @type {DicePoolResult | undefined}
   * @readonly
   */
  get lastRollResult() { return this._lastRollResult; }

  /** @override */
  get callbackData() { return this.lastRollResult; }

  /**
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * 
   * @param {TransientDocument | Object} args.target The target object to affect. 
   * @param {Function | String | undefined} args.callback Optional. Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * 
   * @param {String} args.rollType The internal name of a `RollType` that Determines the kind of roll to try and make. 
   * @param {String | undefined} args.propertyPath Optional. Property path identifying a property that contains a roll-formula. 
   * IMPORTANT: If this argument is left undefined, then the target object MUST define a method 'getRollData()', which returns a {SummedData} instance. 
   * @param {String | undefined} primaryChatTitle Primary title to display above the roll result in the chat message. 
   * @param {String | undefined} primaryChatImage Primary image to display above the roll result in the chat message. 
   * @param {String | undefined} secondaryChatTitle Primary title to display above the roll result in the chat message. 
   * @param {String | undefined} secondaryChatImage Primary image to display above the roll result in the chat message. 
   * @param {Actor | undefined} args.actor Optional. Actor associated with the roll result. 
   * @param {String | undefined} args.localizableTitle Optional. The localizable title (tooltip). 
   */
  constructor(args = {}) {
    super(args);
    validateOrThrow(args, ["target", "rollType"]);

    this._propertyPath = args.propertyPath;
    this._rollType = args.rollType;
    this.primaryChatTitle = args.primaryChatTitle;
    this.primaryChatImage = args.primaryChatImage;
    this.secondaryChatTitle = args.secondaryChatTitle;
    this.secondaryChatImage = args.secondaryChatImage;
    this._actor = args.actor;
    this.localizableTitle = args.localizableTitle ?? "ambersteel.roll.doRoll";
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   * @throws {Error} InvalidStateException - Thrown, if the rollType is unrecognized. 
   * @throws {Error} InvalidStateException - Thrown, if the rollType is 'generic' and the property path
   * is undefined. 
   * @throws {Error} InvalidStateException - Thrown, if the property path is undefined and there is no 
   * 'getRollData()' method defined on the target object. 
   */
  async onClick(html, isOwner, isEditable) {
    if (isEditable !== true) return;

    if (this.rollType === ROLL_TYPES.generic.name) {
      if (this.propertyPath === undefined) {
        throw new Error("InvalidStateException: For roll-type 'generic', a property path MUST be provided");
      }

      await new VisibilitySingleChoiceDialog({
        closeCallback: async (dialog) => {
          if (dialog.confirmed !== true) return;
      
          const propertyValue = PropUtil.getNestedPropertyValue(this.target, this.propertyPath);
          // Do roll. 
          const roll = new Roll(propertyValue);
          const rollResult = await roll.evaluate({ async: true });
          this._lastRollResult = rollResult;
    
          // Display roll result. 
          const renderedContent = await roll.render();
          await ChatUtil.sendToChat({
            renderedContent: renderedContent,
            flavor: this.primaryChatTitle,
            actor: this.actor,
            sound: SOUNDS_CONSTANTS.DICE_ROLL,
            visibilityMode: dialog.visibilityMode
          });
        },
      }).renderAndAwait(true);
    } else if (this.rollType === ROLL_TYPES.dicePool.name) {
      const thiz = this;

      await new RollDialog({
        closeCallback: async (dialog) => {
          if (dialog.confirmed !== true) return;

          let numberOfDice = 0;
          let diceComposition = undefined;
    
          if (thiz.propertyPath === undefined) {
            if (thiz.target.getRollData === undefined) {
              throw new Error("InvalidStateException: Neither 'propertyPath' nor 'getRollData()' is defined");
            }
    
            const rollData = thiz.target.getRollData();
            numberOfDice = rollData.total;
            diceComposition = thiz._getJoinedDiceComposition(rollData, dialog.bonusDice ?? 0);
          } else {
            const propertyValue = PropUtil.getNestedPropertyValue(thiz.target, thiz.propertyPath);
            numberOfDice = parseInt(propertyValue);
          }
      
          // Do roll. 
          const rollResult = await DiceUtil.rollDicePool({
            numberOfDice: numberOfDice, 
            obstacle: dialog.obstacle ?? 0,
            bonusDice: dialog.bonusDice ?? 0,
          });
          thiz._lastRollResult = rollResult;
      
          // Display roll result. 
          await DiceUtil.sendDiceResultToChat({
            rollResult: rollResult,
            primaryTitle: thiz.primaryChatTitle,
            primaryImage: thiz.primaryChatImage,
            secondaryTitle: thiz.secondaryChatTitle,
            secondaryImage: thiz.secondaryChatImage,
            actor: thiz.actor,
            visibilityMode: dialog.visibilityMode,
            diceComposition: diceComposition,
          });
        }
      }).renderAndAwait(true);
    } else {
      throw new Error(`InvalidStateException: Invalid rollType '${this.rollType}'`);
    }
  }

  /**
   * @param {SummedData} rollData 
   * @param {Number | String} bonusDice 
   * @returns {String} The joined and comma-separated dice component strings. 
   * @async
   */
  _getJoinedDiceComposition(rollData, bonusDice) {
    let joinedRollData = "";
    for (const entry of rollData.components) {
      joinedRollData = `${joinedRollData}${entry.value} ${game.i18n.localize(entry.localizableName)}, `
    }
    joinedRollData = `${joinedRollData}${bonusDice} ${game.i18n.localize("ambersteel.roll.bonusDice")}`;

    return `(${joinedRollData})`;
  }
}
