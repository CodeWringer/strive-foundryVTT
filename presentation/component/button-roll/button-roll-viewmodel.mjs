import ButtonViewModel from "../button/button-viewmodel.mjs";
import { RollResult } from "../../../business/dice/roll-result.mjs";
import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import { RollSchema } from "../../../business/dice/roll-schema.mjs";

/**
 * A button that allows performing a dice roll and then sending the result to the chat. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {RollSchema} rollSchema Determines which dice, how many and how they will be rolled. 
 * @property {String} primaryChatTitle Primary title to display above the roll result in the chat message. 
 * @property {String} primaryChatImage Primary image to display above the roll result in the chat message. 
 * @property {String} secondaryChatTitle Primary title to display above the roll result in the chat message. 
 * @property {String} secondaryChatImage Primary image to display above the roll result in the chat message. 
 * @property {Actor | undefined} actor Actor associated with the roll result. 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: RollResult | Object` - The rolled result. 
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
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.localizedLabel A localized text to 
   * display as a button label. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: RollResult | Object` - The rolled result. 
   * 
   * @param {TransientDocument | Object} args.target The target object to affect. 
   * @param {RollSchema} args.rollSchema Determines which dice, how many and how they will be rolled. 
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
    ValidationUtil.validateOrThrow(args, ["target", "rollSchema"]);

    this.target = args.target;
    this.rollSchema = args.rollSchema;
    this.primaryChatTitle = args.primaryChatTitle;
    this.primaryChatImage = args.primaryChatImage;
    this.secondaryChatTitle = args.secondaryChatTitle;
    this.secondaryChatImage = args.secondaryChatImage;
    this._actor = args.actor;
    this.localizedToolTip = args.localizedToolTip ?? game.i18n.localize("system.roll.doRoll");
  }

  /**
   * @param {Event} event
   * 
   * @returns {RollResult | Object} The rolled result. 
   * 
   * @async
   * @protected
   * @override
   */
  async _onClick(event) {
    if (this.isEditable !== true) return;

    const queried = await this.rollSchema.queryRollData(this.target);

    if (ValidationUtil.isDefined(queried) === false) return; // User canceled. 

    const rollData = await this.rollSchema.getRollData(this.target, queried);
    const rollResult = await rollData.roll();
    await rollResult.sendToChat({
      visibilityMode: queried.visbilityMode,
      actor: this.actor,
      primaryTitle: this.primaryChatTitle,
      primaryImage: this.primaryChatImage,
      secondaryTitle: this.secondaryChatTitle,
      secondaryImage: this.secondaryChatImage,
    });
    return rollResult;
  }
}
