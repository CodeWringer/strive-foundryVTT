import * as ChatUtil from "../../chat/chat-utility.mjs";
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ButtonViewModel from "../button/button-viewmodel.mjs";
import { VISIBILITY_MODES } from "../../chat/visibility-modes.mjs";
import DynamicInputDialog from "../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs";
import DynamicInputDefinition from "../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs";
import { DYNAMIC_INPUT_TYPES } from "../../dialog/dynamic-input-dialog/dynamic-input-types.mjs";

/**
 * A button that allows sending a document or one of its properties to the chat. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {String | undefined} propertyPath Property path identifying a property to send to chat. 
 * @property {String} chatTitle Title to display above the chat message. 
 * @property {Actor | undefined} actor Actor associated with the chat message. 
 * 
 * @method onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
 * * `event: Event`
 * * `data: undefined`
 */
export default class ButtonSendToChatViewModel extends ButtonViewModel {
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonSendToChat', `{{> "${ButtonSendToChatViewModel.TEMPLATE}"}}`);
  }

  /**
   * @type {String | undefined}
   * @private
   */
  _propertyPath = undefined;
  /**
   * @type {String | undefined}
   * @readonly
   */
  get propertyPath() { return this._propertyPath; }

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
   * @param {Object} args
   * @param {String | undefined} args.id Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable If true, will be interactible. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @param {String | undefined} args.localizedLabel A localized text to 
   * display as a button label. 
   * @param {Function | undefined} args.onClick Asynchronous callback that is invoked when the button is clicked. Arguments: 
   * * `event: Event`
   * * `data: undefined`
   * 
   * @param {String | undefined} args.propertyPath Property path identifying a property to send to chat. 
   * @param {String | undefined} args.chatTitle Title to display above the chat message. 
   * @param {Actor | undefined} args.actor Actor associated with the chat message. 
   * @param {String | undefined} args.localizedTooltip Localized tooltip. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="fas fa-comments"></i>',
    });
    validateOrThrow(args, ["target"]);

    this.target = args.target;
    this._propertyPath = args.propertyPath;
    this._chatTitle = args.chatTitle ?? "";
    this._actor = args.actor;
    this.localizedTooltip = args.localizedTooltip ?? game.i18n.localize("system.general.sendToChat");
  }

  /**
   * @param {Event} event
   * 
   * @async
   * @protected
   * @override
   */
  async _onClick(event) {
    if (this.isEditable !== true) return;

    const nameInputVisibility = "nameInputVisibility";

    const dialog = await new DynamicInputDialog({
      localizedTitle: game.i18n.localize("system.roll.query"),
      inputDefinitions: [
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
          name: nameInputVisibility,
          localizedLabel: game.i18n.localize("system.general.messageVisibility.label"),
          required: true,
          defaultValue: VISIBILITY_MODES.asChoices().find(it => it.value === VISIBILITY_MODES.public.name),
          specificArgs: {
            options: VISIBILITY_MODES.asChoices(),
          }
        }),
      ],
    }).renderAndAwait(true);
    
    if (dialog.confirmed !== true) return;

    const visibilityMode = VISIBILITY_MODES.asArray().find(it => it.name === dialog[nameInputVisibility].value);
    
    if (this.propertyPath !== undefined) {
      if (this.target.sendPropertyToChat !== undefined) {
        this.target.sendPropertyToChat(this.propertyPath, visibilityMode);
      } else {
        ChatUtil.sendPropertyToChat({
          obj: this.target,
          propertyPath: this.propertyPath,
          parent: this.target,
          actor: this.actor,
          visibilityMode: visibilityMode
        });
      }
    } else {
      if (this.target.sendToChat !== undefined) {
        this.target.sendToChat(visibilityMode);
      } else {
        ChatUtil.sendPropertyToChat({
          obj: this.target,
          propertyPath: this.propertyPath,
          parent: this.target,
          actor: this.actor,
          visibilityMode: visibilityMode
        });
      }
    }
  }
}
