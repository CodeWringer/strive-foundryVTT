import { ROLL_TYPES, RollType } from "../../../business/dice/roll-types.mjs";
import { SOUNDS_CONSTANTS } from "../../audio/sounds.mjs";
import * as ChatUtil from "../../chat/chat-utility.mjs";
import * as PropUtil from "../../../business/util/property-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import Ruleset from "../../../business/ruleset/ruleset.mjs";
import DynamicInputDialog from "../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";
import { VISIBILITY_MODES } from "../../chat/visibility-modes.mjs";
import ChoiceAdapter from "../input-choice/choice-adapter.mjs";
import { ROLL_DICE_MODIFIER_TYPES } from "../../../business/dice/roll-dice-modifier-types.mjs";
import DynamicInputDefinition from "../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import { SumComponent } from "../../../business/ruleset/summed-data.mjs";
import DicePool, { DicePoolRollResult } from "../../../business/dice/dice-pool.mjs";

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
 * @property {DicePoolRollResult | Object | undefined} lastRollResult The last rolled result. Or undefined, if no roll has been made, yet. 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: DicePoolRollResult | Object` - The rolled result. 
 */
export default class ButtonRollViewModel extends ButtonViewModel {
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
   * @type {DicePoolRollResult | Object | undefined}
   * @private
   */
  _lastRollResult = undefined;
  /**
   * Returns the last rolled result. Or returns undefined, if no roll has been made, yet. 
   * @type {DicePoolRollResult | undefined}
   * @readonly
   */
  get lastRollResult() { return this._lastRollResult; }

  /** @override */
  get callbackData() { return this.lastRollResult; }

  /**
   * @type {String}
   * @readonly
   * @private
   */
  get inputVisibility() { return "inputVisibility"; }

  /**
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.localizedLabel A localized text to 
   * display as a button label. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: DicePoolRollResult | Object` - The rolled result. 
   * 
   * @param {TransientDocument | Object} args.target The target object to affect. 
   * @param {RollType} args.rollType The internal name of a `RollType` that Determines the kind of roll to try and make.
   * See `ROLL_TYPES` 
   * @param {String | undefined} args.propertyPath Property path identifying a property that contains a roll-formula. 
   * IMPORTANT: If this argument is left undefined, then the target object MUST define a method 'getRollData()', which returns a `Sum` instance. 
   * @param {String | undefined} args.primaryChatTitle Primary title to display above the roll result in the chat message. 
   * @param {String | undefined} args.primaryChatImage Primary image to display above the roll result in the chat message. 
   * @param {String | undefined} args.secondaryChatTitle Primary title to display above the roll result in the chat message. 
   * @param {String | undefined} args.secondaryChatImage Primary image to display above the roll result in the chat message. 
   * @param {Actor | undefined} args.actor  Actor associated with the roll result. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="fas fa-dice-three"></i>',
    });
    validateOrThrow(args, ["target", "rollType"]);

    this.target = args.target;
    this._propertyPath = args.propertyPath;
    this._rollType = args.rollType;
    this.primaryChatTitle = args.primaryChatTitle;
    this.primaryChatImage = args.primaryChatImage;
    this.secondaryChatTitle = args.secondaryChatTitle;
    this.secondaryChatImage = args.secondaryChatImage;
    this._actor = args.actor;
    this.localizedTooltip = args.localizedTooltip ?? game.i18n.localize("system.roll.doRoll");
  }

  /**
   * @param {Event} event
   * 
   * @returns {DicePoolRollResult | Object} The rolled result. 
   * 
   * @throws {Error} InvalidStateException - Thrown, if the rollType is unrecognized. 
   * @throws {Error} InvalidStateException - Thrown, if the rollType is 'generic' and the property path
   * is undefined. 
   * @throws {Error} InvalidStateException - Thrown, if the property path is undefined and there is no 
   * 'getRollData()' method defined on the target object. 
   * 
   * @async
   * @protected
   * @override
   */
  async _onClick(event) {
    if (this.isEditable !== true) return;

    // Prepare the dialog. 
    // By default, it allows selection of the visibility mode. 
    const dialog = new DynamicInputDialog({
      localizedTitle: game.i18n.localize("system.roll.query"),
      inputDefinitions: [
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
          name: this.inputVisibility,
          localizedLabel: game.i18n.localize("system.general.messageVisibility.label"),
          required: true,
          defaultValue: (VISIBILITY_MODES.asArray()[0]),
          specificArgs: {
            options: VISIBILITY_MODES.asChoices(),
            adapter: new ChoiceAdapter({
              toChoiceOption: (obj) => { return VISIBILITY_MODES.asChoices().find(it => it.value === obj.name); },
              fromChoiceOption: (choice) => { return VISIBILITY_MODES.asArray().find(it => it.name === choice.value); }
            }),
          }
        }),
      ],
    });

    if (this.rollType === ROLL_TYPES.generic.name) {
      return await this._doGenericRoll(dialog);
    } else if (this.rollType === ROLL_TYPES.dicePool.name) {
      return await this._doDicePoolRoll(dialog);
    } else {
      throw new Error(`InvalidStateException: Invalid rollType '${this.rollType}'`);
    }
  }

  /**
   * Uses the given dialog to prompt the user for roll data and then performs a generic roll, 
   * if the user confirmed. 
   * 
   * The result is automatically sent to chat. 
   * 
   * 
   * @param {DynamicInputDialog} dialog 
   * 
   * @returns {Object} The rolled result. 
   * 
   * @private
   * @async
   */
  async _doGenericRoll(dialog) {
    if (this.propertyPath === undefined) {
      throw new Error("InvalidStateException: For roll-type 'generic', a property path MUST be provided");
    }

    await dialog.renderAndAwait(true);

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

    return rollResult;
  }

  /**
   * Uses the given dialog to prompt the user for roll data and then performs a dice pool roll, 
   * if the user confirmed. 
   * 
   * The result is automatically sent to chat. 
   * 
   * @param {DynamicInputDialog} dialog 
   * 
   * @returns {DicePoolRollResult} The rolled result. 
   * 
   * @private
   * @async
   */
  async _doDicePoolRoll(dialog) {
    if (this.target.getRollData === undefined) {
      throw new Error("NullPointerException: 'getRollData()' is undefined");
    }

    const rollData = this.target.getRollData();
    const dicePoolForCompositionHint = await new DicePool({
      dice: rollData.components,
      obstacle: 0,
    }).roll();
    const diceComposition = dicePoolForCompositionHint.getJoinedDiceCompositionString();
    
    // Input definitions specific to dice pool rolls. 
    const inputObstacle = "inputObstacle";
    const inputBonusDice = "inputBonusDice";
    const inputRollDiceModifier = "inputRollDiceModifier";

    dialog.inputDefinitions.splice(0, 0, 
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.LABEL,
        name: "diceCompositionLabel",
        localizedLabel: `<p>${game.i18n.localize("system.roll.numberOfDice")}: ${rollData.total}</p><p class="font-size-sm">${diceComposition}</p>`,
        showFancyFont: false,
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.TEXTFIELD,
        name: inputObstacle,
        localizedLabel: game.i18n.localize("system.roll.obstacle.abbreviation"),
        required: true,
        defaultValue: "",
        specificArgs: {
          placeholder: game.i18n.localize("system.roll.obstacle.rollForPlaceholder"),
        },
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.NUMBER_SPINNER,
        name: inputBonusDice,
        localizedLabel: game.i18n.localize("system.roll.bonusDice"),
        required: true,
        defaultValue: 0,
      }),
      new DynamicInputDefinition({
        type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
        name: inputRollDiceModifier,
        localizedLabel: game.i18n.localize("system.roll.diceModifier.plural"),
        required: true,
        defaultValue: (ROLL_DICE_MODIFIER_TYPES.asArray()[0]),
        specificArgs: {
          options: ROLL_DICE_MODIFIER_TYPES.asChoices(),
          adapter: new ChoiceAdapter({
            toChoiceOption: (obj) => { return ROLL_DICE_MODIFIER_TYPES.asChoices().find(it => it.value === obj.name); },
            fromChoiceOption: (choice) => { return ROLL_DICE_MODIFIER_TYPES.asArray().find(it => it.name === choice.value); }
          }),
        }
      }),
    );

    await dialog.renderAndAwait(true);
    if (dialog.confirmed !== true) return;

    // Do roll. 
    const rollResult = await new DicePool({
      dice: rollData.components,
      bonus: [new SumComponent("bonus", "system.roll.bonusDice", parseInt(dialog[inputBonusDice]))],
      obstacle: dialog[inputObstacle],
      modifier: ROLL_DICE_MODIFIER_TYPES.asArray().find(it => it.name === dialog[inputRollDiceModifier]),
    }).roll();

    this._lastRollResult = rollResult;

    // In case of a skill - also determine whether to show this as a backfire. 
    let showBackFire = false;
    if (this.target.type === "skill") {
      // Only consider skills with the "magicSchool" property. 
      if (this.target.isMagicSchool === true) {
        if (new Ruleset().rollCausesBackfire(rollResult) === true) {
          showBackFire = true;
        }
      }
    }

    rollResult.sendToChat({
      visibilityMode: VISIBILITY_MODES.asArray().find(it => it.name === dialog[this.inputVisibility]),
      actor: this.actor,
      primaryTitle: this.primaryChatTitle,
      primaryImage: this.primaryChatImage,
      secondaryTitle: this.secondaryChatTitle,
      secondaryImage: this.secondaryChatImage,
      showBackFire: showBackFire,
    });

    return rollResult;
  }
}
