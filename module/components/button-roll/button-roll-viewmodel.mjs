import { TEMPLATES } from "../../templatePreloader.mjs";
import * as ChatUtil from "../../utils/chat-utility.mjs";
import * as DiceUtil from "../../utils/dice-utility.mjs";
import * as PropUtil from "../../utils/property-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";

/**
 * --- Inherited from ViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {String} id Optional. Id used for the HTML element's id and name attributes. 
 * @property {String} TEMPLATE Static. Returns the template this ViewModel is intended for. 
 * 
 * --- Inherited from ButtonViewModel
 * 
 * @property {JQuery | HTMLElement} element The button element on the DOM. 
 * @property {Object} target The target object to affect.  
 * 
 * --- Own properties
 * 
 * @property {String} propertyPath Property path identifying a property that contains a roll-formula. 
 * @property {CONFIG.rollTypes} rollType Determines the kind of roll to try and make. 
 * @property {String} chatTitle Title to display above the roll result in the chat message. 
 * @property {Actor | undefined} actor Actor associated with the roll result. 
 * @property {DicePoolResult | Object | undefined} lastRollResult The last rolled result. Or undefined, if no roll has been made, yet. 
 */
export default class ButtonRollViewModel extends ButtonViewModel {
  static get TEMPLATE() { return TEMPLATES.COMPONENT_BUTTON_ROLL; }

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
   * @type {CONFIG.rollTypes}
   * @private
   */
  _rollType = 0;
  /**
   * @type {CONFIG.rollTypes}
   * @readonly
   */
  get rollType() { return this._rollType; }

  /**
   * @type {String}
   * @private
   */
  _chatTitle = undefined;
  /**
   * @type {String}
   * @readonly
   */
  get chatTitle() { return this._chatTitle; }

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

  /**
   * @param {String | undefined} args.id
   * @param {Object} args.target The target object to affect.  
   * @param {Function | undefined} args.callback Defines an asynchronous callback that is invoked upon completion of the button's own callback. 
   * @param {Any} args.callbackData Defines any data to pass to the completion callback. 
   * 
   * @param {String} args.propertyPath Property path identifying a property that contains a roll-formula. 
   * @param {CONFIG.rollTypes} args.rollType Determines the kind of roll to try and make. 
   * @param {String | undefined} args.chatTitle Title to display above the roll result in the chat message. 
   * @param {Actor | undefined} args.actor Actor associated with the roll result. 
   */
  constructor(args = {}) {
    super(args);
    this._propertyPath = args.propertyPath;
    this._rollType = args.rollType;
    this._chatTitle = args.chatTitle ?? "";
    this._actor = args.actor;

    // Wrap the inherited callback. 
    // Without wrapping the original callback, it would be impossible 
    // to both pass in the roll result, as well as the original callback data. 
    const callbackToWrap = this.callback;
    this.callback = () => { callbackToWrap(this.lastRollResult, args.callbackData) };
  }

  /**
   * @override
   * @see {ButtonViewModel.onClick}
   * @async
   * @throws {Error} InvalidStateException - Thrown if the rollType is unrecognized. 
   */
  async onClick(html, isOwner, isEditable) {
    if (isOwner !== true) return;

    if (this.rollType === game.ambersteel.config.rollTypes.generic) {
      const dialogResult = await ChatUtil.queryVisibilityMode();
      if (!dialogResult.confirmed) return;
  
      const propertyValue = PropUtil.getNestedPropertyValue(this.target, this.propertyPath);
  
      // Do roll. 
      const roll = new Roll(propertyValue);
      const rollResult = await roll.evaluate({ async: true });
      this._lastRollResult = rollResult;
    
      // Display roll result. 
      const renderedContent = await roll.render();
      await ChatUtil.sendToChat({
        renderedContent: renderedContent,
        flavor: this.chatTitle,
        actor: this.actor,
        sound: DiceUtil.DICE_ROLL_SOUND,
        visibilityMode: dialogResult.visibilityMode
      });
    } else if (this.rollType === game.ambersteel.config.rollTypes.dicePool) {
      const dialogResult = await DiceUtil.queryRollData();
      if (!dialogResult.confirmed) return;
  
      const numberOfDice = parseInt(PropUtil.getNestedPropertyValue(this.target, this.propertyPath));
  
      // Do roll. 
      const rollResult = await DiceUtil.rollDicePool({
        numberOfDice: numberOfDice, 
        obstacle: dialogResult.obstacle,
        bonusDice: dialogResult.bonusDice,
      });
      this._lastRollResult = rollResult;
  
      // Display roll result. 
      await DiceUtil.sendDiceResultToChat({
        rollResult: rollResult,
        flavor: this.chatTitle,
        actor: this.actor,
        visibilityMode: dialogResult.visibilityMode
      });
    } else {
      throw new Error(`InvalidStateException: Invalid rollType '${this.rollType}'`);
    }
  }
}

Handlebars.registerHelper('createButtonRollViewModel', function(target, propertyPath, rollType, chatTitle, actor, callback, callbackData) {
  const vm = new ButtonRollViewModel({
    target: target,
    propertyPath: propertyPath,
    rollType: rollType,
    chatTitle: chatTitle,
    actor: actor,
    callback: callback,
    callbackData: callbackData,
  });
  
  // Add new view model instance to global collection. 
  game.ambersteel.viewModels.set(vm.id, vm);
  
  return vm;
});
Handlebars.registerPartial('_buttonRoll', `{{#> "${ButtonRollViewModel.TEMPLATE}"}}{{/"${ButtonRollViewModel.TEMPLATE}"}}`);
Handlebars.registerPartial('buttonRoll', `{{> _buttonRoll vm=(createButtonRollViewModel target propertyPath rollType chatTitle actor callback callbackData) cssClass=(isDefined cssClass "") }}`);
